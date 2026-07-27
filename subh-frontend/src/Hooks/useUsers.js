import { useContext, useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { usersContext } from "../Context/usersContextValue.js";
export const useUser = () => {
  const { users, loadUsers } = useContext(usersContext);
  const [user, setUser] = useState([]);
  const addUser = async (userData) => {
    try {
      const res = await api.post(`/user/add`, userData);
      toast.success("User Added successfully");
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const getUserById = async (userId) => {
    try {
      const res = await api.get(`/user/${userId}`);
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const deleteUserById = async (userId) => {
    try {
      await api.delete(`/user/delete/${userId}`);
      toast.success("delete user!");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const updateUserData = async (userId, newUserData) => {
    try {
      await api.put(`/user/update/${userId}`, newUserData);
      toast.success(" user updated!");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return {
    deleteUserById,
    users,
    addUser,
    getUserById,
    user,
    loadUsers,
    updateUserData,
  };
};
