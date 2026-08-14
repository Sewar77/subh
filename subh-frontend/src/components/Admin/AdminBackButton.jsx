import { Button, Tooltip } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useLocation, useNavigate } from "react-router-dom";

const fallbackFor = (pathname) => {
  if (pathname.includes("/requests")) return "/admin/requests";
  if (pathname.includes("/books" ) || pathname.includes("/book/")) return "/admin/books";
  if (pathname.includes("/categories") || pathname.includes("/category/")) return "/admin/categories";
  if (pathname.includes("/users") || pathname.includes("/user/")) return "/admin/users";
  return "/admin";
};

export default function AdminBackButton({ fallback }) {
  const navigate = useNavigate();
  const location = useLocation();
  const goBack = () => {
    const referrer = document.referrer;
    if (referrer && referrer.startsWith(`${window.location.origin}/admin`)) navigate(-1);
    else navigate(location.pathname === "/admin" ? "/admin" : fallback || fallbackFor(location.pathname));
  };
  return <Tooltip title="Return to the previous admin page"><Button startIcon={<ArrowBackIcon />} aria-label="Back to previous admin page" onClick={goBack} sx={{ m: 1 }}>Back</Button></Tooltip>;
}
