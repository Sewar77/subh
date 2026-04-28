import { useContext } from "react";
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
    console.log(res);

    try {
      const role = res.data.user.role;
      if (role === "admin") navigate("/admin/dashboard");
      if (role === "user") navigate("/");
      toast.success(res.data.message);
      setUser(userData);
    } catch (err) {
      console.log(err);
      toast.error(res.data.message);
    }
  };
  return { login, user };
};
