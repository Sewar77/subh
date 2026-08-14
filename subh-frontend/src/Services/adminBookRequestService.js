import { api } from "../../api.js";

const request = async (operation, fallback) => {
  try {
    return await operation();
  } catch (error) {
    const data = error.response?.data;
    const validationDetails = (data?.errors || [])
      .map((item) => `${item.field}: ${item.message}`)
      .join("; ");
    const normalized = new Error(
      validationDetails || data?.message || fallback,
    );
    normalized.status = error.response?.status;
    normalized.fieldErrors = (data?.errors || []).reduce((result, item) => {
      result[item.field] = item.message;
      return result;
    }, {});
    throw normalized;
  }
};

export const getAdminBookRequests = (params = {}, options = {}) =>
  request(
    async () =>
      (
        await api.get("/admin/book-requests", {
          params,
          signal: options.signal,
        })
      ).data,
    "Book Requests could not be loaded.",
  );

export const getAdminBookRequest = (id, options = {}) =>
  request(
    async () =>
      (
        await api.get(`/admin/book-requests/${id}`, {
          signal: options.signal,
        })
      ).data.request,
    "The selected Book Request could not be loaded.",
  );

export const assignBookRequest = (id, assignedAdminId) =>
  request(
    async () =>
      (
        await api.patch(`/admin/book-requests/${id}/assignment`, {
          assignedAdminId,
        })
      ).data.request,
    "The request assignment could not be updated.",
  );

export const updateBookRequestStatus = (id, payload) =>
  request(
    async () =>
      (
        await api.patch(`/admin/book-requests/${id}/status`, payload)
      ).data.request,
    "The workflow status could not be updated.",
  );

export const prepareBookRequestQuote = (id, payload) =>
  request(
    async () =>
      (
        await api.put(`/admin/book-requests/${id}/quote`, payload)
      ).data.request,
    "The quote could not be saved.",
  );

export const updateBookRequestNotes = (id, payload) =>
  request(
    async () =>
      (
        await api.patch(`/admin/book-requests/${id}/notes`, payload)
      ).data.request,
    "The request notes could not be saved.",
  );

export const recordBookRequestContact = (id, payload) =>
  request(
    async () =>
      (
        await api.post(`/admin/book-requests/${id}/contact-history`, payload)
      ).data.request,
    "The contact record could not be saved.",
  );

export const getAdminBookRequestPayments = (id, options = {}) =>
  request(
    async () =>
      (
        await api.get(`/admin/book-requests/${id}/payments`, {
          signal: options.signal,
        })
      ).data,
    "The payment ledger could not be loaded.",
  );

export const recordAdminBookRequestPayment = (id, payload) =>
  request(
    async () =>
      (await api.post(`/admin/book-requests/${id}/payments`, payload)).data,
    "The offline payment could not be recorded.",
  );

export const recordAdminBookRequestRefund = (id, payload) =>
  request(
    async () =>
      (await api.post(`/admin/book-requests/${id}/refunds`, payload)).data,
    "The offline refund could not be recorded.",
  );

export const voidAdminBookRequestPayment = (id, paymentId, reason) =>
  request(
    async () =>
      (
        await api.patch(
          `/admin/book-requests/${id}/payments/${paymentId}/void`,
          { reason },
        )
      ).data,
    "The ledger entry could not be voided.",
  );

export const getAssignableAdmins = () =>
  request(
    async () => {
      const users = (await api.get("/users")).data.users || [];
      return users.filter(
        (user) => user.role === "admin" && user.is_active !== false,
      );
    },
    "Administrators could not be loaded.",
  );
