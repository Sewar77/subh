import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { theme } from "./Theme/Theme.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./Context/authContext.jsx";
import UsersProvider from "./Context/usersContext.jsx";
import CategoriesProvider from "./Context/categoriesContext.jsx";
import BooksProvider from "./Context/booksContext.jsx";
import { PagesProvider } from "./Context/pagesContext.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <UsersProvider>
        <CategoriesProvider>
          <BooksProvider>
            <PagesProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <App />
              </ThemeProvider>
            </PagesProvider>
          </BooksProvider>
        </CategoriesProvider>
      </UsersProvider>
    </AuthProvider>
  </BrowserRouter>,
);
