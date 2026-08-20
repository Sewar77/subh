import { Alert, Box, CircularProgress, Container, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteCategory } from "../../../../Services/categoryService.js";
import { getAdminBooksForCategory } from "../../../../Services/bookService.js";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal.jsx";

const Detail = ({ label, value, dir }) => (
  <Box sx={{ minWidth: 0 }}>
    <Typography variant="subtitle2" color="text.secondary">{label}</Typography>
    <Typography dir={dir} sx={{ mt: 0.35, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{value || "—"}</Typography>
  </Box>
);

export default function ViewCategory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [bookCount, setBookCount] = useState(null);
  const [error, setError] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let active = true;
    getAdminBooksForCategory(id).then((response) => { if (active) { setCategory(response.category); setBookCount(response.bookCount); } }).catch((requestError) => active && setError(requestError.status === 404 ? "Category not found." : requestError.message));
    return () => { active = false; };
  }, [id]);

  const remove = async () => {
    try {
      setDeleting(true);
      await deleteCategory(id);
      toast.success("Category deleted.");
      navigate("/admin/categories");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setDeleting(false);
    }
  };

  if (error && !category) return <Container sx={{ py: 4 }}><Alert severity="error">{error}</Alert></Container>;
  if (!category) return <Container sx={{ py: 6, textAlign: "center" }}><CircularProgress /><Typography sx={{ mt: 2 }}>Loading category details...</Typography></Container>;

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} gap={1.5}>
          <Box><Typography variant="h4" component="h1">Category details</Typography><Typography color="text.secondary">Review localized category content and assigned books.</Typography></Box>
          <Stack direction="row" alignSelf={{ xs: "flex-end", sm: "center" }}>
            <Tooltip title="View category books"><IconButton size="small" aria-label="View category books" onClick={() => navigate(`/admin/books?categoryId=${id}`)}><MenuBookOutlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Edit category"><IconButton size="small" aria-label="Edit category" onClick={() => navigate(`/admin/category/update/${id}`)}><EditOutlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Delete category"><IconButton size="small" aria-label="Delete category" color="error" onClick={() => setConfirmOpen(true)}><DeleteOutlineIcon /></IconButton></Tooltip>
          </Stack>
        </Stack>
        {error && <Alert severity="error">{error}</Alert>}
        <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(240px,.7fr) minmax(0,1.3fr)" }, gap: { xs: 2.5, md: 3.5 }, alignItems: "start" }}>
            <Box sx={{ aspectRatio: "16 / 10", bgcolor: "action.hover", borderRadius: 2.5, overflow: "hidden" }}>
              {category.image ? <Box component="img" src={category.image} alt={category.nameEn || category.nameAr} loading="lazy" decoding="async" sx={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "text.secondary" }}>No category image</Box>}
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,minmax(0,1fr))" }, gap: 2.25 }}>
              <Detail label="English name" value={category.nameEn} />
              <Detail label="Arabic name" value={category.nameAr} dir="rtl" />
              <Detail label="English description" value={category.descriptionEn} />
              <Detail label="Arabic description" value={category.descriptionAr} dir="rtl" />
              <Detail label="Books" value={bookCount ?? "Loading..."} />
              <Detail label="Created" value={category.createdAt && new Date(category.createdAt).toLocaleString()} />
            </Box>
          </Box>
        </Paper>
      </Stack>
      <ConfirmDeleteModal open={confirmOpen} title="Delete category" message={`Delete “${category.nameEn}”? Categories with assigned books cannot be deleted.`} loading={deleting} error={error} onCancel={() => setConfirmOpen(false)} onConfirm={remove} />
    </Container>
  );
}
