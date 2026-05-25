import { useState } from "react";
import { createContext } from "react";
import { api } from "../../api";
import toast from "react-hot-toast";
export const authContext = createContext();
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <authContext.Provider value={{ loadUser, user, setUser }}>
      {children}
    </authContext.Provider>
  );
}
