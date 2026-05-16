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
    try {
      const res = await api.post(`/user/add`, userData);
      toast.success("User Added successfully");
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const getUserById = async (userId) => {
    const res = await api.get(`/user/${userId}`);
    try {
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const deleteUserById = async (userId) => {
    const res = await api.delete(`/user/delete/${userId}`);
    try {
      toast.success("delete user!");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const updateUserData = async (userId, newUserData) => {
    console.log(userId);

    const res = await api.put(`/user/update/${userId}`, newUserData);
    try {
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
