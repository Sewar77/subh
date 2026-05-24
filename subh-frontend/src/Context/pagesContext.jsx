import { createContext, useContext, useState } from "react";
import { usePages } from "../Hooks/usePages.js";

const PagesContext = createContext();

export const PagesProvider = ({ children }) => {
  const pagesHook = usePages();

  return (
    <PagesContext.Provider
      value={{
        ...pagesHook,
      }}
    >
      {children}
    </PagesContext.Provider>
  );
};

export const usePagesContext = () => {
  return useContext(PagesContext);
};
