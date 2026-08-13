import { api } from "../../api.js";

const request = async (operation) => {
  try {
    return await operation();
  } catch (error) {
    const data = error.response?.data;
    const fieldErrors = (data?.errors || []).reduce((errors, item) => {
      errors[item.field] = item.message;
      return errors;
    }, {});
    const normalized = new Error(data?.message || "Unable to complete the category request");
    normalized.status = error.response?.status;
    normalized.fieldErrors = fieldErrors;
    throw normalized;
  }
};

export const getCategories = (lang = "en") => request(async () => (await api.get("/public/categories", { params: { lang } })).data.categories);
export const getCategory = (id, lang = "en") => request(async () => (await api.get(`/public/categories/${id}`, { params: { lang } })).data.category);
export const getAdminCategories = () => request(async () => (await api.get("/categories")).data.categories);
export const getAdminCategory = (id) => request(async () => (await api.get(`/categories/${id}`)).data.category);
export const createCategory = (payload) => request(async () => (await api.post("/categories", payload)).data.category);
export const updateCategory = (id, payload) => request(async () => (await api.patch(`/categories/${id}`, payload)).data.category);
export const deleteCategory = (id) => request(() => api.delete(`/categories/${id}`));
export const uploadCategoryImage = async (file) => {
  const data = new FormData();
  data.append("image", file);
  return request(async () => (await api.post("/upload", data, { headers: { "Content-Type": "multipart/form-data" } })).data.url);
};
