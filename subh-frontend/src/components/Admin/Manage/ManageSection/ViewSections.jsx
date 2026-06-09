import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Typography,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import AddButton from "../../Buttons/AddBtn";
import { usePages } from "../../../../Hooks/usePages";
import Title from "../../Headers/Titles";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";

export default function ViewSection() {
  const { pageId } = useParams();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const { sections, getSectionsByPageId, fetchPageById, page, deleteSection } =
    usePages();
  const navigate = useNavigate();
  useEffect(() => {
    getSectionsByPageId(pageId);
    fetchPageById(pageId);
  }, [pageId]);

  const getTypeLabel = (type) => {
    const map = {
      hero: "Hero Section",
      text: "Text Block",
      image_text: "Image + Text",
    };
    return map[type] || type;
  };

  return (
    <Box sx={{ p: 4 }}>
      {/* HEADER */}
      <Title
        title={" Page Sections"}
        caption={`${page?.key} • ${page?.template_name}`}
      />

      <Typography variant="body1" sx={{ mb: 3 }} color="text.secondary">
        These blocks build the page layout. Admin can reorder, edit, or hide
        sections. Think of this as stacking Lego pieces that form the page.
      </Typography>

      <AddButton
        to={`/admin/create-section/${pageId}`}
        sx={{ my: 3 }}
        label="Section"
      />

      <Divider sx={{ my: 4 }} />
      {sections.length === 0 && (
        <>
          <Typography>No SECTIONS YET FOR THIS PAGE, create new</Typography>
        </>
      )}
      {/* SECTIONS */}
      <Stack spacing={3}>
        {sections
          ?.sort((a, b) => a.position - b.position)
          .map((section) => (
            <Card
              key={section.id}
              sx={{
                borderRadius: 3,
                p: 1,
                boxShadow: 2,
              }}
            >
              <CardContent>
                {/* TITLE ROW */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h5" fontWeight={800}>
                    {getTypeLabel(section.type)}
                  </Typography>

                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Chip
                      label={section.is_visible ? "Visible" : "Hidden"}
                      color={section.is_visible ? "success" : "default"}
                      size="medium"
                    />
                  </Box>
                </Box>

                {/* INFO */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Position: #{section.position}
                  </Typography>

                  <Typography variant="body2" color="text.secondary">
                    Internal type: {section.type}
                  </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* ACTIONS */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="contained" size="large">
                    Edit Content
                  </Button>

                  <Button variant="outlined" size="large">
                    Reorder
                  </Button>

                  <Button
                    color="error"
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      setSelectedId(section.id);
                      setConfirmDelete(true);
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
      </Stack>
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteSection(selectedId);
            await getSectionsByPageId(pageId);
            setConfirmDelete(false);
          }}
          label="Section"
        />
      )}
    </Box>
  );
}
