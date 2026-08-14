import { useContext } from "react";
import { authContext } from "../Context/authContextValue.js";
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
      !userData.userType ||
      (userData.userType === "company" &&
        (!userData.companyName ||
          !userData.employeeCount ||
          (!userData.ein && !userData.registrationNumber)))
    ) {
      toast.error("Fill All required fields");
      return;
    }
    try {
      const registrationPayload =
        userData.userType === "company"
          ? Object.fromEntries(
              Object.entries(userData).filter(
                ([field, value]) =>
                  ![
                    "ein",
                    "registrationNumber",
                    "registrationState",
                    "website",
                  ].includes(field) || value.trim() !== "",
              ),
            )
          : {
              name: userData.name,
              email: userData.email,
              password: userData.password,
              confirmPassword: userData.confirmPassword,
              userType: userData.userType,
              phoneNumber: userData.phoneNumber,
            };
      const res = await api.post("/auth/register", registrationPayload);
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

    }
  };

  const login = async (userData, returnTo = "") => {
    if (!userData.email || !userData.password) {
      toast.error("Fill All required fields");
      return;
    }
    try {
      const res = await api.post("/auth/login", userData);
      const role = res.data.user.role;
      setUser(res.data.user);
      const safeReturnTo =
        typeof returnTo === "string" &&
        returnTo.startsWith("/") &&
        !returnTo.startsWith("//")
          ? returnTo
          : "";
      if (role === "admin") navigate("/admin");
      if (role === "user") navigate(safeReturnTo || "/subh");
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
    }
  };
  const logout = async () => {
    try {
      await api.post("/auth/logout");
      setUser(null);
      toast.success("Logout Successfully");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return { login, user, logout, register };
};
