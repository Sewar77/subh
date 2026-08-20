import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { createWorkshopBookingSchema, createWorkshopSchema } from "../src/validation/workshop.Validation.js";
import { buildWorkshopConfirmationEmail, dispatchWorkshopConfirmationEmail } from "../src/services/email/workshopEmailService.js";
import { assertWorkshopEligibility, confirmOfflineWorkshopPayment, createCustomerWorkshopBooking, markWorkshopAttendance } from "../src/services/workshops/workshopService.js";
import { serializeCustomerBooking, serializePublicWorkshop } from "../src/utils/workshopSerializer.js";

const fixtureSession = { id: 4, workshop_id: 2, starts_at: "2030-01-01T10:00:00.000Z", ends_at: "2030-01-01T12:00:00.000Z", timezone: "UTC", seat_capacity: 20, status: "open", price_override: null, meeting_link: "https://meet.example.invalid/private", venue_name: null, address_line1: null, address_line2: null, city: null, state: null, postal_code: null, country: null, location_instructions: null, title_en: "Teaching", title_ar: "التدريس", mode: "online", price: "25.00", currency_code: "USD", gender_eligibility: "any", min_age: 18, max_age: 70, publication_status: "published", category_name_en: "Training", category_name_ar: "التدريب", presenter_name_en: "Presenter", presenter_name_ar: "المقدم" };
const attendee = { fullName: "Development Attendee", email: "attendee@example.invalid", phone: "+10000000000", age: 25, gender: "female", addressLine1: "1 Test Street", addressLine2: "", city: "Test City", state: "Test State", postalCode: "00000", country: "Test Country" };
const bookingRow = { id: 9, reference_number: "WS-TEST", user_id: 7, workshop_id: 2, session_id: 4, attendee_full_name: attendee.fullName, attendee_email: attendee.email, attendee_phone: attendee.phone, attendee_age: attendee.age, attendee_gender: attendee.gender, address_line1: attendee.addressLine1, address_line2: null, city: attendee.city, state: attendee.state, postal_code: attendee.postalCode, country: attendee.country, workshop_title_en_snapshot: fixtureSession.title_en, workshop_title_ar_snapshot: fixtureSession.title_ar, presenter_name_en_snapshot: fixtureSession.presenter_name_en, presenter_name_ar_snapshot: fixtureSession.presenter_name_ar, category_name_en_snapshot: fixtureSession.category_name_en, category_name_ar_snapshot: fixtureSession.category_name_ar, mode_snapshot: "online", session_starts_at_snapshot: fixtureSession.starts_at, session_ends_at_snapshot: fixtureSession.ends_at, session_timezone_snapshot: "UTC", price_snapshot: "25.00", currency_code: "USD", meeting_link_snapshot: fixtureSession.meeting_link, booking_status: "awaiting_payment", payment_status: "awaiting_payment", attendance_status: "not_marked", created_at: new Date().toISOString(), updated_at: new Date().toISOString() };

const validWorkshop = { titleEn: "Title", titleAr: "العنوان", descriptionEn: "Description", descriptionAr: "الوصف", subjectEn: "Subject", subjectAr: "الموضوع", categoryId: 1, presenterId: 1, durationMinutes: 90, price: "25.00", mode: "online" };
assert.equal(createWorkshopSchema.validate(validWorkshop).error, undefined);
assert.ok(createWorkshopSchema.validate({ ...validWorkshop, price: 25.123 }).error);
assert.ok(createWorkshopSchema.validate({ ...validWorkshop, minAge: 30, maxAge: 20 }).error);
assert.ok(createWorkshopBookingSchema.validate({ ...attendee, userId: 1 }).error);
assert.ok(createWorkshopBookingSchema.validate({ ...attendee, paymentStatus: "paid" }).error);
assert.throws(() => assertWorkshopEligibility({ ...fixtureSession, min_age: 30 }, attendee), /at least/);
assert.throws(() => assertWorkshopEligibility({ ...fixtureSession, gender_eligibility: "male" }, attendee), /gender eligibility/);

const makePool = ({ reserved = 0, failInsert = false } = {}) => {
  const calls = [];
  const client = { release() { calls.push("RELEASE"); }, async query(sql, values = []) { calls.push(sql); if (sql === "BEGIN" || sql === "COMMIT" || sql === "ROLLBACK") return { rows: [] }; if (sql.includes("FROM workshop_sessions s JOIN workshops")) return { rows: [fixtureSession] }; if (sql.includes("WHERE session_id=$1 AND user_id=$2")) return { rows: [] }; if (sql.startsWith("SELECT COUNT(*)")) return { rows: [{ count: reserved }] }; if (sql.includes("INSERT INTO workshop_bookings")) { if (failInsert) throw new Error("simulated persistence failure"); return { rows: [bookingRow] }; } if (sql.includes("INSERT INTO workshop_booking_status_history")) return { rows: [] }; throw new Error(`Unexpected query: ${sql.slice(0, 80)}`); } };
  return { pool: { async connect() { return client; } }, calls };
};

const success = makePool();
const created = await createCustomerWorkshopBooking({ userId: 7, sessionId: 4, attendee }, { dbPool: success.pool });
assert.equal(created.id, 9);
assert.ok(success.calls.some((sql) => sql.includes("FOR UPDATE OF s")), "session row must be locked before counting seats");
assert.ok(success.calls.indexOf("COMMIT") > success.calls.findIndex((sql) => sql.includes("INSERT INTO workshop_bookings")));

const full = makePool({ reserved: 20 });
await assert.rejects(() => createCustomerWorkshopBooking({ userId: 7, sessionId: 4, attendee }, { dbPool: full.pool }), (error) => error.code === "WORKSHOP_SESSION_FULL" && error.status === 409);
assert.ok(full.calls.includes("ROLLBACK"));
assert.ok(!full.calls.some((sql) => sql.includes("INSERT INTO workshop_bookings")));

const failed = makePool({ failInsert: true });
await assert.rejects(() => createCustomerWorkshopBooking({ userId: 7, sessionId: 4, attendee }, { dbPool: failed.pool }), /simulated persistence failure/);
assert.ok(failed.calls.includes("ROLLBACK"));

const makeAdminPool = (row) => {
  const calls = [];
  const client = { release() { calls.push("RELEASE"); }, async query(sql) { calls.push(sql); if (["BEGIN", "COMMIT", "ROLLBACK"].includes(sql)) return { rows: [] }; if (sql.includes("FROM workshop_bookings b WHERE b.id=$1 FOR UPDATE")) return { rows: [row] }; if (sql.includes("INSERT INTO workshop_booking_payments")) return { rows: [{ id: 1, booking_id: row.id, amount: row.price_snapshot }] }; if (sql.includes("UPDATE workshop_bookings SET payment_status")) return { rows: [] }; if (sql.includes("UPDATE workshop_bookings SET booking_status")) return { rows: [{ ...row, booking_status: "confirmed", confirmed_at: new Date().toISOString() }] }; if (sql.includes("INSERT INTO workshop_booking_status_history") || sql.includes("INSERT INTO workshop_notification_outbox")) return { rows: [{ id: 1 }] }; if (sql.includes("UPDATE workshop_bookings SET attendance_status")) return { rows: [{ ...row, attendance_status: "attended" }] }; if (sql.includes("INSERT INTO workshop_attendance_history")) return { rows: [] }; throw new Error(`Unexpected admin query: ${sql.slice(0, 80)}`); } };
  return { pool: { async connect() { return client; } }, calls };
};
const paymentPool = makeAdminPool(bookingRow);
const paymentResult = await confirmOfflineWorkshopPayment({ bookingId: bookingRow.id, adminId: 1, payment: { amount: "25.00", paymentMethod: "cash", paidAt: new Date().toISOString() } }, { dbPool: paymentPool.pool });
assert.equal(paymentResult.booking.booking_status, "confirmed");
assert.ok(paymentPool.calls.some((sql) => sql.includes("workshop_notification_outbox")));
assert.ok(paymentPool.calls.includes("COMMIT"));
await assert.rejects(() => confirmOfflineWorkshopPayment({ bookingId: bookingRow.id, adminId: 1, payment: { amount: "24.00", paymentMethod: "cash", paidAt: new Date().toISOString() } }, { dbPool: makeAdminPool(bookingRow).pool }), (error) => error.code === "PAYMENT_AMOUNT_MISMATCH");

const attendancePool = makeAdminPool({ ...bookingRow, booking_status: "confirmed", session_ends_at_snapshot: "2020-01-01T00:00:00.000Z" });
const attendanceResult = await markWorkshopAttendance({ bookingId: bookingRow.id, adminId: 1, attendanceStatus: "attended" }, { dbPool: attendancePool.pool });
assert.equal(attendanceResult.attendance_status, "attended");
assert.ok(attendancePool.calls.some((sql) => sql.includes("workshop_attendance_history")));
await assert.rejects(() => markWorkshopAttendance({ bookingId: bookingRow.id, adminId: 1, attendanceStatus: "attended" }, { dbPool: makeAdminPool({ ...bookingRow, booking_status: "confirmed", session_ends_at_snapshot: "2035-01-01T00:00:00.000Z" }).pool }), (error) => error.code === "ATTENDANCE_TOO_EARLY");

const beforeConfirmation = serializeCustomerBooking(bookingRow);
assert.equal(Object.hasOwn(beforeConfirmation, "meetingLink"), false);
const afterConfirmation = serializeCustomerBooking({ ...bookingRow, booking_status: "confirmed" });
assert.equal(afterConfirmation.meetingLink, fixtureSession.meeting_link);
const publicWorkshop = serializePublicWorkshop({ id: 2, title: "Teaching", description: "Description", subject: "Subject", mode: "online", price: "25.00", currency_code: "USD", gender_eligibility: "any", category: {}, presenter: {} });
assert.equal(JSON.stringify(publicWorkshop).includes("meeting"), false);

const pendingEmail = { ...bookingRow, booking_id: bookingRow.id, attendee_email: attendee.email, attendee_full_name: attendee.fullName };
const email = buildWorkshopConfirmationEmail(pendingEmail);
assert.ok(email.text.includes(fixtureSession.meeting_link));
let sent = false; let markedSent = false;
const emailResult = await dispatchWorkshopConfirmationEmail(bookingRow.id, { provider: { async send() { sent = true; } }, repository: { async get() { return pendingEmail; }, async sent() { markedSent = true; }, async failed() { throw new Error("should not fail"); } } });
assert.deepEqual(emailResult, { status: "sent" }); assert.equal(sent, true); assert.equal(markedSent, true);

const root = fileURLToPath(new URL("..", import.meta.url));
const [modelSource, routeSource, controllerSource] = await Promise.all([readFile(`${root}/src/models/workshop.Model.js`, "utf8"), readFile(`${root}/src/routes/workshop.Routes.js`, "utf8"), readFile(`${root}/src/controller/workshop.Controller.js`, "utf8")]);
assert.ok(modelSource.includes("WHERE b.id = $1 AND b.user_id = $2"), "customer detail must enforce ownership in SQL");
assert.ok(!modelSource.includes("SELECT *"), "Workshop repository must use explicit SELECT projections");
assert.ok(!modelSource.includes("RETURNING *"), "Workshop repository must use explicit RETURNING projections");
assert.ok(routeSource.includes("const admin = [protect, adminOnly]"));
assert.ok(routeSource.includes("bookingRateLimit"));
assert.ok(controllerSource.indexOf("confirmOfflineWorkshopPayment") < controllerSource.indexOf("setImmediate"), "email dispatch must be scheduled only after payment confirmation succeeds");

console.log("Workshop application verification passed (validation, locking, rollback, ownership, privacy, and mocked email).");
