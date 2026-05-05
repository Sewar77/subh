import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useBooks } from "../../../../Hooks/useBooks";
import AddButton from "../../Buttons/AddBtn";
import DeleteButton from "../../Buttons/DeleteBtn";
import ViewButton from "../../Buttons/ViewBtn";
import UpdateBtn from "../../Buttons/UpdateBtn";
import { useNavigate } from "react-router-dom";

export default function ManageBooks() {
  const { books } = useBooks();
  const theme = useTheme();
  const navigate = useNavigate();

  const handleView = (id) => navigate(`/admin/view/book/${id}`);
  const handleUpdate = (id) => navigate(`/admin/book/update/${id}`);

  return (
    <Box sx={{ color: "text.primary", p: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            color: "text.primary",
            fontWeight: 700,
          }}
        >
          Books
        </Typography>

        <AddButton label={"Book"} to={"/admin/book/new"} />
      </Box>

      {/* TABLE CONTAINER */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          overflowX: "auto",
          bgcolor: "background.default",
        }}
      >
        <Table>
          <TableHead
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              fontWeight: 900,
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: 100,
                }}
              >
                Image
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: 140,
                }}
              >
                Name (EN / AR)
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: {
                    xs: 120,
                    sm: 160,
                    md: 200,
                    lg: 200,
                  },
                }}
              >
                Description (EN / AR)
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: 100,
                }}
              >
                Category
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: 100,
                }}
              >
                Author Name (EN / AR)
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: 100,
                }}
              >
                Created
              </TableCell>

              <TableCell
                align="center"
                sx={{
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  width: 140,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          {/* BODY */}
          <TableBody>
            {books?.map((book) => (
              <TableRow key={book.id} hover>
                {/* IMAGE */}
                <TableCell>
                  <Avatar
                    src={book.barcode_image}
                    variant="rounded"
                    sx={{ width: 80, height: 80 }}
                  />
                </TableCell>

                {/* NAME GROUPED */}
                <TableCell align="center">
                  <Stack spacing={0.5}>
                    <Typography fontWeight={600}>{book.name_en}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {book.name_ar}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* DESCRIPTION GROUPED */}
                <TableCell align="center">
                  <Stack
                    spacing={0.5}
                    sx={{
                      maxWidth: {
                        md: 200,
                      },
                      overflow: "hidden",
                    }}
                  >
                    <Typography noWrap>{book.description_en}</Typography>

                    <Typography
                      noWrap
                      sx={{ fontSize: 12, color: "text.secondary" }}
                    >
                      {book.description_ar}
                    </Typography>
                  </Stack>
                </TableCell>
                {/* CATEGORY */}
                <TableCell align="center">
                  <Stack spacing={0.5}>
                    <Typography>{book.category_name_en}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {book.category_name_ar}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* AUTHER NAME */}
                <TableCell align="center">
                  <Stack spacing={0.5}>
                    <Typography>{book.author_name_en}</Typography>
                    <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                      {book.author_name_ar || "-"}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* CREATED */}
                <TableCell align="center">
                  <Typography variant="body2">
                    {new Date(book.created_at).toLocaleDateString()}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption">
                    {new Date(book.created_at).toLocaleTimeString()}
                  </Typography>
                </TableCell>

                {/* ACTIONS */}
                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "center", flexWrap: "wrap" }}
                  >
                    <UpdateBtn onClick={() => handleUpdate(book.id)} />
                    <DeleteButton />
                    <ViewButton onClick={() => handleView(book.id)} />
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
