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
  Paper,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useContext, useState } from "react";
import { usersContext } from "../../../../Context/usersContext";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import { useUser } from "../../../../Hooks/useUsers";
import DeleteButton from "../../Buttons/DeleteBtn";
import ViewButton from "../../Buttons/ViewBtn";
import AddButton from "../../Buttons/AddBtn";

export default function ManageUsers() {
  const { users, deleteUserById } = useUser();
  const theme = useTheme();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

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
          Users
        </Typography>

        <AddButton label={"User"} to={"/admin/add/user"} />
      </Box>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          bgcolor: "background.default",
          overflow: "auto",
        }}
      >
        <Table>
          <TableHead
            sx={{
              bgcolor: "primary.main",
              alignItems: "center",
              alignContent: "center",
              p: 2,
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  width: 360,
                  alignItems: "center",
                  color: "primary.contrastText",
                  fontSize: 25,
                }}
              >
                User
              </TableCell>
              <TableCell
                sx={{ width: 360, color: "primary.contrastText", fontSize: 25 }}
              >
                Email
              </TableCell>
              <TableCell
                sx={{ width: 360, color: "primary.contrastText", fontSize: 25 }}
              >
                Role
              </TableCell>
              <TableCell
                sx={{ width: 360, color: "primary.contrastText", fontSize: 25 }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  width: 360,
                  textAlign: "center",
                  color: "primary.contrastText",
                  fontSize: 25,
                }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users?.map((user) => (
              <TableRow
                key={user.id}
                hover
                sx={{
                  p: 2,
                  "&:hover": {
                    backgroundColor: theme.palette.action.hover,
                  },
                  "&:last-child td": { borderBottom: 0 },
                }}
              >
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{
                      alignItems: "center",
                      fontSize: 23,
                    }}
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography fontWeight={600} sx={{ fontSize: 23 }}>
                      {user.name || "User"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell sx={{ fontSize: 23 }}>{user.email}</TableCell>
                <TableCell sx={{ fontSize: 23 }}>
                  <Chip
                    label={user.user_type}
                    size="large"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell sx={{ fontSize: 23 }}>
                  <Chip
                    label={user.is_active ? "Active" : "Inactive"}
                    size="large"
                    color={user.is_active ? "success" : "error"}
                  />
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "center" }}
                  >
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary">
                        <EditOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <DeleteButton
                      onClick={() => {
                        (setConfirmDelete(true), setSelectedId(user.id));
                      }}
                    />

                    <ViewButton />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {confirmDelete && (
        <ConfirmDeleteModal
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={() => (
            deleteUserById(selectedId),
            setConfirmDelete(false)
          )}
          label={"User"}
        />
      )}
    </Box>
  );
}
