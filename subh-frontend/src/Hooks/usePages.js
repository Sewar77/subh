import { useState, useCallback } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";

export const usePages = () => {
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(null);

  const [sections, setSections] = useState([]);
  const [section, setSection] = useState(null);

  const [pageTranslations, setPageTranslations] = useState([]);
  const [sectionTranslations, setSectionTranslations] = useState([]);

  const [loading, setLoading] = useState(false);

  const handleError = (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";

    toast.error(message);
  };

  const withLoading = async (callback) => {
    try {
      setLoading(true);
      return await callback();
    } catch (error) {
      handleError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // PAGES
  // =========================

  const fetchPages = useCallback(
    () =>
      withLoading(async () => {
        const res = await api.get("/pages");

        setPages(res.data.pages || []);

        return res.data.pages;
      }),
    [],
  );

  const fetchPageById = useCallback(
    (id) =>
      withLoading(async () => {
        setPage(null);

        const res = await api.get(`/pages/${id}`);

        setPage(res.data.page);

        return res.data.page;
      }),
    [],
  );

  const fetchPageByKey = useCallback(
    (key) =>
      withLoading(async () => {
        setPage(null);

        const res = await api.get(`/pages/key/${key}`);

        setPage(res.data.page);

        return res.data.page;
      }),
    [],
  );

  // =========================
  // PAGE TRANSLATIONS
  // =========================

  const getPageTranslations = useCallback(
    (pageId) =>
      withLoading(async () => {
        const res = await api.get(`/page-translations/${pageId}`);

        setPageTranslations(res.data.translations || []);

        return res.data.translations;
      }),
    [],
  );

  const createPageTranslation = useCallback(
    (pageId, data) =>
      withLoading(async () => {
        const res = await api.post(`/page-translations/${pageId}`, data);

        toast.success("Page translation added");

        return res.data;
      }),
    [],
  );

  const updatePageTranslation = useCallback(
    (id, data) =>
      withLoading(async () => {
        const res = await api.put(`/page-translations/${id}`, data);

        toast.success("Page translation updated");

        return res.data;
      }),
    [],
  );

  const deletePageTranslation = useCallback(
    (id) =>
      withLoading(async () => {
        await api.delete(`/page-translations/${id}`);

        setPageTranslations((prev) => prev.filter((item) => item.id !== id));

        toast.success("Page translation deleted");
      }),
    [],
  );

  // =========================
  // SECTIONS
  // =========================

  const getSectionsByPageId = useCallback(
    (pageId) =>
      withLoading(async () => {
        const res = await api.get(`/sections/page/${pageId}`);

        setSections(res.data.sections || []);

        return res.data.sections;
      }),
    [],
  );

  const fetchSectionById = useCallback(
    (id) =>
      withLoading(async () => {
        const res = await api.get(`/sections/${id}`);

        setSection(res.data.section);

        return res.data.section;
      }),
    [],
  );

  // =========================
  // SECTION TRANSLATIONS
  // =========================

  const getSectionTranslations = useCallback(
    (sectionId) =>
      withLoading(async () => {
        const res = await api.get(`/section-translations/section/${sectionId}`);

        setSectionTranslations(res.data.translations || []);

        return res.data.translations;
      }),
    [],
  );

  const createSectionTranslation = useCallback(
    (sectionId, data) =>
      withLoading(async () => {
        const res = await api.post(`/section-translations/${sectionId}`, data);

        toast.success("Section content added");

        return res.data;
      }),
    [],
  );

  const updateSectionTranslation = useCallback(
    (id, data) =>
      withLoading(async () => {
        const res = await api.put(`/section-translations/${id}`, data);

        toast.success("Section content updated");

        return res.data;
      }),
    [],
  );

  const deleteSectionTranslation = useCallback(
    (id) =>
      withLoading(async () => {
        await api.delete(`/section-translations/${id}`);

        setSectionTranslations((prev) => prev.filter((item) => item.id !== id));

        toast.success("Section content deleted");
      }),
    [],
  );

  return {
    // states

    pages,
    page,

    sections,
    section,

    pageTranslations,
    sectionTranslations,

    loading,

    // pages

    fetchPages,
    fetchPageById,
    fetchPageByKey,

    // page translations

    getPageTranslations,
    createPageTranslation,
    updatePageTranslation,
    deletePageTranslation,

    // sections

    getSectionsByPageId,
    fetchSectionById,

    // section translations

    getSectionTranslations,
    createSectionTranslation,
    updateSectionTranslation,
    deleteSectionTranslation,
  };
};
