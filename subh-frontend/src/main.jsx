import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./Context/authContext.jsx";
import { LanguageProvider } from "./Context/LanguageContext.jsx";
import ThemeWrapper from "./Theme/ThemeWrapper.jsx";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <LanguageProvider>
      <ThemeWrapper>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeWrapper>
    </LanguageProvider>
  </BrowserRouter>,
);
