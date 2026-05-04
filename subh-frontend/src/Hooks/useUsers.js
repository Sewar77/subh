import { useContext, useState } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { usersContext } from "../Context/usersContext";

export const useUser = () => {
  const { users, loadUsers } = useContext(usersContext);
  const navigate = useNavigate();

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
  return { deleteUserById, users };
};
