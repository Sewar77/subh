import { getValidated } from "../middleware/validate.Middleware.js";
import * as repository from "../models/workshop.Model.js";
import {
  changeWorkshopBookingStatus,
  confirmOfflineWorkshopPayment,
  createCustomerWorkshopBooking,
  createWorkshopSession,
  markWorkshopAttendance,
  updateWorkshop,
  updateWorkshopCategory,
  updateWorkshopPresenter,
  updateWorkshopSession,
} from "../services/workshops/workshopService.js";
import { dispatchWorkshopConfirmationEmail } from "../services/email/workshopEmailService.js";
import {
  serializeAdminBooking, serializeAdminBookingPage, serializeAdminSession,
  serializeAdminWorkshop, serializeAdminWorkshopPage, serializeCustomerBooking,
  serializeCustomerBookingPage, serializePublicSession, serializePublicWorkshop,
  serializePublicWorkshopPage, serializeWorkshopCategory, serializeWorkshopPresenter,
} from "../utils/workshopSerializer.js";

const asyncHandler = (handler) => async (req, res, next) => { try { await handler(req, res); } catch (error) { next(error); } };
const notFound = (res, label) => res.status(404).json({ message: `${label} not found` });

export const listPublicWorkshopsController = asyncHandler(async (req, res) => {
  const query = getValidated(req, "query");
  const rows = await repository.listPublicWorkshops(query);
  const result = serializePublicWorkshopPage(rows, query.page, query.limit);
  res.json({ workshops: result.items, pagination: result.pagination });
});
export const getPublicWorkshopController = asyncHandler(async (req, res) => {
  const { id } = getValidated(req, "params"); const { lang } = getValidated(req, "query");
  const workshop = await repository.getPublicWorkshopById(id, lang);
  if (!workshop) return notFound(res, "Workshop");
  const sessions = await repository.listPublicWorkshopSessions(id);
  return res.json({ workshop: { ...serializePublicWorkshop(workshop), sessions: sessions.map(serializePublicSession) } });
});
export const listPublicWorkshopCategoriesController = asyncHandler(async (req, res) => {
  const { lang } = getValidated(req, "query");
  res.json({ categories: await repository.listPublicWorkshopCategories(lang) });
});

export const createWorkshopBookingController = asyncHandler(async (req, res) => {
  const booking = await createCustomerWorkshopBooking({ userId: req.user.id, sessionId: getValidated(req, "params").sessionId, attendee: getValidated(req, "body") });
  res.status(201).json({ message: "Workshop booking submitted", booking: serializeCustomerBooking(booking, getValidated(req, "query").lang) });
});
export const listMyWorkshopBookingsController = asyncHandler(async (req, res) => {
  const query = getValidated(req, "query"); const rows = await repository.listCustomerBookings({ userId: req.user.id, ...query });
  const result = serializeCustomerBookingPage(rows, query.page, query.limit, query.lang);
  res.json({ bookings: result.items, pagination: result.pagination });
});
export const getMyWorkshopBookingController = asyncHandler(async (req, res) => {
  const row = await repository.getCustomerBooking(getValidated(req, "params").id, req.user.id);
  if (!row) return notFound(res, "Workshop booking");
  return res.json({ booking: serializeCustomerBooking(row, getValidated(req, "query").lang) });
});

export const listAdminWorkshopsController = asyncHandler(async (req, res) => {
  const query = getValidated(req, "query"); const rows = await repository.listAdminWorkshops(query);
  const result = serializeAdminWorkshopPage(rows, query.page, query.limit); res.json({ workshops: result.items, pagination: result.pagination });
});
export const getAdminWorkshopController = asyncHandler(async (req, res) => {
  const id = getValidated(req, "params").id; const row = await repository.getAdminWorkshop(id);
  if (!row) return notFound(res, "Workshop");
  const sessions = await repository.listAdminWorkshopSessions(id);
  return res.json({ workshop: { ...serializeAdminWorkshop(row), sessions: sessions.map(serializeAdminSession) } });
});
export const createAdminWorkshopController = asyncHandler(async (req, res) => res.status(201).json({ workshop: serializeAdminWorkshop(await repository.createWorkshopRecord(getValidated(req, "body"))) }));
export const updateAdminWorkshopController = asyncHandler(async (req, res) => { const row = await updateWorkshop(getValidated(req, "params").id, getValidated(req, "body")); return row ? res.json({ workshop: serializeAdminWorkshop(row) }) : notFound(res, "Workshop"); });
export const setWorkshopPublicationController = asyncHandler(async (req, res) => { const row = await updateWorkshop(getValidated(req, "params").id, getValidated(req, "body")); return row ? res.json({ workshop: serializeAdminWorkshop(row) }) : notFound(res, "Workshop"); });

export const listWorkshopCategoriesController = asyncHandler(async (req, res) => res.json({ categories: (await repository.listWorkshopCategories()).map(serializeWorkshopCategory) }));
export const createWorkshopCategoryController = asyncHandler(async (req, res) => res.status(201).json({ category: serializeWorkshopCategory(await repository.createWorkshopCategory(getValidated(req, "body"))) }));
export const updateWorkshopCategoryController = asyncHandler(async (req, res) => { const row = await updateWorkshopCategory(getValidated(req, "params").id, getValidated(req, "body")); return row ? res.json({ category: serializeWorkshopCategory(row) }) : notFound(res, "Workshop category"); });
export const setWorkshopCategoryActiveController = asyncHandler(async (req, res) => { const row = await updateWorkshopCategory(getValidated(req, "params").id, { isActive: req.path.endsWith("restore") }); return row ? res.json({ category: serializeWorkshopCategory(row) }) : notFound(res, "Workshop category"); });

export const listWorkshopPresentersController = asyncHandler(async (req, res) => res.json({ presenters: (await repository.listWorkshopPresenters()).map(serializeWorkshopPresenter) }));
export const createWorkshopPresenterController = asyncHandler(async (req, res) => res.status(201).json({ presenter: serializeWorkshopPresenter(await repository.createWorkshopPresenter(getValidated(req, "body"))) }));
export const updateWorkshopPresenterController = asyncHandler(async (req, res) => { const row = await updateWorkshopPresenter(getValidated(req, "params").id, getValidated(req, "body")); return row ? res.json({ presenter: serializeWorkshopPresenter(row) }) : notFound(res, "Workshop presenter"); });
export const setWorkshopPresenterActiveController = asyncHandler(async (req, res) => { const row = await updateWorkshopPresenter(getValidated(req, "params").id, { isActive: req.path.endsWith("restore") }); return row ? res.json({ presenter: serializeWorkshopPresenter(row) }) : notFound(res, "Workshop presenter"); });

export const createWorkshopSessionController = asyncHandler(async (req, res) => res.status(201).json({ session: serializeAdminSession(await createWorkshopSession(getValidated(req, "params").id, getValidated(req, "body"))) }));
export const updateWorkshopSessionController = asyncHandler(async (req, res) => res.json({ session: serializeAdminSession(await updateWorkshopSession(getValidated(req, "params").sessionId, getValidated(req, "body"))) }));
export const setWorkshopSessionStatusController = asyncHandler(async (req, res) => res.json({ session: serializeAdminSession(await updateWorkshopSession(getValidated(req, "params").sessionId, getValidated(req, "body"))) }));

export const listAdminWorkshopBookingsController = asyncHandler(async (req, res) => { const query = getValidated(req, "query"); const rows = await repository.listAdminBookings(query); const result = serializeAdminBookingPage(rows, query.page, query.limit); res.json({ bookings: result.items, pagination: result.pagination }); });
export const getAdminWorkshopBookingController = asyncHandler(async (req, res) => { const row = await repository.getAdminBooking(getValidated(req, "params").id); return row ? res.json({ booking: serializeAdminBooking(row) }) : notFound(res, "Workshop booking"); });
export const updateWorkshopBookingStatusController = asyncHandler(async (req, res) => res.json({ booking: serializeAdminBooking(await changeWorkshopBookingStatus({ bookingId: getValidated(req, "params").id, adminId: req.user.id, ...getValidated(req, "body") })) }));
export const confirmWorkshopPaymentController = asyncHandler(async (req, res) => {
  const result = await confirmOfflineWorkshopPayment({ bookingId: getValidated(req, "params").id, adminId: req.user.id, payment: getValidated(req, "body") });
  setImmediate(() => { dispatchWorkshopConfirmationEmail(result.booking.id).catch(() => undefined); });
  res.json({ message: "Offline payment confirmed", booking: serializeAdminBooking({ ...result.booking, payment_status: "paid" }), payment: result.payment, emailStatus: "queued" });
});
export const updateWorkshopAttendanceController = asyncHandler(async (req, res) => res.json({ booking: serializeAdminBooking(await markWorkshopAttendance({ bookingId: getValidated(req, "params").id, adminId: req.user.id, ...getValidated(req, "body") })) }));
export const retryWorkshopEmailController = asyncHandler(async (req, res) => res.json(await dispatchWorkshopConfirmationEmail(getValidated(req, "params").id)));
