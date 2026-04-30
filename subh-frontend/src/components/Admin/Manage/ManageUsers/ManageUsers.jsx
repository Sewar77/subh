import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useContext } from "react";
import { usersContext } from "../../../../Context/usersContext";
import AddUserBtn from "./AddUserBtn";
export default function ManageUsers() {
  const { users } = useContext(usersContext);
  const headerStyle = {
    fontWeight: "bold",
    fontSize: { xs: "0.8rem", md: "1rem" },
    color: "text.secondary",
  };
  const bodyStyle = {
    fontWeight: "bold",
    fontSize: { xs: "0.8rem", md: "1rem" },
    color: "primary.main",
  };
  return (
    <Box
      sx={{
        color: "text.primary",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          p: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", md: "2rem" },
            color: {
              bodyStyle,
            },
          }}
        >
          Subh Users
        </Typography>

        <AddUserBtn />
      </Box>

      <TableContainer
        sx={{
          width: "100%",
          overflowX: "auto",
          px: { xs: 1, md: 2 },
        }}
      >
        <Table
          sx={{
            minWidth: 500,
            "& .MuiTableCell-root": {
              borderBottom: "1px solid rgba(255,255,255,0.2)",
              fontSize: { xs: "0.75rem", md: "0.9rem" },
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={headerStyle}>Email</TableCell>
              <TableCell sx={headerStyle}>User Type</TableCell>
              <TableCell sx={headerStyle}>Active</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell sx={bodyStyle}>{user.email}</TableCell>
                <TableCell sx={bodyStyle}>{user.user_type}</TableCell>
                <TableCell sx={bodyStyle}>
                  {user.is_active ? "Active" : "Not Active"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
