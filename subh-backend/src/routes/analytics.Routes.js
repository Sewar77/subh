import express from "express";
import * as controller from "../controller/analytics.Controller.js";
import { adminOnly } from "../middleware/adminOnly.Middleware.js";
import { optionalAuth } from "../middleware/optionalAuth.Middleware.js";
import { protect } from "../middleware/protect.Middleware.js";
import { createRateLimiter } from "../middleware/rateLimit.Middleware.js";
import { validate } from "../middleware/validate.Middleware.js";
import {
  analyticsCustomerRangeSchema,
  analyticsEventSchema,
  analyticsRangeSchema,
} from "../validation/analytics.Validation.js";

const route = express.Router();
const admin = [protect, adminOnly];
const eventRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: "Too many analytics events. Please try again later.",
});

route.post(
  "/analytics/events",
  eventRateLimit,
  optionalAuth,
  validate(analyticsEventSchema, "body"),
  controller.recordAnalyticsEventController,
);
route.get("/admin/analytics/overview", ...admin, validate(analyticsRangeSchema, "query"), controller.getAnalyticsOverviewController);
route.get("/admin/analytics/traffic", ...admin, validate(analyticsRangeSchema, "query"), controller.getAnalyticsTrafficController);
route.get("/admin/analytics/customers", ...admin, validate(analyticsCustomerRangeSchema, "query"), controller.getAnalyticsCustomersController);
route.get("/admin/analytics/book-requests", ...admin, validate(analyticsRangeSchema, "query"), controller.getAnalyticsBookRequestsController);
route.get("/admin/analytics/workshops", ...admin, validate(analyticsRangeSchema, "query"), controller.getAnalyticsWorkshopsController);

export default route;

