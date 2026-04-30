import { useState } from "react";
import { createContext } from "react";
import { api } from "../../api";
export const authContext = createContext();
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me");
      setUser(res.data.user);
    } catch (err) {
      console.log("Auth check failed:", err.response?.data || err.message);
      setUser(null);
    }
  };
  return (
    <authContext.Provider value={{ loadUser, user, setUser }}>
      {children}
    </authContext.Provider>
  );
}
