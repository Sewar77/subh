import { useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";

export const usePages = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState([]);
  // =========================
  // PAGES
  // =========================

  const fetchAllPages = async () => {
    try {
      setLoading(true);
      const res = await api.get("/pages");
      setPages(res.data.pages || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (data) => {
    try {
      const res = await api.post("/pages", data);
      toast.success("Page created");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  const updatePage = async (id, data) => {
    try {
      const res = await api.put(`/pages/${id}`, data);
      toast.success("Page updated");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  const deletePageById = async (id) => {
    console.log(id);

    try {
      await api.delete(`/pages/${id}`);
      fetchAllPages();
      toast.success("Page deleted");
    } catch (error) {
      handleError(error);
    }
  };

  // =========================
  // PAGE TRANSLATIONS
  // =========================

  const addPageTranslation = async (pageId, data) => {
    try {
      const res = await api.post(`/pages/${pageId}/translations`, data);
      toast.success("Translation added");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  const updatePageTranslation = async (pageId, locale, data) => {
    try {
      const res = await api.put(
        `/pages/${pageId}/translations/${locale}`,
        data,
      );
      toast.success("Translation updated");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  // =========================
  // SECTIONS
  // =========================

  const addSection = async (pageId, data) => {
    try {
      const res = await api.post(`/pages/${pageId}/sections`, data);
      toast.success("Section added");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  const updateSection = async (sectionId, data) => {
    try {
      const res = await api.put(`/sections/${sectionId}`, data);
      toast.success("Section updated");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  const deleteSection = async (sectionId) => {
    try {
      await api.delete(`/sections/${sectionId}`);
      toast.success("Section deleted");
    } catch (error) {
      handleError(error);
    }
  };

  const reorderSections = async (pageId, orderedIds) => {
    try {
      await api.put(`/pages/${pageId}/sections/reorder`, {
        orderedIds,
      });
      toast.success("Sections reordered");
    } catch (error) {
      handleError(error);
    }
  };

  // =========================
  // PAGE TEMPLATES
  // =========================

  const fetchTemplates = async () => {
    try {
      const res = await api.get("/all-page-templates");
      setTemplate(res.data.page_templates);
      return res.data.page_templates || [];
    } catch (error) {
      handleError(error);
    }
  };

  const createTemplate = async (data) => {
    try {
      const res = await api.post("/page-templates", data);
      toast.success("Template created");
      return res.data;
    } catch (error) {
      handleError(error);
    }
  };

  // =========================
  // HELPERS
  // =========================

  const handleError = (error) => {
    const err =
      error.response?.data?.errors[0].message +
      ", Make sure name follows the naming rules";

    toast.error(err || "Something went wrong. Please try again.");
  };

  return {
    // state
    pages,
    loading,
    template,

    // pages
    fetchAllPages,
    createPage,
    updatePage,
    deletePageById,

    // translations
    addPageTranslation,
    updatePageTranslation,

    // sections
    addSection,
    updateSection,
    deleteSection,
    reorderSections,

    // templates
    fetchTemplates,
    createTemplate,
  };
};
