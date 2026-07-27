import { useCallback, useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { usersContext } from "./usersContextValue.js";
export default function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  }, []);
  return (
    <usersContext.Provider value={{ users, loadUsers, setUsers }}>
      {children}
    </usersContext.Provider>
  );
}
