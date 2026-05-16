import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Typography,
  Stack,
  Box,
  Divider,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useCategories } from "../../../../Hooks/useCategories";
import { useEffect, useState } from "react";
import UpdateBtn from "../../Buttons/UpdateBtn";
import DeleteButton from "../../Buttons/DeleteBtn";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";

export default function ViewCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    category,
    categories,
    loadCategories,
    deleteCategoryById,
    getCategory,
  } = useCategories();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedViewId, setSelectedViewId] = useState(null);
  const [selectedUpdateId, setSelectedUpdateId] = useState(null);
  const handleUpdateCategory = (catId) => {
    navigate(`/admin/category/update/${catId}`);
  };
  useEffect(() => {
    if (id) getCategory(id);
  }, [id]);

  if (!category) {
    return (
      <Container sx={{ mt: 5 }}>
        <Typography>Loading category...</Typography>
      </Container>
    );
  }

  return (
    <Container sx={{ my: 5 }}>
      <Card sx={{ p: 4, borderRadius: 3 }}>
        <Stack
          spacing={3}
          sx={{
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Typography variant="h3">Category: {category.name_en}</Typography>
          <Divider />
          <Avatar
            src={category.image}
            variant="rounded"
            sx={{
              width: 550,
              height: 450,
              objectFit: "contain",
              borderRadius: 6,
            }}
          />

          <CardContent
            sx={{
              display: "flex",
              flexDirection: "row",
              textAlign: "center",
              justifyContent: "center",
              gap: { xs: 1, md: 2, lg: 6 },
              alignContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Box>
              <Typography>English Language</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {category.name_en}
              </Typography>
              <Typography variant="h5" sx={{ mt: 2 }}>
                {category.description_en}
              </Typography>
            </Box>
            <Box
              sx={{
                width: { xs: "60%", sm: "60%", md: "1px" },
                height: { xs: "1px", sm: "1px", md: "40px" },
                bgcolor: "text.secondary",
                mx: { md: 2 },
                my: { xs: 2, md: 0 },
              }}
            />
            <Box>
              <Typography>اللغة العربية</Typography>
              <Typography variant="h4" sx={{ direction: "rtl", mt: 1 }}>
                {category.name_ar}
              </Typography>

              <Typography variant="h5" sx={{ mt: 1, direction: "rtl" }}>
                {category.description_ar}
              </Typography>
            </Box>
          </CardContent>
          <Divider sx={{ my: 1 }} />
          <CardActions>
            <UpdateBtn onClick={() => handleUpdateCategory(category.id)} />

            <DeleteButton
              onClick={() => {
                setSelectedViewId(category.id);
                setConfirmDelete(true);
              }}
            />
          </CardActions>
        </Stack>
        <Button variant="text" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </Card>
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => (
            deleteCategoryById(selectedViewId),
            setConfirmDelete(false)
          )}
          label={"Category"}
        />
      )}
    </Container>
  );
}
