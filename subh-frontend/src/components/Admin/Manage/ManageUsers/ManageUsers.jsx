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
import AddUserBtn from "./AddUserBtn";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal";
import { useUser } from "../../../../Hooks/useUsers";

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

        <AddUserBtn />
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
              color: "primary.contrastText",
              alignItems: "center",
              alignContent: "center",
              p: 2,
            }}
          >
            <TableRow>
              <TableCell
                sx={{
                  width: 360,
                  alignItems: "center",
                }}
              >
                User
              </TableCell>
              <TableCell sx={{ width: 360 }}>Email</TableCell>
              <TableCell sx={{ width: 360 }}>Role</TableCell>
              <TableCell sx={{ width: 360 }}>Status</TableCell>
              <TableCell sx={{ width: 360, textAlign: "center" }}>
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
                    }}
                  >
                    <Avatar sx={{ bgcolor: "primary.main" }}>
                      {user.email?.charAt(0).toUpperCase()}
                    </Avatar>

                    <Typography fontWeight={600}>
                      {user.name || "User"}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.user_type}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>

                <TableCell>
                  <Chip
                    label={user.is_active ? "Active" : "Inactive"}
                    size="small"
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

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          (setConfirmDelete(true), setSelectedId(user.id));
                        }}
                      >
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ textTransform: "none" }}
                    >
                      View
                    </Button>
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
