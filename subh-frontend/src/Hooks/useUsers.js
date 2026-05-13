import { useContext, useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usersContext } from "../Context/usersContext";
export const useUser = () => {
  const { users, loadUsers } = useContext(usersContext);
  const [user, setUser] = useState([]);
  const navigate = useNavigate();

  const addUser = async (userData) => {
    const res = await api.post(`/user/add`, userData);
    try {
      toast.success("User Added successfully");
      setUsers(res.data.user);
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  const getUserById = async (userId) => {
    const res = await api.get(`/user/${userId}`);
    try {
      setUser(res.data.user);
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };
  const deleteUserById = async (userId) => {
    const res = await api.delete(`/user/delete/${userId}`);
    try {
      toast.success("delete user!");
      loadUsers();
    } catch (error) {
      console.log(error);
      toast.error(error);
    }
  };
  return { deleteUserById, users, addUser, getUserById, user };
};
