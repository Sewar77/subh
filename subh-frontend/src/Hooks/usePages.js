import { useState, useCallback } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
export const usePages = () => {
  const [pages, setPages] = useState([]);
  const [templatePages, setTemplatePages] = useState([]);
  const [page, setPage] = useState(null);
  const [pageTranslations, setPageTranslations] = useState([]);
  const [allPageTranslations, setAllPageTranslations] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [template, setTemplate] = useState(null);
  const [sections, setSections] = useState([]);
  const [section, setSection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allSections, setAllSections] = useState([]);
  const [sectionTranslations, setSectionTranslations] = useState([]);
  const handleError = (error) => {
    const message =
      error?.response?.data?.errors?.message ||
      error?.response?.data?.message ||
      error?.message ||
      "Something went wrong";
    toast.error(message);
  };
  const withLoading = async (fn) => {
    try {
      setLoading(true);
      return await fn();
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
  const fetchAllPages = useCallback(
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
  const fetchPageByTemplateId = useCallback(
    (id) =>
      withLoading(async () => {
        setTemplatePages(null);
        const res = await api.get(`/template/${id}/pages`);
        setTemplatePages(res.data.page);
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

  const createPage = useCallback(
    (data) =>
      withLoading(async () => {
        const res = await api.post("/pages", data);
        toast.success("Page created");
        return res.data;
      }),
    [],
  );
  const updatePage = useCallback(
    (id, data) =>
      withLoading(async () => {
        const res = await api.put(`/pages/${id}`, data);
        toast.success("Page updated");
        return res.data;
      }),
    [],
  );
  const deletePageById = useCallback(
    (id) =>
      withLoading(async () => {
        await api.delete(`/pages/${id}`);
        setPages((prev) => prev.filter((p) => p.id !== id));
        toast.success("Page deleted");
      }),
    [],
  );
  // =========================
  // TRANSLATIONS
  // =========================
  const addPageTranslation = useCallback(
    (pageId, data) =>
      withLoading(async () => {
        const res = await api.post(`/pages/${pageId}/translations`, data);
        toast.success("Translation added");
        return res.data;
      }),
    [],
  );

  const updatePageTranslation = useCallback(
    (pageId, locale, data) =>
      withLoading(async () => {
        const res = await api.put(
          `/pages/${pageId}/translations/${locale}`,
          data,
        );
        toast.success("Translation updated");
        return res.data;
      }),
    [],
  );

  const fetchPageTranslations = useCallback(
    (pageId) =>
      withLoading(async () => {
        setPageTranslations([]);
        const res = await api.get(`/page-translations/${pageId}`);
        setPageTranslations(res.data.translation || []);
        return res.data.translation;
      }),
    [],
  );

  const fetchPageTranslationByLocale = useCallback(
    (pageId, locale) =>
      withLoading(async () => {
        const res = await api.get(`/page-translation/${pageId}/${locale}`);
        setAllPageTranslations(res.data.translation || []);
        return res.data.translation;
      }),
    [],
  );
  // =========================
  // SECTIONS
  // =========================
  const addSection = useCallback(
    (pageId, data) =>
      withLoading(async () => {
        const res = await api.post(`/pages/${pageId}/sections`, data);
        toast.success("Section added");
        return res.data;
      }),
    [],
  );
  const updateSection = useCallback(
    (sectionId, data) =>
      withLoading(async () => {
        const res = await api.put(`/sections/${sectionId}`, data);
        toast.success("Section updated");
        return res.data;
      }),
    [],
  );

  const fetchSectionById = useCallback(
    (sectionId) =>
      withLoading(async () => {
        const res = await api.get(`/sections/${sectionId}`);
        toast.success("Section found");
        setSection(res.data.section);
        return res.data.section;
      }),
    [],
  );
  const deleteSection = useCallback(
    (sectionId) =>
      withLoading(async () => {
        await api.delete(`/sections/${sectionId}`);
        fetchAllSections();
        toast.success("Section deleted");
      }),
    [],
  );
  const reorderSections = useCallback(
    (pageId, orderedIds) =>
      withLoading(async () => {
        await api.put(`/pages/${pageId}/sections/reorder`, { orderedIds });
        toast.success("Sections reordered");
      }),
    [],
  );
  const getSectionsByPageId = useCallback(
    (pageId) =>
      withLoading(async () => {
        setSections([]);
        const res = await api.get(`/sections/page/${pageId}`);
        setSections(res.data.sections || []);
        return res.data.sections;
      }),
    [],
  );
  const fetchAllSections = async () => {
    try {
      setLoading(true);
      const res = await api.get("/all-sections");
      setAllSections(res.data.sections || []);
      return res.data.sections;
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };
  // =========================
  // TEMPLATES
  // =========================
  const fetchTemplates = useCallback(
    () =>
      withLoading(async () => {
        const res = await api.get("/all-page-templates");
        setTemplates(res.data.page_templates || []);
        return res.data.page_templates;
      }),
    [],
  );
  const getTemplateById = useCallback(
    (id) =>
      withLoading(async () => {
        const res = await api.get(`/page-templates/${id}`);
        setTemplate(res.data.page_templates);
        return res.data;
      }),
    [],
  );
  const createTemplate = useCallback(
    (data) =>
      withLoading(async () => {
        const res = await api.post("/page-templates", data);
        toast.success("Template created");
        return res.data;
      }),
    [],
  );
  // =========================
  // SECTION TRANSLATIONS
  // =========================
  const addSectionTranslation = useCallback(
    (data) =>
      withLoading(async () => {
        const res = await api.post(
          `/section-translations/${data.section_id}`,
          data.data,
        );
        setSectionTranslations(res.data.sectionTranslations);
        toast.success("Section translation added");
        return res.data;
      }),
    [],
  );
  const updateSectionTranslation = useCallback(
    (id, data) =>
      withLoading(async () => {
        const res = await api.put(`/section-translations/${id}`, data);
        toast.success("Section translation updated");
        return res.data;
      }),
    [],
  );
  const getSectionTranslationsBySectionId = useCallback(
    (sectionId) =>
      withLoading(async () => {
        setSectionTranslations([]);
        const res = await api.get(`/section-translations/section/${sectionId}`);
        setSectionTranslations(res.data.translations || []);
        return res.data.translations;
      }),
    [],
  );
  const deleteSectionTranslation = useCallback(
    (id) =>
      withLoading(async () => {
        await api.delete(`/section-translations/${id}`);
        setSectionTranslations((prev) => prev.filter((t) => t.id !== id));
        toast.success("Section translation deleted");
      }),
    [],
  );
  return {
    pages,
    page,
    pageTranslations,
    allPageTranslations,
    templates,
    sections,
    loading,
    section,
    allSections,
    templatePages,
    template,
    sectionTranslations,

    addSectionTranslation,
    updateSectionTranslation,
    getSectionTranslationsBySectionId,
    deleteSectionTranslation,

    fetchAllPages,
    fetchPageById,
    fetchPageByKey,
    createPage,
    updatePage,
    deletePageById,
    fetchPageByTemplateId,

    addPageTranslation,
    updatePageTranslation,
    fetchPageTranslations,
    fetchPageTranslationByLocale,

    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    getSectionsByPageId,
    fetchAllSections,
    fetchSectionById,

    fetchTemplates,
    createTemplate,
    getTemplateById,
  };
};
