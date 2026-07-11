// import { useState, useCallback } from "react";
// import { api } from "../../api";
// import toast from "react-hot-toast";

// export const usePages = () => {
//   const [pages, setPages] = useState([]);
//   const [page, setPage] = useState(null);

//   const [sections, setSections] = useState([]);
//   const [allSections, setAllSections] = useState([]);
//   const [section, setSection] = useState(null);
//   const [sectionKey, setSectionKey] = useState(null);

//   const [pageTranslations, setPageTranslations] = useState([]);
//   const [sectionTranslations, setSectionTranslations] = useState([]);

//   const [pagesLoading, setPagesLoading] = useState(false);
//   const [sectionsLoading, setSectionsLoading] = useState(false);
//   const [translationLoading, setTranslationLoading] = useState(false);

//   const handleError = (error) => {
//     const message =
//       error?.response?.data?.message ||
//       error?.message ||
//       "Something went wrong";

//     toast.error(message);
//   };

//   const handleRequest = async (callback, setLoading) => {
//     try {
//       setLoading(true);

//       return await callback();
//     } catch (error) {
//       handleError(error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // =========================
//   // PAGES
//   // =========================

//   const fetchPages = useCallback(
//     () =>
//       handleRequest(async () => {
//         const res = await api.get("/pages");

//         setPages(res.data.pages || []);

//         return res.data.pages;
//       }, setPagesLoading),
//     [],
//   );

//   const fetchPageById = useCallback(
//     (id) =>
//       handleRequest(async () => {
//         setPage(null);

//         const res = await api.get(`/pages/${id}`);

//         setPage(res.data.page);

//         return res.data.page;
//       }, setPagesLoading),
//     [],
//   );

//   const fetchPageByKey = useCallback(
//     (key) =>
//       handleRequest(async () => {
//         setPage(null);

//         const res = await api.get(`/pages/key/${key}`);

//         setPage(res.data.page);

//         return res.data.page;
//       }, setPagesLoading),
//     [],
//   );

//   // =========================
//   // PAGE TRANSLATIONS
//   // =========================

//   const getPageTranslations = useCallback(
//     (pageId) =>
//       handleRequest(async () => {
//         const res = await api.get(`/page-translations/${pageId}`);

//         setPageTranslations(res.data.translations || []);

//         return res.data.translations;
//       }, setTranslationLoading),
//     [],
//   );

//   const createPageTranslation = useCallback(
//     (pageId, data) =>
//       handleRequest(async () => {
//         const res = await api.post(`/page-translations/${pageId}`, data);

//         toast.success("Page translation added");

//         return res.data;
//       }, setTranslationLoading),
//     [],
//   );

//   const updatePageTranslation = useCallback(
//     (id, data) =>
//       handleRequest(async () => {
//         const res = await api.put(`/page-translations/${id}`, data);

//         toast.success("Page translation updated");

//         return res.data;
//       }, setTranslationLoading),
//     [],
//   );

//   const deletePageTranslation = useCallback(
//     (id) =>
//       handleRequest(async () => {
//         await api.delete(`/page-translations/${id}`);

//         setPageTranslations((prev) => prev.filter((item) => item.id !== id));

//         toast.success("Page translation deleted");
//       }, setTranslationLoading),
//     [],
//   );

//   // =========================
//   // SECTIONS
//   // =========================

//   const getSectionsByPageId = useCallback(
//     (pageId) =>
//       handleRequest(async () => {
//         const res = await api.get(`/pages/${pageId}/sections`);

//         setSections(res.data.sections || []);

//         return res.data.sections;
//       }, setSectionsLoading),
//     [],
//   );

//   const getSectionsByPageKey = useCallback(
//     (key) =>
//       handleRequest(async () => {
//         setSectionKey(null);

//         const res = await api.get(`/pages/sections/${key}`);

//         setSectionKey(res.data.sections || []);

//         return res.data.sections;
//       }, setSectionsLoading),
//     [],
//   );

//   const getAllSections = useCallback(
//     () =>
//       handleRequest(async () => {
// const res = await api.get("/sections");

// setAllSections(res.data.sections || []);

// return res.data.sections;
//       }, setSectionsLoading),
//     [],
//   );

//   const fetchSectionById = useCallback(
//     (id) =>
//       handleRequest(async () => {
//         const res = await api.get(`/sections/${id}`);

//         setSection(res.data.section);

//         return res.data.section;
//       }, setSectionsLoading),
//     [],
//   );

//   const toggleSectionVisibility = useCallback(
//     (id) =>
//       handleRequest(async () => {
//         const res = await api.patch(`/sections/${id}/toggle`);

//         setSection(res.data.section);

//         setAllSections((prev) =>
//           prev.map((item) => (item.id === id ? res.data.section : item)),
//         );

//         setSections((prev) =>
//           prev.map((item) => (item.id === id ? res.data.section : item)),
//         );

//         toast.success(
//           res.data.section.is_visible
//             ? "Section is now visible"
//             : "Section is now hidden",
//         );

//         return res.data.section;
//       }, setSectionsLoading),
//     [],
//   );

//   // =========================
//   // SECTION TRANSLATIONS
//   // =========================

//   const getSectionTranslations = useCallback(
//     (sectionId) =>
//       handleRequest(async () => {
//         const res = await api.get(`/sections/${sectionId}/translations`);

//         setSectionTranslations(res.data.translations || []);

//         return res.data.translations;
//       }, setTranslationLoading),
//     [],
//   );

//   const updateSectionTranslation = useCallback(
//     (id, data) =>
//       handleRequest(async () => {
//         const res = await api.put(`/translations/${id}`, data);

//         toast.success("Section content updated");

//         return res.data;
//       }, setTranslationLoading),
//     [],
//   );

//   return {
//     // STATES
//     pages,
//     page,

//     sections,
//     section,
//     allSections,
//     sectionKey,

//     pageTranslations,
//     sectionTranslations,

//     // LOADING
//     pagesLoading,
//     sectionsLoading,
//     translationLoading,

//     // PAGES
//     fetchPages,
//     fetchPageById,
//     fetchPageByKey,

//     // PAGE TRANSLATIONS
//     getPageTranslations,
//     createPageTranslation,
//     updatePageTranslation,
//     deletePageTranslation,

//     // SECTIONS
//     getSectionsByPageId,
//     getSectionsByPageKey,
//     getAllSections,
//     fetchSectionById,
//     toggleSectionVisibility,

//     // SECTION TRANSLATIONS
//     getSectionTranslations,
//     updateSectionTranslation,
//   };
// };
