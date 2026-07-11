import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./Context/authContext.jsx";
import UsersProvider from "./Context/usersContext.jsx";
import CategoriesProvider from "./Context/categoriesContext.jsx";
import BooksProvider from "./Context/booksContext.jsx";
import { LanguageProvider } from "./Context/LanguageContext.jsx";
import ThemeWrapper from "./Theme/ThemeWrapper.jsx";
import { PagesProvider } from "./Context/pageContext.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LanguageProvider>
      <PagesProvider>
        <ThemeWrapper>
          <AuthProvider>
            <UsersProvider>
              <CategoriesProvider>
                <BooksProvider>
                  <App />
                </BooksProvider>
              </CategoriesProvider>
            </UsersProvider>
          </AuthProvider>
        </ThemeWrapper>
      </PagesProvider>
    </LanguageProvider>
  </BrowserRouter>,
);
