import { useContext, useState } from "react";
import { authContext } from "../Context/authContext";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, setUser } = useContext(authContext);
  const navigate = useNavigate();

  const login = async (userData) => {
    if (!userData.email || !userData.password) {
      toast.error("Fill All required fields");
      return;
    }
    const res = await api.post("/auth/login", userData);
    try {
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      if (role === "user") navigate("/");
      toast.success(res.data.message);
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  const logout = async () => {
    try {
      const res = await api.post("/auth/logout");
      setUser(null);
      toast.success("Logout Successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return { login, user, logout };
};
