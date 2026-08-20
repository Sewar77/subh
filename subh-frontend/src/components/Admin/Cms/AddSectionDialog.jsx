import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import toast from "react-hot-toast";
import TemplateGallery from "./TemplateGallery.jsx";
import {
  getSectionTemplates,
  createSection,
} from "../../../Services/cmsService.js";

export default function AddSectionDialog({
  open,
  pageId,
  onClose,
  onSectionCreated,
}) {
  const [templates, setTemplates] = useState([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");

  useEffect(() => {
    if (!open) return;

    let active = true;

    const loadTemplates = async () => {
      try {
        setLoadingTemplates(true);
        setTemplateError("");
        const loaded = await getSectionTemplates();
        if (active) setTemplates(loaded);
      } catch (error) {
        if (active) setTemplateError(error.message);
      } finally {
        if (active) setLoadingTemplates(false);
      }
    };

    loadTemplates();
    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      const timer = setTimeout(() => {
        setSelectedTemplate(null);
        setCreateError("");
      }, 0);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [open]);

  const handleClose = () => {
    setSelectedTemplate(null);
    setCreateError("");
    onClose();
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const handleBack = () => {
    setSelectedTemplate(null);
    setCreateError("");
  };

  const handleCreate = async () => {
    if (!selectedTemplate) return;

    try {
      setCreating(true);
      setCreateError("");
      const newSection = await createSection(pageId, {
        templateKey: selectedTemplate.key,
      });
      toast.success("Section created");
      onSectionCreated(newSection);
      handleClose();
    } catch (error) {
      setCreateError(error.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>
        {selectedTemplate
          ? `Create ${selectedTemplate.name || selectedTemplate.key} Section`
          : "Add New Section"}
      </DialogTitle>
      <DialogContent sx={{ py: 3 }}>
        {selectedTemplate ? (
          <div>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Template:</strong>{" "}
              {selectedTemplate.name || selectedTemplate.key}
            </div>
            <div style={{ marginBottom: "0.5rem" }}>
              <strong>Description:</strong> {selectedTemplate.description}
            </div>
            <div>
              <strong>New sections start hidden.</strong> You'll configure them
              before publishing.
            </div>
          </div>
        ) : (
          <TemplateGallery
            templates={templates}
            loading={loadingTemplates}
            error={templateError}
            onSelectTemplate={handleSelectTemplate}
            disabled={creating}
          />
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={creating}>
          Cancel
        </Button>
        {selectedTemplate && (
          <>
            <Button onClick={handleBack} disabled={creating}>
              Back to templates
            </Button>
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Create section"
              )}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
