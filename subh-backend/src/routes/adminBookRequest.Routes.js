import express from "express";
import {
  assignAdminBookRequestController,
  getAdminBookRequestController,
  listAdminBookRequestsController,
  prepareAdminBookRequestQuoteController,
  recordAdminBookRequestContactController,
  updateAdminBookRequestNotesController,
  updateAdminBookRequestStatusController,
} from "../controller/adminBookRequest.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import { bookRequestIdParamSchema } from "../validation/bookRequest.Validation.js";
import {
  adminAssignmentSchema,
  adminBookRequestListQuerySchema,
  adminContactHistorySchema,
  adminQuoteSchema,
  adminRequestNotesSchema,
  adminWorkflowStatusSchema,
} from "../validation/adminBookRequest.Validation.js";
import {
  listBookRequestPaymentsController,
  recordBookRequestPaymentController,
  recordBookRequestRefundController,
  voidBookRequestPaymentController,
} from "../controller/requestPayment.Controller.js";
import {
  paymentRecordParamSchema,
  recordPaymentSchema,
  recordRefundSchema,
  voidPaymentSchema,
} from "../validation/requestPayment.Validation.js";

const route = express.Router();
const admin = [protect, adminOnly];
const validateId = validate(bookRequestIdParamSchema, "params");

route.get(
  "/admin/book-requests",
  ...admin,
  validate(adminBookRequestListQuerySchema, "query"),
  listAdminBookRequestsController,
);
route.get(
  "/admin/book-requests/:id",
  ...admin,
  validateId,
  getAdminBookRequestController,
);
route.patch(
  "/admin/book-requests/:id/assignment",
  ...admin,
  validateId,
  validate(adminAssignmentSchema, "body"),
  assignAdminBookRequestController,
);
route.patch(
  "/admin/book-requests/:id/status",
  ...admin,
  validateId,
  validate(adminWorkflowStatusSchema, "body"),
  updateAdminBookRequestStatusController,
);
route.put(
  "/admin/book-requests/:id/quote",
  ...admin,
  validateId,
  validate(adminQuoteSchema, "body"),
  prepareAdminBookRequestQuoteController,
);
route.patch(
  "/admin/book-requests/:id/notes",
  ...admin,
  validateId,
  validate(adminRequestNotesSchema, "body"),
  updateAdminBookRequestNotesController,
);
route.post(
  "/admin/book-requests/:id/contact-history",
  ...admin,
  validateId,
  validate(adminContactHistorySchema, "body"),
  recordAdminBookRequestContactController,
);
route.get(
  "/admin/book-requests/:id/payments",
  ...admin,
  validateId,
  listBookRequestPaymentsController,
);
route.post(
  "/admin/book-requests/:id/payments",
  ...admin,
  validateId,
  validate(recordPaymentSchema, "body"),
  recordBookRequestPaymentController,
);
route.post(
  "/admin/book-requests/:id/refunds",
  ...admin,
  validateId,
  validate(recordRefundSchema, "body"),
  recordBookRequestRefundController,
);
route.patch(
  "/admin/book-requests/:id/payments/:paymentId/void",
  ...admin,
  validate(paymentRecordParamSchema, "params"),
  validate(voidPaymentSchema, "body"),
  voidBookRequestPaymentController,
);

export default route;
