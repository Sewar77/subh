import { useState } from "react";
import { createContext } from "react";
import toast from "react-hot-toast";

export const authContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState({});
  return (
    <authContext.Provider value={{ user, setUser }}>
      {children}
    </authContext.Provider>
  );
}
