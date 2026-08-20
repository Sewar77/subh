import { api } from "../../api.js";

const request = async (path, params, options = {}) => {
  try {
    return (await api.get(path, { params, signal: options.signal })).data;
  } catch (error) {
    const details = (error.response?.data?.errors || []).map(({ message }) => message).join("; ");
    const normalized = new Error(details || error.response?.data?.message || "Analytics could not be loaded.");
    normalized.status = error.response?.status || 0;
    throw normalized;
  }
};

export const getAnalyticsOverview = (params, options) => request("/admin/analytics/overview", params, options);
export const getAnalyticsTraffic = (params, options) => request("/admin/analytics/traffic", params, options);
export const getAnalyticsCustomers = (params, options) => request("/admin/analytics/customers", params, options);
export const getAnalyticsBookRequests = (params, options) => request("/admin/analytics/book-requests", params, options);
export const getAnalyticsWorkshops = (params, options) => request("/admin/analytics/workshops", params, options);

