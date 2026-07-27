import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./Context/authContext.jsx";
import UsersProvider from "./Context/usersContext.jsx";
import CategoriesProvider from "./Context/categoriesContext.jsx";
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
                <App />
              </CategoriesProvider>
            </UsersProvider>
          </AuthProvider>
        </ThemeWrapper>
      </PagesProvider>
    </LanguageProvider>
  </BrowserRouter>,
);
