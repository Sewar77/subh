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
  Select,
  MenuItem,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { useContext, useEffect, useState } from "react";
import { usersContext } from "../../../../Context/usersContext.jsx";
import ConfirmDeleteModal from "../../Modal/ConfirmDeleteModal.jsx";
import { useUser } from "../../../../Hooks/useUsers.js";
import DeleteButton from "../../Buttons/DeleteBtn";
import ViewButton from "../../Buttons/ViewBtn";
import AddButton from "../../Buttons/AddBtn";
import { useNavigate } from "react-router-dom";
import UpdateBtn from "../../Buttons/UpdateBtn";
export default function ManageUsers() {
  const { users, deleteUserById, loadUsers, updateUserData } = useUser();
  const theme = useTheme();
  useEffect(() => {
    loadUsers();
  }, []);
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [newUserData, setNewUserData] = useState({
    userType: "",
    userRole: "",
  });
  const [selectedUpdatedId, setSelectedUpdatedId] = useState(null);
  const handleViewUser = (userId) => {
    navigate(`/admin/view/user/${userId}`);
  };
  const handleSave = () => {
    updateUserData(selectedUpdatedId, newUserData);
    setSelectedUpdatedId(null);
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
                Type
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
                {selectedUpdatedId === user.id ? (
                  <>
                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={newUserData.userType || user.user_type}
                        onChange={(e) =>
                          setNewUserData({
                            ...newUserData,
                            userType: e.target.value,
                          })
                        }
                      >
                        <MenuItem value="company">Company</MenuItem>
                        <MenuItem value="individual">Individual</MenuItem>
                      </Select>
                    </TableCell>

                    <TableCell>
                      <Select
                        fullWidth
                        size="small"
                        value={newUserData.userRole}
                        onChange={(e) =>
                          setNewUserData((prev) => ({
                            ...prev,
                            userRole: e.target.value,
                          }))
                        }
                      >
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="user">User</MenuItem>
                      </Select>
                    </TableCell>
                  </>
                ) : (
                  <>
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
                        label={user.role}
                        size="large"
                        color="primary"
                        variant="contained"
                      />
                    </TableCell>
                  </>
                )}
                <TableCell sx={{ fontSize: 23 }}>
                  <Chip
                    label={user.is_active ? "Active" : "Inactive"}
                    size="large"
                    color={user.is_active ? "success" : "error"}
                  />
                </TableCell>
                <TableCell>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ justifyContent: "center" }}
                  >
                    <Tooltip title="Edit">
                      {selectedUpdatedId === user.id ? (
                        <>
                          <Button
                            variant="contained"
                            color="warning"
                            onClick={handleSave}
                          >
                            Save
                          </Button>
                          <Button
                            variant="contained"
                            onClick={() => setSelectedUpdatedId(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <UpdateBtn
                          onClick={() => setSelectedUpdatedId(user.id)}
                        />
                      )}
                    </Tooltip>
                    <DeleteButton
                      onClick={() => {
                        (setConfirmDelete(true), setSelectedId(user.id));
                      }}
                    />
                    <ViewButton onClick={() => handleViewUser(user.id)} />
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
