import { useContext, useEffect, useState } from "react";
import { authContext } from "../Context/authContext";
import { api } from "../../api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const { user, setUser } = useContext(authContext);
  const navigate = useNavigate();
  const register = async (userData) => {
    if (
      !userData.email ||
      !userData.password ||
      !userData.confirmPassword ||
      !userData.name ||
      !userData.phoneNumber ||
      !userData.userType
    ) {
      toast.error("Fill All required fields");
      return;
    }
    try {
      const res = await api.post("/auth/register", userData);
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`);
        });
        return;
      }
      toast.error(data?.message || "Something went wrong");

      error;
    }
  };

  const login = async (userData) => {
    if (!userData.email || !userData.password) {
      toast.error("Fill All required fields");
      return;
    }
    try {
      const res = await api.post("/auth/login", userData);
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin");
      if (role === "user") navigate("/subh");
      toast.success(res.data.message);
    } catch (error) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`);
        });
        return;
      }
      toast.error(data?.message || "Something went wrong");
      error;
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
  return { login, user, logout, register };
};
