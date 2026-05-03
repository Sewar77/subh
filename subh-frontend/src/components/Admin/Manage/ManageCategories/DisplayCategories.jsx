import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Stack,
} from "@mui/material";
import { useCategories } from "../../../../Hooks/useCategories";
import AddCategoriesBtn from "./AddCategoriesBtn";

export default function DisplayCategories() {
  const { categories } = useCategories();

  const headerStyle = {
    fontWeight: 700,
    fontSize: { xs: "0.75rem", md: "0.85rem" },
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  };

  return (
    <Box sx={{ color: "text.primary", p: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontWeight: 700,
          }}
        >
          Categories
        </Typography>

        <AddCategoriesBtn />
      </Box>
      <TableContainer
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
          border: "1px solid rgba(255,255,255,0.06)",
          bgcolor: "#0f172a",
        }}
      >
        <Table>
          <TableHead sx={{ bgcolor: "#111c2e" }}>
            <TableRow>
              <TableCell sx={headerStyle}>Name (EN / AR)</TableCell>
              <TableCell sx={headerStyle}>Description</TableCell>
              <TableCell sx={headerStyle}>Image</TableCell>
              <TableCell sx={headerStyle}>Created At</TableCell>
              <TableCell sx={headerStyle} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {categories?.map((category) => (
              <TableRow
                key={category.id}
                hover
                sx={{
                  "&:hover": { bgcolor: "rgba(183, 164, 164, 0.68)" },
                }}
              >
                <TableCell sx={{ fontWeight: 600 }}>
                  <Box>
                    <Typography fontWeight={600} color="text.primary">
                      {category.name_en}
                    </Typography>

                    <Typography
                      fontSize="0.85rem"
                      color="text.secondary"
                      sx={{ direction: "rtl" }}
                    >
                      {category.name_ar}
                    </Typography>
                  </Box>
                </TableCell>

                {/* DESCRIPTION */}
                <TableCell sx={{ maxWidth: 260 }}>
                  <Typography fontSize="0.9rem" color="text.primary">
                    {category.description_en}
                  </Typography>

                  <Typography
                    fontSize="0.85rem"
                    color="text.secondary"
                    sx={{ direction: "rtl", mt: 0.5 }}
                  >
                    {category.description_ar}
                  </Typography>
                </TableCell>

                {/* IMAGE */}
                <TableCell>
                  <Avatar
                    src={category.image}
                    variant="rounded"
                    sx={{
                      width: 55,
                      height: 55,
                      borderRadius: 2,
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  />
                </TableCell>

                {/* DATE */}
                <TableCell>
                  {new Date(category.created_at).toLocaleDateString()}
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ textAlign: "center" }}
                  >
                    <Button size="small" variant="contained" color="error">
                      Delete
                    </Button>
                    <Button size="small" variant="contained">
                      Edit
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
