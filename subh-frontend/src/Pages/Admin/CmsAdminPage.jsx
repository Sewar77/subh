import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  CircularProgress,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import CmsPageSelector from "../../components/Admin/Cms/CmsPageSelector.jsx";
import CmsSectionEditor from "../../components/Admin/Cms/CmsSectionEditor.jsx";
import CmsSectionList from "../../components/Admin/Cms/CmsSectionList.jsx";
import ConfirmDeleteModal from "../../components/Admin/Modal/ConfirmDeleteModal.jsx";
import AdminInstructions from "../../components/Admin/AdminInstructions.jsx";
import {
  addSectionMedia,
  archiveSection,
  deleteSectionMedia,
  getAdminPage,
  getAdminSection,
  getFixedPages,
  reorderPageSections,
  reorderSectionMedia,
  replaceSectionMedia,
  restoreSection,
  updateSectionContent,
  updateSectionMedia,
  updateSectionVisibility,
  uploadCmsFile,
} from "../../Services/cmsService.js";

export default function CmsAdminPage() {
  const { pageId, sectionId } = useParams();
  const navigate = useNavigate();
  const [pages, setPages] = useState([]);
  const [page, setPage] = useState(null);
  const [section, setSection] = useState(null);
  const [loadingPages, setLoadingPages] = useState(true);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingSection, setLoadingSection] = useState(false);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const orderedSections = useMemo(
    () =>
      [...(page?.sections || [])].sort(
        (left, right) => left.position - right.position,
      ),
    [page?.sections],
  );

  const replaceCanonicalSection = useCallback((updatedSection) => {
    setPage((current) =>
      current
        ? {
            ...current,
            sections: current.sections
              .map((item) =>
                String(item.id) === String(updatedSection.id)
                  ? updatedSection
                  : item,
              )
              .sort((left, right) => left.position - right.position),
          }
        : current,
    );
    setSection((current) =>
      current && String(current.id) === String(updatedSection.id)
        ? updatedSection
        : current,
    );
    return updatedSection;
  }, []);

  const refreshSection = useCallback(
    async (id) => {
      const canonicalSection = await getAdminSection(id);
      replaceCanonicalSection(canonicalSection);
      return canonicalSection;
    },
    [replaceCanonicalSection],
  );

  useEffect(() => {
    let active = true;

    const loadPages = async () => {
      try {
        setLoadingPages(true);
        setError("");
        const fixedPages = await getFixedPages();
        if (!active) return;
        setPages(fixedPages);
        if (!pageId && fixedPages.length > 0) {
          navigate(`/admin/cms/${fixedPages[0].id}`, { replace: true });
        }
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setLoadingPages(false);
      }
    };

    loadPages();
    return () => {
      active = false;
    };
  }, [navigate, pageId]);

  useEffect(() => {
    if (!pageId) {
      return undefined;
    }

    let active = true;
    const loadPage = async () => {
      try {
        setLoadingPage(true);
        setError("");
        const loadedPage = await getAdminPage(pageId);
        if (!active) return;
        setPage(loadedPage);
      } catch (requestError) {
        if (active) {
          setPage(null);
          setError(requestError.message);
        }
      } finally {
        if (active) setLoadingPage(false);
      }
    };

    loadPage();
    return () => {
      active = false;
    };
  }, [pageId]);

  useEffect(() => {
    if (!sectionId) {
      return undefined;
    }

    let active = true;
    const loadSection = async () => {
      try {
        setLoadingSection(true);
        setError("");
        const loadedSection = await getAdminSection(sectionId);
        if (!active) return;
        if (String(loadedSection.pageId) !== String(pageId)) {
          setSection(null);
          setError("This section does not belong to the selected page.");
          return;
        }
        setSection(loadedSection);
        setDirty(false);
      } catch (requestError) {
        if (active) {
          setSection(null);
          setError(requestError.message);
        }
      } finally {
        if (active) setLoadingSection(false);
      }
    };

    loadSection();
    return () => {
      active = false;
    };
  }, [pageId, sectionId]);

  const changePage = (nextPageId) => {
    if (dirty) {
      setPendingNavigation({ type: "page", value: nextPageId });
      return;
    }
    setDirty(false);
    setSection(null);
    navigate(`/admin/cms/${nextPageId}`);
  };

  const editSection = (nextSection) => {
    if (dirty) {
      setPendingNavigation({ type: "section", value: nextSection.id });
      return;
    }
    setDirty(false);
    navigate(`/admin/cms/${pageId}/sections/${nextSection.id}`);
  };

  const discardAndNavigate = () => {
    const pending = pendingNavigation;
    setPendingNavigation(null);
    setDirty(false);
    setSection(null);
    if (pending.type === "page") navigate(`/admin/cms/${pending.value}`);
    else navigate(`/admin/cms/${pageId}/sections/${pending.value}`);
  };

  const runMutation = async (operation, successMessage) => {
    try {
      setMutating(true);
      setError("");
      const result = await operation();
      if (successMessage) toast.success(successMessage);
      return result;
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    } finally {
      setMutating(false);
    }
  };

  const handleContentSave = (target, patch) =>
    runMutation(async () => {
      const updated = await updateSectionContent(target.id, patch);
      replaceCanonicalSection(updated);
      return updated;
    }, "Content saved.");

  const handleVisibility = async (target, isVisible) => {
    try {
      await runMutation(async () => {
        const updated = await updateSectionVisibility(target.id, isVisible);
        replaceCanonicalSection(updated);
      }, isVisible ? "Section is now visible." : "Section is now hidden.");
    } catch {
      // The page alert displays the normalized API error.
    }
  };

  const handleArchive = async (target) => {
    try {
      await runMutation(async () => {
        const updated = await archiveSection(target.id);
        replaceCanonicalSection(updated);
      }, "Section archived.");
    } catch {
      // The page alert displays the normalized API error.
    }
  };

  const handleRestore = async (target) => {
    try {
      await runMutation(async () => {
        const updated = await restoreSection(target.id);
        replaceCanonicalSection(updated);
      }, "Section restored.");
    } catch {
      // The page alert displays the normalized API error.
    }
  };

  const handleSectionMove = async (fromIndex, toIndex) => {
    const reordered = [...orderedSections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const payload = reordered.map((item, index) => ({
      id: item.id,
      position: index + 1,
    }));

    try {
      await runMutation(async () => {
        const updatedSections = await reorderPageSections(pageId, payload);
        setPage((current) => ({
          ...current,
          sections: updatedSections,
        }));
        const selected = updatedSections.find(
          (item) => String(item.id) === String(sectionId),
        );
        if (selected) setSection(selected);
      }, "Section order saved.");
    } catch {
      // Local order is not changed until the server confirms the mutation.
    }
  };

  const handleAddMedia = (target, slot, file, mediaType) =>
    runMutation(async () => {
      const fileRef = await uploadCmsFile(file);
      await addSectionMedia(target.id, {
        slot: slot.key,
        mediaType,
        fileRef,
      });
      return refreshSection(target.id);
    }, "Media uploaded.");

  const handleReplaceMedia = (target, item, file) =>
    runMutation(async () => {
      const fileRef = await uploadCmsFile(file);
      await replaceSectionMedia(target.id, item.id, fileRef);
      return refreshSection(target.id);
    }, "Media replaced.");

  const handleUpdateMedia = (target, item, metadata) =>
    runMutation(async () => {
      await updateSectionMedia(target.id, item.id, metadata);
      return refreshSection(target.id);
    }, "Media metadata saved.");

  const handleDeleteMedia = (target, item) =>
    runMutation(async () => {
      await deleteSectionMedia(target.id, item.id);
      return refreshSection(target.id);
    }, "Media removed.");

  const handleReorderMedia = (target, slot, media) =>
    runMutation(async () => {
      await reorderSectionMedia(
        target.id,
        slot.key,
        media.map((item, index) => ({
          id: item.id,
          position: index + 1,
        })),
      );
      return refreshSection(target.id);
    }, "Media order saved.");

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700}>
            Structured CMS
          </Typography>
          <Typography color="text.secondary">
            Edit fixed section content and media using the developer-owned
            editing schema.
          </Typography>
        </Box>
        <AdminInstructions>Use the page selector to manage fixed sections. Content and media fields are developer-defined. Hidden sections stay editable; archived sections are not public and can be restored. Destructive media changes require confirmation.</AdminInstructions>

        <Breadcrumbs aria-label="CMS location">
          <Link component={RouterLink} to="/admin">
            Admin
          </Link>
          <Link component={RouterLink} to="/admin/cms">
            CMS
          </Link>
          {page && <Typography color="text.primary">{page.name}</Typography>}
        </Breadcrumbs>

        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper variant="outlined" sx={{ p: 2 }}>
          {loadingPages ? (
            <Stack direction="row" spacing={2} alignItems="center">
              <CircularProgress size={24} />
              <Typography>Loading fixed pages...</Typography>
            </Stack>
          ) : pages.length === 0 ? (
            <Alert severity="info">No fixed pages are available.</Alert>
          ) : (
            <CmsPageSelector
              pages={pages}
              value={pageId}
              disabled={loadingPage || mutating}
              onChange={changePage}
            />
          )}
        </Paper>

        {loadingPage ? (
          <Box role="status" sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading page sections...</Typography>
          </Box>
        ) : page ? (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, lg: 5 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="h5">{page.name || page.key}</Typography>
                  <Typography color="text.secondary">
                    {orderedSections.length} fixed section
                    {orderedSections.length === 1 ? "" : "s"}
                  </Typography>
                </Box>
                <CmsSectionList
                  sections={orderedSections}
                  selectedSectionId={sectionId}
                  busy={mutating}
                  onEdit={editSection}
                  onMove={handleSectionMove}
                  onVisibility={handleVisibility}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                />
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, lg: 7 }}>
              {loadingSection ? (
                <Box role="status" sx={{ py: 8, textAlign: "center" }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }}>Loading editor...</Typography>
                </Box>
              ) : sectionId && section ? (
                <CmsSectionEditor
                  key={section.id}
                  section={section}
                  busy={mutating}
                  onDirtyChange={setDirty}
                  onSaveContent={handleContentSave}
                  onAddMedia={handleAddMedia}
                  onReplaceMedia={handleReplaceMedia}
                  onUpdateMedia={handleUpdateMedia}
                  onDeleteMedia={handleDeleteMedia}
                  onReorderMedia={handleReorderMedia}
                />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{ p: 4, textAlign: "center" }}
                >
                  <Typography variant="h6">Select a section to edit</Typography>
                  <Typography color="text.secondary">
                    Content fields and media controls will appear here.
                  </Typography>
                </Paper>
              )}
            </Grid>
          </Grid>
        ) : null}
      </Stack>
      <ConfirmDeleteModal open={Boolean(pendingNavigation)} title="Discard unsaved changes?" message="You have unsaved content changes. Discard them and continue?" confirmLabel="Discard changes" severity="warning" onCancel={() => setPendingNavigation(null)} onConfirm={discardAndNavigate} />
    </Container>
  );
}
