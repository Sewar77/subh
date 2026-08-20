import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { getWorkshopCopy, workshopStatusLabel } from "../src/Utils/workshopI18n.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const app = read("src/App.jsx");
const service = read("src/Services/workshopService.js");
const booking = read("src/Pages/Workshops/WorkshopBookingPage.jsx");
const publicDetail = read("src/Pages/Workshops/WorkshopDetailPage.jsx");
const adminForm = read("src/components/Admin/Workshops/WorkshopForm.jsx");
const adminSession = read("src/components/Admin/Workshops/SessionForm.jsx");

test("Workshop routes are lazy and protected at the correct boundary", () => {
  for (const name of ["WorkshopsPage", "WorkshopDetailPage", "WorkshopBookingPage", "MyWorkshopBookingsPage", "AdminWorkshopsPage", "AdminWorkshopBookingsPage"]) assert.match(app, new RegExp(`const ${name} = lazy`));
  assert.match(app, /path="workshops" element={<LazyRoute component={WorkshopsPage}/);
  assert.match(app, /path="workshops\/:workshopId\/sessions\/:sessionId\/book"/);
  assert.ok(app.indexOf("workshops/:workshopId/sessions/:sessionId/book") > app.indexOf("CustomerRouteGuard"));
  assert.ok(app.indexOf('path="workshops"\n              element={<LazyRoute component={AdminWorkshopsPage}') > app.indexOf("AdminRouteGuard"));
});

test("one canonical service owns public, customer, and admin Workshop APIs", () => {
  for (const endpoint of ["/public/workshops", "/workshop-sessions/${sessionId}/bookings", "/workshop-bookings", "/admin/workshops", "/admin/workshop-bookings", "/payment-confirmation", "/attendance"]) assert.ok(service.includes(endpoint), `${endpoint} missing`);
});

test("customer booking payload contains attendee snapshots only", () => {
  const submit = booking.slice(booking.indexOf("const submit"), booking.indexOf("if (state.loading)"));
  assert.match(submit, /const payload = \{ \.\.\.form, age: Number\(form\.age\) \}/);
  assert.doesNotMatch(submit, /userId|workshopId:|price:|paymentStatus|bookingStatus|meetingLink|seatCapacity/);
});

test("public detail does not expect or render a meeting link", () => {
  assert.doesNotMatch(publicDetail, /meetingLink|locationInstructions/);
});

test("admin Workshop image reuses MediaPicker and session copy marks delivery details private", () => {
  assert.match(adminForm, /<MediaPicker/);
  assert.match(adminForm, /imageUrl: asset\.url/);
  assert.match(adminSession, /Meeting links are private/);
  assert.match(adminSession, /Detailed location instructions are private/);
});

test("English and Arabic labels are human-readable", () => {
  assert.equal(workshopStatusLabel("awaiting_payment", "en"), "Awaiting Payment");
  assert.equal(workshopStatusLabel("awaiting_payment", "ar"), "بانتظار الدفع");
  assert.equal(getWorkshopCopy("ar").book, "احجز هذه الجلسة");
});
