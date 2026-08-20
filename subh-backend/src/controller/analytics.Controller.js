import { getValidated } from "../middleware/validate.Middleware.js";
import {
  getAnalyticsBookRequests,
  getAnalyticsCustomers,
  getAnalyticsOverview,
  getAnalyticsTraffic,
  getAnalyticsWorkshops,
  recordAnalyticsEvent,
} from "../services/analytics/analyticsService.js";

const query = (req) => getValidated(req, "query");

export const recordAnalyticsEventController = async (req, res, next) => {
  try {
    const result = await recordAnalyticsEvent(
      getValidated(req, "body"),
      req.user?.id,
    );
    return res.status(result.duplicate ? 200 : 202).json(result);
  } catch (error) {
    return next(error);
  }
};

const logAnalyticsFailure = (operation, error) => {
  if (process.env.NODE_ENV === "production") return;
  console.error("Analytics query failed", {
    operation: error?.analyticsQuery || operation,
    code: error?.code || "UNKNOWN",
    message: error?.message || "Unknown Analytics error",
  });
};

const adminController = (operation, service) => async (req, res, next) => {
  try {
    return res.status(200).json(await service(query(req)));
  } catch (error) {
    logAnalyticsFailure(operation, error);
    return next(error);
  }
};

export const getAnalyticsOverviewController = adminController("overview", getAnalyticsOverview);
export const getAnalyticsTrafficController = adminController("traffic", getAnalyticsTraffic);
export const getAnalyticsCustomersController = adminController("customers", getAnalyticsCustomers);
export const getAnalyticsBookRequestsController = adminController("book-requests", getAnalyticsBookRequests);
export const getAnalyticsWorkshopsController = adminController("workshops", getAnalyticsWorkshops);
