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
      toast.error(error.response?.data?.message || "The user could not be added. Check the user fields and try again.");
    }
  };
  const getUserById = async (userId) => {
    try {
      const res = await api.get(`/user/${userId}`);
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "The user details could not be loaded.");
    }
  };
  const deleteUserById = async (userId) => {
    try {
      await api.delete(`/user/delete/${userId}`);
      toast.success("User deactivated.");
      loadUsers();
    } catch (error) {
      throw new Error(error.response?.data?.message || "The user could not be deactivated. The final active administrator cannot be deactivated.", { cause: error });
    }
  };
  const updateUserData = async (userId, newUserData) => {
    try {
      await api.put(`/user/update/${userId}`, newUserData);
      toast.success(" user updated!");
      loadUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "The user could not be updated. Check the selected role and try again.");
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
