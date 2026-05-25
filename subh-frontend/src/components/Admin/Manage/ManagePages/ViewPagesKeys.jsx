import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import { usePages } from "../../../../Hooks/usePages";
import DeleteButton from "../../Buttons/DeleteBtn";
import UpdateBtn from "../../Buttons/UpdateBtn";
import AddButton from "../../Buttons/AddBtn";
import ViewButton from "../../Buttons/ViewBtn";
import { useNavigate, useParams } from "react-router-dom";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";

export default function ViewPagesKeys() {
  const { pages, fetchPages, deletePage } = usePages();
  const navigate = useNavigate();
  const { pageId } = useParams();
  useEffect(() => {
    fetchPages();
  }, []);
  const handleViewSections = (pageId) => {
    navigate(`/admin/sections/page/${pageId}`);
  };
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          my: 2,
          p: 4,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 700,
          }}
        >
          Pages
        </Typography>
        <AddButton label={"Page"} to={"/admin/new-page"} />
      </Box>
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Grid container spacing={4} sx={{ justifyContent: "center" }}>
          {pages?.map((page) => (
            <Grid
              key={page.id}
              xs={12}
              sm={12}
              md={3}
              useFlexGap
              lg={3}
              sx={{ alignItems: "center", justifyContent: "center" }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 3,
                  alignItems: "center",
                }}
              >
                <CardContent>
                  {/* HEADER */}
                  <Stack
                    direction="row"
                    sx={{
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h6">{page.key}</Typography>

                    <Chip
                      label={page.status}
                      color={
                        page.status === "published" ? "success" : "warning"
                      }
                      size="small"
                      sx={{ alignItems: "center", ml: 1 }}
                    />
                  </Stack>

                  <Divider sx={{ my: 2 }} />

                  {/* INFO */}
                  <Stack
                    direction="row"
                    spacing={5}
                    sx={{ flexWrap: "wrap", justifyContent: "center" }}
                    useFlexGap
                  >
                    <Chip
                      label={`Default Language: ${page.default_locale}`}
                      size="small"
                      sx={{ p: 2 }}
                    />

                    <Chip
                      label={`Created: ${new Date(page.created_at).toLocaleDateString()}`}
                      size="small"
                      sx={{ p: 2 }}
                    />

                    <Chip
                      label={`Created By: ${page.created_by_name || page.created_by}`}
                      size="small"
                      color="success"
                      sx={{ p: 2 }}
                    />
                    <Chip
                      label={`Updated By: ${page.updated_by_name || page.updated_by}`}
                      size="small"
                      color="info"
                      sx={{ p: 2 }}
                    />
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{
                      textAlign: "center",
                      mt: 1,
                      justifyContent: "center",
                    }}
                  >
                    <DeleteButton
                      onClick={() => {
                        (setConfirmDelete(true), setSelectedId(page.id));
                      }}
                    />
                    <UpdateBtn />
                  </Stack>
                </CardContent>

                {/* ACTIONS */}
                <Stack direction="row" spacing={1} sx={{ px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    onClick={() => navigate(`/admin/create-section/${page.id}`)}
                  >
                    Create Section
                  </Button>

                  <ViewButton onClick={() => handleViewSections(page.id)} />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => (deletePage(selectedId), setConfirmDelete(false))}
          label={"Page Key"}
        />
      )}
    </>
  );
}
