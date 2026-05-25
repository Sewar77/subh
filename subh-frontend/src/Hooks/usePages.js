import { useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const usePages = () => {
  const [page, setPage] = useState(null);
  const [pages, setPages] = useState([]);
  const navigate = useNavigate();
  const createNewPage = async (key) => {
    try {
      const res = await api.post("/page", { key });
      setPage(res.data.page);
      toast.success(res.data.message || "Created successfully");
      navigate("/admin/view-pages");
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };

  const fetchPages = async () => {
    try {
      const res = await api.get("/pages");
      setPages(res.data.pages);
      toast.success(res.data.message || "Created successfully");
    } catch (error) {
      const errors = error.response?.data?.errors;

      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  const deletePage = async (id) => {
    try {
      const res = await api.delete(`/page/${id}`);
      fetchPages();
      toast.success(res.data.message || "deleted successfully");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };
  const getPageByKey = async (key) => {
    try {
      const res = await api.get(`/page-key/${key}`);
      setPage(res.data.page);
      toast.success(res.data.message || "gets successfully");
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (Array.isArray(errors)) {
        toast.error(errors.map((err) => err.message).join("\n"));
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
  };

  return {
    page,
    createNewPage,
    fetchPages,
    pages,
    deletePage,
    getPageByKey,
    page,
  };
};
