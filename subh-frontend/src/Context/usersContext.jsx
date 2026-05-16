import { useState } from "react";
import { createContext } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
export const usersContext = createContext();
export default function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data.users);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <usersContext.Provider value={{ users, loadUsers, setUsers }}>
      {children}
    </usersContext.Provider>
  );
}
