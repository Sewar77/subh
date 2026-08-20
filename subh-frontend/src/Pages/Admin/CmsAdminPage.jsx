import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AddIcon from "@mui/icons-material/Add";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CmsPageSelector from "../../components/Admin/Cms/CmsPageSelector.jsx";
import CmsSectionEditor from "../../components/Admin/Cms/CmsSectionEditor.jsx";
import SectionBuilderCard from "../../components/Admin/Cms/SectionBuilderCard.jsx";
import AddSectionDialog from "../../components/Admin/Cms/AddSectionDialog.jsx";
import ArchivedSections from "../../components/Admin/Cms/ArchivedSections.jsx";
import AppearanceEditor from "../../components/Admin/Cms/AppearanceEditor.jsx";
import ConfirmDeleteModal from "../../components/Admin/Modal/ConfirmDeleteModal.jsx";
import AdminInstructions from "../../components/Admin/AdminInstructions.jsx";
import {
  addSectionMedia,
  archiveSection,
  deleteSectionMedia,
  duplicateSection,
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
  updateSectionAppearance,
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
  const [addSectionDialogOpen, setAddSectionDialogOpen] = useState(false);

  const activeSections = useMemo(
    () =>
      [...(page?.sections || [])]
        .filter((s) => !s.isArchived)
        .sort((left, right) => left.position - right.position),
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
      await runMutation(
        async () => {
          const updated = await updateSectionVisibility(target.id, isVisible);
          replaceCanonicalSection(updated);
        },
        isVisible ? "Section is now visible." : "Section is now hidden.",
      );
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

  const handleDuplicate = async (target) => {
    try {
      await runMutation(async () => {
        const duplicated = await duplicateSection(target.id, {});
        replaceCanonicalSection(duplicated);
        toast.success("Section duplicated. New section is hidden.");
      }, null);
    } catch {
      // The page alert displays the normalized API error.
    }
  };

  const handleSectionMove = async (section, direction) => {
    const currentIndex = activeSections.findIndex(
      (s) => String(s.id) === String(section.id),
    );
    if (currentIndex === -1) return;

    const toIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (toIndex < 0 || toIndex >= activeSections.length) return;

    const reordered = [...activeSections];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const sectionIds = reordered.map((item) => item.id);

    try {
      await runMutation(async () => {
        const updatedSections = await reorderPageSections(pageId, sectionIds);
        setPage((current) => ({
          ...current,
          sections: updatedSections,
        }));
        const selected = updatedSections.find(
          (item) => String(item.id) === String(sectionId),
        );
        if (selected) setSection(selected);
      }, "Section moved.");
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

  const handleAddMediaAsset = (target, slot, asset) =>
    runMutation(async () => {
      await addSectionMedia(target.id, {
        slot: slot.key,
        mediaType: "image",
        fileRef: asset.url,
        altEn: asset.altTextEn || "",
        altAr: asset.altTextAr || "",
      });
      return refreshSection(target.id);
    }, "Media added from the Media Library.");

  const handleReplaceMediaAsset = (target, item, asset) =>
    runMutation(async () => {
      await replaceSectionMedia(target.id, item.id, asset.url);
      return refreshSection(target.id);
    }, "Media replaced from the Media Library.");

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

  const handleSaveAppearance = (target, patch) =>
    runMutation(async () => {
      const updated = await updateSectionAppearance(target.id, patch);
      replaceCanonicalSection(updated);
      return updated;
    }, "Design saved.");

  const handleSectionCreated = (newSection) => {
    if (page) {
      setPage((current) => ({
        ...current,
        sections: [...current.sections, newSection].sort(
          (left, right) => left.position - right.position,
        ),
      }));
      editSection(newSection);
    }
  };

  const handlePreviewPage = () => {
    if (page?.key) {
      window.open(`/?preview=true#/${page.key}`, "_blank");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h3" component="h1" fontWeight={700}>
            Page Builder
          </Typography>
          <Typography color="text.secondary">
            Manage section instances on fixed pages using visual layout.
          </Typography>
        </Box>
        <AdminInstructions>
          Add, edit, and arrange section instances on this page. Hidden sections
          remain editable but won't appear publicly. Archived sections are
          removed from the builder and can be restored later.
        </AdminInstructions>

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
              <Typography>Loading pages...</Typography>
            </Stack>
          ) : pages.length === 0 ? (
            <Alert severity="info">No pages are available.</Alert>
          ) : (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems="center"
            >
              <Box flex={1}>
                <CmsPageSelector
                  pages={pages}
                  value={pageId}
                  disabled={loadingPage || mutating}
                  onChange={changePage}
                />
              </Box>
              {page && (
                <Button
                  variant="outlined"
                  startIcon={<VisibilityIcon />}
                  onClick={handlePreviewPage}
                  disabled={loadingPage || mutating}
                >
                  Preview Page
                </Button>
              )}
            </Stack>
          )}
        </Paper>

        {loadingPage ? (
          <Box role="status" sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 2 }}>Loading page sections...</Typography>
          </Box>
        ) : page ? (
          <Stack spacing={2}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h5">{page.name || page.key}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {activeSections.length} active section
                  {activeSections.length === 1 ? "" : "s"}
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddSectionDialogOpen(true)}
                disabled={mutating}
              >
                Add Section
              </Button>
            </Box>

            {activeSections.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>
                  No sections yet
                </Typography>
                <Typography color="text.secondary" gutterBottom>
                  Start building by adding your first section.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setAddSectionDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Add First Section
                </Button>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {activeSections.map((s, index) => (
                  <Box key={s.id}>
                    <SectionBuilderCard
                      section={s}
                      busy={mutating}
                      onEdit={editSection}
                      onDuplicate={handleDuplicate}
                      onVisibility={handleVisibility}
                      onArchive={handleArchive}
                      onRestore={handleRestore}
                      onMoveUp={() => handleSectionMove(s, "up")}
                      onMoveDown={() => handleSectionMove(s, "down")}
                      canMoveUp={index > 0}
                      canMoveDown={index < activeSections.length - 1}
                    />
                    {index < activeSections.length - 1 && (
                      <Box
                        sx={{
                          py: 1,
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "primary.main",
                          fontSize: "0.875rem",
                          "&:hover": { textDecoration: "underline" },
                        }}
                        role="button"
                        onClick={() => setAddSectionDialogOpen(true)}
                      >
                        + Add Section Here
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}

            <ArchivedSections
              sections={page.sections}
              busy={mutating}
              onRestore={handleRestore}
            />

            {loadingSection ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading editor...</Typography>
              </Paper>
            ) : sectionId && section ? (
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Stack spacing={3}>
                  <CmsSectionEditor
                    key={section.id}
                    section={section}
                    busy={mutating}
                    onDirtyChange={setDirty}
                    onSaveContent={handleContentSave}
                    onAddMedia={handleAddMedia}
                    onAddMediaAsset={handleAddMediaAsset}
                    onReplaceMedia={handleReplaceMedia}
                    onReplaceMediaAsset={handleReplaceMediaAsset}
                    onUpdateMedia={handleUpdateMedia}
                    onDeleteMedia={handleDeleteMedia}
                    onReorderMedia={handleReorderMedia}
                  />

                  <AppearanceEditor
                    section={section}
                    editingSchema={section.editingSchema}
                    busy={mutating}
                    onSaveAppearance={handleSaveAppearance}
                  />
                </Stack>
              </Paper>
            ) : null}
          </Stack>
        ) : null}
      </Stack>

      <AddSectionDialog
        open={addSectionDialogOpen}
        pageId={pageId}
        onClose={() => setAddSectionDialogOpen(false)}
        onSectionCreated={handleSectionCreated}
      />

      <ConfirmDeleteModal
        open={Boolean(pendingNavigation)}
        title="Discard unsaved changes?"
        message="You have unsaved content changes. Discard them and continue?"
        confirmLabel="Discard changes"
        severity="warning"
        onCancel={() => setPendingNavigation(null)}
        onConfirm={discardAndNavigate}
      />
    </Container>
  );
}
