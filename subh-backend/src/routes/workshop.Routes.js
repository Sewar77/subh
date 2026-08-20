import express from "express";
import * as controller from "../controller/workshop.Controller.js";
import { protect } from "../middleware/protect.Middleware.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { createRateLimiter } from "../middleware/rateLimit.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import * as schema from "../validation/workshop.Validation.js";

const route = express.Router();
const admin = [protect, adminOnly];
const bookingRateLimit = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20, message: "Too many Workshop booking attempts. Please try again later." });

route.get("/public/workshops", validate(schema.publicWorkshopListSchema, "query"), controller.listPublicWorkshopsController);
route.get("/public/workshop-categories", validate(schema.workshopLanguageSchema, "query"), controller.listPublicWorkshopCategoriesController);
route.get("/public/workshops/:id", validate(schema.workshopIdParamSchema, "params"), validate(schema.workshopLanguageSchema, "query"), controller.getPublicWorkshopController);
route.post("/workshop-sessions/:sessionId/bookings", protect, bookingRateLimit, validate(schema.workshopSessionParamSchema, "params"), validate(schema.workshopLanguageSchema, "query"), validate(schema.createWorkshopBookingSchema, "body"), controller.createWorkshopBookingController);
route.get("/workshop-bookings", protect, validate(schema.customerWorkshopBookingListSchema, "query"), controller.listMyWorkshopBookingsController);
route.get("/workshop-bookings/:id", protect, validate(schema.workshopBookingParamSchema, "params"), validate(schema.workshopLanguageSchema, "query"), controller.getMyWorkshopBookingController);

route.get("/admin/workshop-categories", ...admin, controller.listWorkshopCategoriesController);
route.post("/admin/workshop-categories", ...admin, validate(schema.createWorkshopCategorySchema, "body"), controller.createWorkshopCategoryController);
route.patch("/admin/workshop-categories/:id", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.updateWorkshopCategorySchema, "body"), controller.updateWorkshopCategoryController);
route.patch("/admin/workshop-categories/:id/archive", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.emptyWorkshopBodySchema, "body"), controller.setWorkshopCategoryActiveController);
route.patch("/admin/workshop-categories/:id/restore", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.emptyWorkshopBodySchema, "body"), controller.setWorkshopCategoryActiveController);

route.get("/admin/workshop-presenters", ...admin, controller.listWorkshopPresentersController);
route.post("/admin/workshop-presenters", ...admin, validate(schema.createWorkshopPresenterSchema, "body"), controller.createWorkshopPresenterController);
route.patch("/admin/workshop-presenters/:id", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.updateWorkshopPresenterSchema, "body"), controller.updateWorkshopPresenterController);
route.patch("/admin/workshop-presenters/:id/archive", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.emptyWorkshopBodySchema, "body"), controller.setWorkshopPresenterActiveController);
route.patch("/admin/workshop-presenters/:id/restore", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.emptyWorkshopBodySchema, "body"), controller.setWorkshopPresenterActiveController);

route.get("/admin/workshops", ...admin, validate(schema.adminWorkshopListSchema, "query"), controller.listAdminWorkshopsController);
route.post("/admin/workshops", ...admin, validate(schema.createWorkshopSchema, "body"), controller.createAdminWorkshopController);
route.get("/admin/workshops/:id", ...admin, validate(schema.workshopIdParamSchema, "params"), controller.getAdminWorkshopController);
route.patch("/admin/workshops/:id", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.updateWorkshopSchema, "body"), controller.updateAdminWorkshopController);
route.patch("/admin/workshops/:id/publication", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.workshopPublicationSchema, "body"), controller.setWorkshopPublicationController);
route.post("/admin/workshops/:id/sessions", ...admin, validate(schema.workshopIdParamSchema, "params"), validate(schema.createWorkshopSessionSchema, "body"), controller.createWorkshopSessionController);
route.patch("/admin/workshop-sessions/:sessionId", ...admin, validate(schema.workshopSessionParamSchema, "params"), validate(schema.updateWorkshopSessionSchema, "body"), controller.updateWorkshopSessionController);
route.patch("/admin/workshop-sessions/:sessionId/status", ...admin, validate(schema.workshopSessionParamSchema, "params"), validate(schema.workshopSessionStatusSchema, "body"), controller.setWorkshopSessionStatusController);

route.get("/admin/workshop-bookings", ...admin, validate(schema.adminWorkshopBookingListSchema, "query"), controller.listAdminWorkshopBookingsController);
route.get("/admin/workshop-bookings/:id", ...admin, validate(schema.workshopBookingParamSchema, "params"), controller.getAdminWorkshopBookingController);
route.patch("/admin/workshop-bookings/:id/status", ...admin, validate(schema.workshopBookingParamSchema, "params"), validate(schema.workshopStatusUpdateSchema, "body"), controller.updateWorkshopBookingStatusController);
route.post("/admin/workshop-bookings/:id/payment-confirmation", ...admin, validate(schema.workshopBookingParamSchema, "params"), validate(schema.confirmWorkshopPaymentSchema, "body"), controller.confirmWorkshopPaymentController);
route.patch("/admin/workshop-bookings/:id/attendance", ...admin, validate(schema.workshopBookingParamSchema, "params"), validate(schema.workshopAttendanceSchema, "body"), controller.updateWorkshopAttendanceController);
route.post("/admin/workshop-bookings/:id/email/retry", ...admin, validate(schema.workshopBookingParamSchema, "params"), validate(schema.emptyWorkshopBodySchema, "body"), controller.retryWorkshopEmailController);

export default route;
