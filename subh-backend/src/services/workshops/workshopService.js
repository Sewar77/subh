import pool from "../../config/db.js";
import { WORKSHOP_BOOKING_TRANSITIONS } from "../../config/workshop.js";
import { moneyToMinorUnits } from "../../utils/money.js";
import * as repository from "../../models/workshop.Model.js";

const domainError = (code, message, status = 400) => Object.assign(new Error(message), { code, status, publicMessage: message });
const nullable = (value) => typeof value === "string" ? value.trim() || null : value ?? null;
const withTransaction = async (work, dbPool = pool) => {
  const client = await dbPool.connect();
  try { await client.query("BEGIN"); const result = await work(client); await client.query("COMMIT"); return result; }
  catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
};

export const assertWorkshopEligibility = (session, attendee) => {
  if (session.min_age != null && attendee.age < session.min_age) throw domainError("WORKSHOP_MIN_AGE", `Attendee must be at least ${session.min_age} years old`, 422);
  if (session.max_age != null && attendee.age > session.max_age) throw domainError("WORKSHOP_MAX_AGE", `Attendee must be no older than ${session.max_age}`, 422);
  if (session.gender_eligibility !== "any" && attendee.gender !== session.gender_eligibility) throw domainError("WORKSHOP_GENDER_ELIGIBILITY", "Attendee does not meet this Workshop's gender eligibility", 422);
};

const assertSessionDelivery = (mode, data) => {
  if (mode === "online" && !nullable(data.meetingLink)) throw domainError("MEETING_LINK_REQUIRED", "An online session requires a meeting link");
  if (mode === "offline" && (!nullable(data.venueName) || !nullable(data.addressLine1) || !nullable(data.city) || !nullable(data.country))) throw domainError("LOCATION_REQUIRED", "An offline session requires venue and address details");
};

export const createCustomerWorkshopBooking = async ({ userId, sessionId, attendee }, { dbPool = pool } = {}) => withTransaction(async (client) => {
  const session = await repository.lockBookableSession(client, sessionId);
  if (!session || session.publication_status !== "published") throw domainError("WORKSHOP_SESSION_NOT_FOUND", "Workshop session not found", 404);
  if (session.status !== "open" || new Date(session.starts_at) <= new Date()) throw domainError("WORKSHOP_SESSION_CLOSED", "This session is not open for booking", 409);
  assertWorkshopEligibility(session, attendee);
  const existing = await repository.getActiveUserSessionBooking(client, sessionId, userId);
  if (existing) throw domainError("WORKSHOP_BOOKING_EXISTS", "You already have an active booking for this session", 409);
  const reserved = await repository.countReservedSessionSeats(client, sessionId);
  if (reserved >= Number(session.seat_capacity)) throw domainError("WORKSHOP_SESSION_FULL", "This session is full.", 409);
  const locationAddress = [session.address_line1, session.address_line2, session.city, session.state, session.postal_code, session.country].filter(Boolean).join(", ");
  const booking = await repository.insertWorkshopBooking(client, {
    userId, sessionId, workshopId: session.workshop_id, ...attendee,
    titleEn: session.title_en, titleAr: session.title_ar,
    presenterEn: session.presenter_name_en, presenterAr: session.presenter_name_ar,
    categoryEn: session.category_name_en, categoryAr: session.category_name_ar,
    mode: session.mode, startsAt: session.starts_at, endsAt: session.ends_at,
    timezone: session.timezone, price: session.price_override ?? session.price,
    currencyCode: session.currency_code,
    registrationInstructionsEn: session.registration_instructions_en,
    registrationInstructionsAr: session.registration_instructions_ar,
    meetingLink: session.meeting_link,
    venueName: session.venue_name, locationAddress,
    locationInstructions: session.location_instructions,
  });
  await repository.insertBookingHistory(client, { bookingId: booking.id, oldStatus: null, newStatus: "awaiting_payment", changedByUserId: userId, changedByAdminId: null, note: "Booking submitted" });
  return booking;
}, dbPool);

export const changeWorkshopBookingStatus = async ({ bookingId, status, adminId, note }, { dbPool = pool } = {}) => withTransaction(async (client) => {
  const booking = await repository.lockAdminBooking(client, bookingId);
  if (!booking) throw domainError("WORKSHOP_BOOKING_NOT_FOUND", "Workshop booking not found", 404);
  if (!WORKSHOP_BOOKING_TRANSITIONS[booking.booking_status]?.includes(status)) throw domainError("INVALID_BOOKING_TRANSITION", `Cannot change booking from ${booking.booking_status} to ${status}`, 409);
  const updated = await repository.updateBookingStatus(client, bookingId, status);
  await repository.insertBookingHistory(client, { bookingId, oldStatus: booking.booking_status, newStatus: status, changedByUserId: null, changedByAdminId: adminId, note: nullable(note) });
  return updated;
}, dbPool);

export const confirmOfflineWorkshopPayment = async ({ bookingId, adminId, payment }, { dbPool = pool } = {}) => withTransaction(async (client) => {
  const booking = await repository.lockAdminBooking(client, bookingId);
  if (!booking) throw domainError("WORKSHOP_BOOKING_NOT_FOUND", "Workshop booking not found", 404);
  if (!["pending", "awaiting_payment"].includes(booking.booking_status) || booking.payment_status === "paid") throw domainError("PAYMENT_NOT_ALLOWED", "Payment cannot be confirmed for this booking", 409);
  if (moneyToMinorUnits(payment.amount) !== moneyToMinorUnits(booking.price_snapshot)) throw domainError("PAYMENT_AMOUNT_MISMATCH", "Payment amount must match the booking amount", 409);
  const record = await repository.insertWorkshopPayment(client, { bookingId, adminId, amount: payment.amount, currencyCode: booking.currency_code, paymentMethod: payment.paymentMethod, externalReference: nullable(payment.externalReference), paidAt: payment.paidAt, note: nullable(payment.note) });
  await repository.markBookingPaid(client, bookingId);
  const updated = await repository.updateBookingStatus(client, bookingId, "confirmed");
  await repository.insertBookingHistory(client, { bookingId, oldStatus: booking.booking_status, newStatus: "confirmed", changedByUserId: null, changedByAdminId: adminId, note: "Offline payment confirmed" });
  await repository.insertWorkshopEmailOutbox(client, bookingId);
  return { booking: updated, payment: record };
}, dbPool);

export const markWorkshopAttendance = async ({ bookingId, adminId, attendanceStatus, note }, { dbPool = pool } = {}) => withTransaction(async (client) => {
  const booking = await repository.lockAdminBooking(client, bookingId);
  if (!booking) throw domainError("WORKSHOP_BOOKING_NOT_FOUND", "Workshop booking not found", 404);
  if (!["confirmed", "completed"].includes(booking.booking_status)) throw domainError("ATTENDANCE_NOT_ALLOWED", "Attendance can only be marked for confirmed bookings", 409);
  if (new Date(booking.session_ends_at_snapshot) > new Date()) throw domainError("ATTENDANCE_TOO_EARLY", "Attendance can only be marked after the session ends", 409);
  const updated = await repository.updateBookingAttendance(client, { id: bookingId, status: attendanceStatus, adminId });
  await repository.insertAttendanceHistory(client, { bookingId, oldStatus: booking.attendance_status, newStatus: attendanceStatus, adminId, note: nullable(note) });
  return updated;
}, dbPool);

const WORKSHOP_COLUMNS = { titleEn:"title_en",titleAr:"title_ar",descriptionEn:"description_en",descriptionAr:"description_ar",subjectEn:"subject_en",subjectAr:"subject_ar",categoryId:"category_id",presenterId:"presenter_id",imageUrl:"image_url",durationMinutes:"duration_minutes",price:"price",currencyCode:"currency_code",mode:"mode",genderEligibility:"gender_eligibility",minAge:"min_age",maxAge:"max_age",registrationInstructionsEn:"registration_instructions_en",registrationInstructionsAr:"registration_instructions_ar",publicationStatus:"publication_status" };
const CATEGORY_COLUMNS = { nameEn:"name_en",nameAr:"name_ar",descriptionEn:"description_en",descriptionAr:"description_ar",isActive:"is_active" };
const PRESENTER_COLUMNS = { nameEn:"name_en",nameAr:"name_ar",bioEn:"bio_en",bioAr:"bio_ar",professionalTitleEn:"professional_title_en",professionalTitleAr:"professional_title_ar",email:"email",phone:"phone",imageUrl:"image_url",isActive:"is_active" };
const SESSION_COLUMNS = { startsAt:"starts_at",endsAt:"ends_at",timezone:"timezone",seatCapacity:"seat_capacity",status:"status",priceOverride:"price_override",meetingLink:"meeting_link",venueName:"venue_name",addressLine1:"address_line1",addressLine2:"address_line2",city:"city",state:"state",postalCode:"postal_code",country:"country",locationInstructions:"location_instructions",mapUrl:"map_url" };

export const updateWorkshop = (id, data) => repository.updateWorkshopResource("workshops", id, WORKSHOP_COLUMNS, data);
export const updateWorkshopCategory = (id, data) => repository.updateWorkshopResource("workshop_categories", id, CATEGORY_COLUMNS, data);
export const updateWorkshopPresenter = (id, data) => repository.updateWorkshopResource("workshop_presenters", id, PRESENTER_COLUMNS, data);
export const updateWorkshopSession = async (id, data, { dbPool = pool } = {}) => withTransaction(async (client) => {
  const current = await client.query("SELECT s.id,s.workshop_id,s.starts_at,s.ends_at,s.meeting_link,s.venue_name,s.address_line1,s.city,s.country,s.seat_capacity,w.mode FROM workshop_sessions s JOIN workshops w ON w.id=s.workshop_id WHERE s.id=$1 FOR UPDATE", [id]);
  const session = current.rows[0];
  if (!session) throw domainError("WORKSHOP_SESSION_NOT_FOUND", "Workshop session not found", 404);
  const startsAt = new Date(data.startsAt ?? session.starts_at);
  const endsAt = new Date(data.endsAt ?? session.ends_at);
  if (endsAt <= startsAt) throw domainError("INVALID_SESSION_RANGE", "Session end must be later than its start", 422);
  assertSessionDelivery(session.mode, { meetingLink: data.meetingLink ?? session.meeting_link, venueName: data.venueName ?? session.venue_name, addressLine1: data.addressLine1 ?? session.address_line1, city: data.city ?? session.city, country: data.country ?? session.country });
  if (data.seatCapacity != null) { const reserved = await repository.countReservedSessionSeats(client, id); if (data.seatCapacity < reserved) throw domainError("CAPACITY_BELOW_RESERVED", "Capacity cannot be lower than reserved seats", 409); }
  return repository.updateWorkshopResource("workshop_sessions", id, SESSION_COLUMNS, data, client);
}, dbPool);
export const createWorkshopSession = async (workshopId, data) => { const workshop = await repository.getAdminWorkshop(workshopId); if (!workshop) throw domainError("WORKSHOP_NOT_FOUND", "Workshop not found", 404); assertSessionDelivery(workshop.mode, data); return repository.createWorkshopSessionRecord(workshopId, data); };

export { withTransaction };
