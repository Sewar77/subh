import { createContext, useContext, useState, useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "../../api";

const PagesContext = createContext(null);

export function PagesProvider({ children }) {
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(null);

  const [sections, setSections] = useState([]);
  const [sectionKey, setSectionKey] = useState([]);
  const [section, setSection] = useState(null);
  const [allSections, setAllSections] = useState([]);

  const [pageTranslations, setPageTranslations] = useState([]);
  const [sectionTranslations, setSectionTranslations] = useState([]);

  const [pagesLoading, setPagesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [translationsLoading, setTranslationsLoading] = useState(false);

  const handleError = (error) => {
    toast.error(
      error?.response?.data?.message ||
        error?.message ||
        "Something went wrong",
    );
  };

  // ======================
  // PAGES
  // ======================

  const fetchPages = useCallback(async () => {
    try {
      setPagesLoading(true);

      const res = await api.get("/pages");

      setPages(res.data.pages || []);

      return res.data.pages;
    } catch (error) {
      handleError(error);
    } finally {
      setPagesLoading(false);
    }
  }, []);

  const fetchPageByKey = useCallback(async (key) => {
    try {
      setPagesLoading(true);

      const res = await api.get(`/pages/key/${key}`);

      setPage(res.data.page);

      return res.data.page;
    } catch (error) {
      handleError(error);
    } finally {
      setPagesLoading(false);
    }
  }, []);

  // ======================
  // SECTIONS
  // ======================

  const getSectionsByPageKey = useCallback(async (key) => {
    try {
      setSectionsLoading(true);

      const res = await api.get(`/pages/sections/${key}`);

      setSectionKey(res.data.sections || []);

      return res.data.sections;
    } catch (error) {
      handleError(error);
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  const getSectionsByPageId = useCallback(async (id) => {
    try {
      setSectionsLoading(true);

      const res = await api.get(`/pages/${id}/sections`);

      setSections(res.data.sections || []);

      return res.data.sections;
    } catch (error) {
      handleError(error);
    } finally {
      setSectionsLoading(false);
    }
  }, []);
  const getAllSections = useCallback(async () => {
    try {
      setSectionsLoading(true);
      const res = await api.get("/sections");
      setAllSections(res.data.sections || []);
      return res.data.sections;
    } catch (error) {
      handleError(error);
    } finally {
      setSectionsLoading(false);
    }
  }, []);
  const fetchSectionById = useCallback(async (id) => {
    try {
      setSectionsLoading(true);

      const res = await api.get(`/sections/${id}`);

      setSection(res.data.section);

      return res.data.section;
    } catch (error) {
      handleError(error);
    } finally {
      setSectionsLoading(false);
    }
  }, []);

  // ======================
  // TRANSLATIONS
  // ======================

  const getSectionTranslations = useCallback(async (id) => {
    try {
      setTranslationsLoading(true);

      const res = await api.get(`/sections/${id}/translations`);

      setSectionTranslations(res.data.translations || []);

      return res.data.translations;
    } catch (error) {
      handleError(error);
    } finally {
      setTranslationsLoading(false);
    }
  }, []);

  return (
    <PagesContext.Provider
      value={{
        pages,
        page,

        sections,
        section,
        sectionKey,
        allSections,
        pageTranslations,
        sectionTranslations,

        pagesLoading,
        sectionsLoading,
        translationsLoading,

        fetchPages,
        fetchPageByKey,

        getSectionsByPageKey,
        getSectionsByPageId,

        fetchSectionById,
        getAllSections,
        getSectionTranslations,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
}

export function usePages() {
  const context = useContext(PagesContext);

  if (!context) {
    throw new Error("usePages must be inside PagesProvider");
  }

  return context;
}
