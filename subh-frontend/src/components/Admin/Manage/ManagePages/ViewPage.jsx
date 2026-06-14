import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { usePages } from "../../../../Hooks/usePages";
import { useEffect, useState } from "react";
import AddButton from "../../Buttons/AddBtn";
import Title from "../../Headers/Titles";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import DeleteButton from "../../Buttons/DeleteBtn";
import PagePreview from "./PagePreview";
export default function ViewPage() {
  const {
    deletePageById,
    fetchPageById,
    page,
    getSectionsByPageId,
    sections,
    deleteSection,
  } = usePages();
  const { pageId } = useParams();
  const [confirmPageDelete, setConfirmPageDelete] = useState(false);
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => {
    fetchPageById(pageId);
    getSectionsByPageId(pageId);
  }, [pageId]);
  if (!page) return null;
  const handleDeletePage = async () => {
    await deletePageById(pageId);
    setConfirmPageDelete(false);
    navigate("/admin/view-pages");
  };
  return (
    <Container sx={{ py: 4 }}>
      {/* HEADER */}
      <Stack
        direction="row"
        sx={{ justifyContent: "space-between", alignItems: "center", my: 2 }}
      >
        <Box>
          <Title
            title={`Page: ${page.key}`}
            caption={` Template: ${page.template_name}`}
          />
        </Box>
        <Chip
          label={page.status}
          color={page.status === "draft" ? "warning" : "success"}
          size="large"
          sx={{ p: 3, fontSize: "20px" }}
        />
      </Stack>
      {/* ACTIONS */}
      <Stack direction="row" spacing={2} sx={{ my: 3 }}>
        <AddButton label="Section" to={`/admin/create-section/${page.id}`} />
        <Button
          onClick={() => navigate(`/admin/view-page-sections/${page.id}`)}
          variant="outlined"
        >
          View Sections
        </Button>
        <Button
          onClick={() => navigate(`/admin/add-translations-page/${page.id}`)}
          variant="contained"
          color="primary"
        >
          Add Translation
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate(`/admin/edit-page/${page.id}`)}
          color="secondary"
        >
          Edit Page
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setConfirmPageDelete(true)}
        >
          Delete Page
        </Button>
      </Stack>
      <Stack direction={{ xs: "column", md: "column" }} spacing={3}>
        {/* MAIN INFO */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Typography variant="h5" fontWeight={800} gutterBottom>
              Page Information
            </Typography>

            <Divider sx={{ mb: 3 }} />

            <Stack spacing={3}>
              {/* INTERNAL KEY */}
              <Box>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  Internal Page Identifier
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: "1rem", mt: 0.5 }}
                >
                  Used by the system to uniquely identify this page. It is not
                  shown to users on the website.
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontFamily: "monospace",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                  }}
                >
                  {page.key}
                </Typography>
              </Box>

              {/* TEMPLATE */}
              <Box>
                <Typography sx={{ fontSize: "1.2rem", fontWeight: 800 }}>
                  Page Structure Template
                </Typography>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ fontSize: "1rem", mt: 0.5 }}
                >
                  Defines the layout and available sections (Hero, Text, Image).
                  This controls how the page is built.
                </Typography>

                <Typography sx={{ mt: 1, fontSize: "1.1rem" }}>
                  {page.template_name} ({page.template_key})
                </Typography>
              </Box>

              {/* CREATED */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                  justifyContent: "center",
                }}
              >
                {/* CREATED */}
                <Box
                  sx={{
                    flex: "1 1 300px",
                    minWidth: 250,
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 800 }}>
                    Created Date
                  </Typography>

                  <Typography
                    sx={{ fontSize: "1rem", color: "text.secondary", mt: 0.5 }}
                  >
                    When this page was first created in the CMS.
                  </Typography>

                  <Typography sx={{ fontSize: "1.1rem", mt: 1 }}>
                    {new Date(page.created_at).toLocaleString()}
                  </Typography>
                </Box>

                {/* UPDATED */}
                <Box
                  sx={{
                    flex: "1 1 300px",
                    minWidth: 250,
                    textAlign: "center",
                    px: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "1.2rem", fontWeight: 800 }}>
                    Last Updated
                  </Typography>

                  <Typography
                    sx={{ fontSize: "1rem", color: "text.secondary", mt: 0.5 }}
                  >
                    The most recent change made to this page or its content.
                  </Typography>

                  <Typography sx={{ fontSize: "1.1rem", mt: 1 }}>
                    {new Date(page.updated_at).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
        {/* PREVIEW AREA */}
        <PagePreview page={page} />
      </Stack>
      {/* SECTIONS */}
      <Card
        sx={{
          mt: 4,
          p: 2,
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-evenly", my: 3 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Page Sections
            </Typography>
            <AddButton
              label="Section"
              to={`/admin/create-section/${page.id}`}
            />
          </Box>
          {/* EMPTY STATE */}
          {(!sections || sections.length === 0) && (
            <Box
              sx={{
                mt: 3,
                py: 5,
                textAlign: "center",
                border: "1px dashed #ccc",
                borderRadius: 2,
                backgroundColor: "#fafafa",
              }}
            >
              <Typography variant="h6" fontWeight={700} color="text.secondary">
                No sections yet
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                This page doesn’t contain any sections. Start by creating one.
              </Typography>
            </Box>
          )}
          {/* LIST */}
          {sections?.length > 0 && (
            <Grid container spacing={3} mt={1}>
              {sections.map((section) => (
                <Grid
                  size={{ xs: 12, md: 4, lg: 6 }}
                  key={section.id}
                  sx={{ alignItems: "center" }}
                >
                  <Card
                    variant="outlined"
                    sx={{
                      p: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      transition: "0.2s",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: 3,
                      },
                    }}
                  >
                    {/* HEADER */}
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        my: 3,
                      }}
                    >
                      <Typography variant="h6" fontWeight={800}>
                        {section.type.toUpperCase()}
                      </Typography>

                      <Chip
                        label={section.is_visible ? "VISIBLE" : "HIDDEN"}
                        color={section.is_visible ? "success" : "default"}
                        size="large"
                      />
                    </Stack>
                    {/* INFO */}
                    <Stack spacing={1}>
                      <Typography variant="body1">
                        <strong>Position:</strong> {section.position}
                      </Typography>

                      <Typography variant="body1">
                        <strong>Type:</strong> {section.type}
                      </Typography>
                    </Stack>
                    {/* PREVIEW PLACEHOLDER */}
                    <Box
                      sx={{
                        mt: 2,
                        height: 120,
                        borderRadius: 2,
                        border: "1px dashed #ccc",
                        backgroundColor: "#f5f5f5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography color="text.secondary">
                        Section Preview
                      </Typography>
                    </Box>
                    {/* ACTIONS */}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ justifyContent: "center", my: 3 }}
                    >
                      <Button size="small" variant="contained">
                        Edit
                      </Button>
                      <Button size="small" variant="outlined">
                        Preview
                      </Button>
                      <Tooltip title="Delete">
                        <DeleteButton
                          onClick={() => {
                            setSelectedId(section.id);
                            setConfirmDelete(true);
                          }}
                        />
                      </Tooltip>
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>
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
      {confirmPageDelete && (
        <ConfirmDeleteModal
          open={confirmPageDelete}
          onClose={() => setConfirmPageDelete(false)}
          onConfirm={handleDeletePage}
          label="Page"
        />
      )}
    </Container>
  );
}
