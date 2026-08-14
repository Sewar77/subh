import { api } from "../../api.js";

const request = async (operation, fallback) => {
  try {
    return await operation();
  } catch (error) {
    const data = error.response?.data;
    const details = Array.isArray(data?.errors) ? data.errors : [];
    const normalized = new Error(
      details.map((item) => item.message).join("; ") || data?.message || fallback,
    );
    normalized.status = error.response?.status;
    normalized.fieldErrors = details.reduce((result, item) => {
      result[item.field] = item.message;
      return result;
    }, {});
    throw normalized;
  }
};

export const createCustomerBookRequest = (payload, lang = "en") =>
  request(
    async () =>
      (await api.post("/book-requests", payload, { params: { lang } })).data
        .request,
    "The Book Request could not be submitted.",
  );

export const getMyBookRequests = (params = {}, options = {}) =>
  request(
    async () =>
      (
        await api.get("/book-requests", {
          params,
          signal: options.signal,
        })
      ).data,
    "Your Book Requests could not be loaded.",
  );

export const getMyBookRequest = (id, lang = "en", options = {}) =>
  request(
    async () =>
      (
        await api.get(`/book-requests/${id}`, {
          params: { lang },
          signal: options.signal,
        })
      ).data.request,
    "The selected Book Request could not be loaded.",
  );
