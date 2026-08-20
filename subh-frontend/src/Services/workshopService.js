import { api } from "../../api.js";

const request = async (operation, fallback = "The Workshop request failed.") => {
  try { return await operation(); }
  catch (error) {
    const data = error.response?.data;
    const normalized = new Error(data?.message || data?.errors?.[0]?.message || fallback);
    normalized.status = error.response?.status || 0;
    normalized.code = data?.code;
    normalized.fieldErrors = (data?.errors || []).reduce((result, item) => ({ ...result, [item.field]: item.message }), {});
    throw normalized;
  }
};

export const listPublicWorkshops = (params, options = {}) => request(async () => (await api.get("/public/workshops", { params, signal: options.signal })).data);
export const listPublicWorkshopCategories = (lang, options = {}) => request(async () => (await api.get("/public/workshop-categories", { params: { lang }, signal: options.signal })).data.categories);
export const getPublicWorkshop = (id, lang, options = {}) => request(async () => (await api.get(`/public/workshops/${id}`, { params: { lang }, signal: options.signal })).data.workshop);
export const createWorkshopBooking = (sessionId, payload, lang) => request(async () => (await api.post(`/workshop-sessions/${sessionId}/bookings`, payload, { params: { lang } })).data.booking);
export const listMyWorkshopBookings = (params, options = {}) => request(async () => (await api.get("/workshop-bookings", { params, signal: options.signal })).data);
export const getMyWorkshopBooking = (id, lang, options = {}) => request(async () => (await api.get(`/workshop-bookings/${id}`, { params: { lang }, signal: options.signal })).data.booking);

export const listAdminWorkshops = (params, options = {}) => request(async () => (await api.get("/admin/workshops", { params, signal: options.signal })).data);
export const getAdminWorkshop = (id) => request(async () => (await api.get(`/admin/workshops/${id}`)).data.workshop);
export const createAdminWorkshop = (payload) => request(async () => (await api.post("/admin/workshops", payload)).data.workshop);
export const updateAdminWorkshop = (id, payload) => request(async () => (await api.patch(`/admin/workshops/${id}`, payload)).data.workshop);
export const updateWorkshopPublication = (id, publicationStatus) => request(async () => (await api.patch(`/admin/workshops/${id}/publication`, { publicationStatus })).data.workshop);
export const createAdminWorkshopSession = (workshopId, payload) => request(async () => (await api.post(`/admin/workshops/${workshopId}/sessions`, payload)).data.session);
export const updateAdminWorkshopSession = (sessionId, payload) => request(async () => (await api.patch(`/admin/workshop-sessions/${sessionId}`, payload)).data.session);
export const updateWorkshopSessionStatus = (sessionId, status) => request(async () => (await api.patch(`/admin/workshop-sessions/${sessionId}/status`, { status })).data.session);

export const listWorkshopCategories = () => request(async () => (await api.get("/admin/workshop-categories")).data.categories);
export const createWorkshopCategory = (payload) => request(async () => (await api.post("/admin/workshop-categories", payload)).data.category);
export const updateWorkshopCategory = (id, payload) => request(async () => (await api.patch(`/admin/workshop-categories/${id}`, payload)).data.category);
export const setWorkshopCategoryArchived = (id, archived) => request(async () => (await api.patch(`/admin/workshop-categories/${id}/${archived ? "archive" : "restore"}`, {})).data.category);
export const listWorkshopPresenters = () => request(async () => (await api.get("/admin/workshop-presenters")).data.presenters);
export const createWorkshopPresenter = (payload) => request(async () => (await api.post("/admin/workshop-presenters", payload)).data.presenter);
export const updateWorkshopPresenter = (id, payload) => request(async () => (await api.patch(`/admin/workshop-presenters/${id}`, payload)).data.presenter);
export const setWorkshopPresenterArchived = (id, archived) => request(async () => (await api.patch(`/admin/workshop-presenters/${id}/${archived ? "archive" : "restore"}`, {})).data.presenter);

export const listAdminWorkshopBookings = (params, options = {}) => request(async () => (await api.get("/admin/workshop-bookings", { params, signal: options.signal })).data);
export const getAdminWorkshopBooking = (id) => request(async () => (await api.get(`/admin/workshop-bookings/${id}`)).data.booking);
export const updateAdminWorkshopBookingStatus = (id, payload) => request(async () => (await api.patch(`/admin/workshop-bookings/${id}/status`, payload)).data.booking);
export const confirmAdminWorkshopPayment = (id, payload) => request(async () => (await api.post(`/admin/workshop-bookings/${id}/payment-confirmation`, payload)).data);
export const updateAdminWorkshopAttendance = (id, payload) => request(async () => (await api.patch(`/admin/workshop-bookings/${id}/attendance`, payload)).data.booking);
export const retryWorkshopConfirmationEmail = (id) => request(async () => (await api.post(`/admin/workshop-bookings/${id}/email/retry`, {})).data);
