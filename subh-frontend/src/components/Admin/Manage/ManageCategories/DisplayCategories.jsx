import { Alert, Box, Button, CircularProgress, IconButton, Paper, Table, TableBody, TableCell, TableHead, TableRow, Tooltip, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useCategories } from "../../../../Hooks/useCategories.js";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal.jsx";
import AdminInstructions from "../../AdminInstructions.jsx";

export default function DisplayCategories() {
  const { categories, loadCategories, deleteCategoryById } = useCategories();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState(null);
  const navigate = useNavigate();
  useEffect(() => { loadCategories().catch((requestError) => setError(requestError.message)).finally(() => setLoading(false)); }, [loadCategories]);
  const remove = async () => { try { setDeleting(true); await deleteCategoryById(target.id); toast.success("Category deleted."); setTarget(null); } catch (requestError) { setError(requestError.message); } finally { setDeleting(false); } };
  return <Box sx={{ p: { xs: 1, md: 2 } }}><Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}><Typography variant="h4">Categories</Typography><Button variant="contained" onClick={() => navigate("/admin/new-category")}>Add category</Button></Box><AdminInstructions>Manage the fixed bilingual category catalog. Use the book action to review its assigned books; Delete is unavailable while books remain assigned.</AdminInstructions>{error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}{loading ? <CircularProgress /> : categories.length === 0 ? <Paper sx={{ p: 3 }}><Typography>No categories yet.</Typography></Paper> : <Paper sx={{ overflowX: "auto" }}><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Image</TableCell><TableCell>Name</TableCell><TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>Books</TableCell><TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>Created</TableCell><TableCell>Actions</TableCell></TableRow></TableHead><TableBody>{categories.map((category, index) => <TableRow key={category.id} hover><TableCell>{index + 1}</TableCell><TableCell>{category.image && <Box component="img" src={category.image} alt="" loading="lazy" sx={{ width: 56, height: 44, objectFit: "cover", borderRadius: 1 }} />}</TableCell><TableCell><Typography noWrap>{category.nameEn}</Typography><Typography dir="rtl" noWrap variant="body2">{category.nameAr}</Typography></TableCell><TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}>{category.bookCount ?? 0}</TableCell><TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : "—"}</TableCell><TableCell><Tooltip title="View details"><IconButton aria-label={`View ${category.nameEn}`} onClick={() => navigate(`/admin/categories/${category.id}`)}><VisibilityOutlinedIcon /></IconButton></Tooltip><Tooltip title="View category books"><IconButton aria-label={`View books in ${category.nameEn}`} onClick={() => navigate(`/admin/books?categoryId=${category.id}`)}><MenuBookOutlinedIcon /></IconButton></Tooltip><Tooltip title="Edit category"><IconButton aria-label={`Edit ${category.nameEn}`} onClick={() => navigate(`/admin/category/update/${category.id}`)}><EditOutlinedIcon /></IconButton></Tooltip><Tooltip title="Delete category"><IconButton aria-label={`Delete ${category.nameEn}`} color="error" disabled={deleting} onClick={() => setTarget(category)}><DeleteOutlineIcon /></IconButton></Tooltip></TableCell></TableRow>)}</TableBody></Table></Paper>}<ConfirmDeleteModal open={Boolean(target)} title="Delete category" message={target ? `Delete “${target.nameEn}”? Categories with assigned books cannot be deleted.` : ""} loading={deleting} error={error} onCancel={() => setTarget(null)} onConfirm={remove} /></Box>;
}
