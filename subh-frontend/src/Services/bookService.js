import { api } from "../../api.js";

const request = async (operation, fallback) => {
  try {
    return await operation();
  } catch (error) {
    const details = error.response?.data?.errors || [];
    const normalized = new Error(
      error.response?.data?.message || details[0]?.message || fallback,
    );
    normalized.status = error.response?.status;
    normalized.fieldErrors = details.reduce((result, detail) => {
      result[detail.field] = detail.message;
      return result;
    }, {});
    throw normalized;
  }
};
export const getPublicBooks = (params = {}) =>
  request(
    async () => (await api.get("/public/books", { params })).data,
    "Books could not be loaded. Please try again.",
  );
export const getPublicBook = (id, lang = "en") =>
  request(
    async () => (await api.get(`/public/books/${id}`, { params: { lang } })).data.book,
    "The selected book could not be loaded.",
  );
export const getBooksForCategory = (categoryId, params = {}) =>
  request(
    async () => (await api.get(`/public/categories/${categoryId}/books`, { params })).data,
    "Books for this category could not be loaded.",
  );

export const getAdminBooks = (params = {}) =>
  request(
    async () => (await api.get("/books", { params })).data,
    "Books could not be loaded. Please try again.",
  );

export const getAdminBook = (id) =>
  request(
    async () => (await api.get(`/books/${id}`)).data.book,
    "The selected book could not be loaded.",
  );

export const getAdminBooksForCategory = (categoryId) =>
  request(
    async () => (await api.get(`/categories/${categoryId}/books`)).data,
    "Books for this category could not be loaded.",
  );

export const createBook = (payload) =>
  request(
    async () => (await api.post("/books", payload)).data.book,
    "The book could not be created. Check the required book fields and try again.",
  );

export const updateBook = (id, payload) =>
  request(
    async () => (await api.patch(`/books/${id}`, payload)).data.book,
    "The book could not be saved. Check the book fields and try again.",
  );

export const deleteBook = (id) =>
  request(
    () => api.delete(`/books/${id}`),
    "The book could not be deleted. Check whether it is used elsewhere and try again.",
  );
