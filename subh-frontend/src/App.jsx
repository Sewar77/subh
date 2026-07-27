import AboutPage from "./Pages/About/About.jsx";
import Home from "./Pages/Home/Home.jsx";
import ContactPage from "./Pages/Contact/ContactPage.jsx";
import EducationalPrograms from "./Pages/EducationalPrograms/EducationalPrograms.jsx";
import { Navigate, Route, Routes } from "react-router-dom";
import Register from "./components/Auth/Register.jsx";
import Login from "./components/Auth/Login.jsx";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./Pages/Admin/AdminDashboard.jsx";
import AdminLayout from "./Layout/AdminLayout.jsx";
import ManageUsers from "./components/Admin/Manage/ManageUsers/ManageUsers.jsx";
import AddUser from "./components/Admin/Manage/ManageUsers/AddUser.jsx";
import DisplayCategories from "./components/Admin/Manage/ManageCategories/DisplayCategories.jsx";
import AddCategory from "./components/Admin/Manage/ManageCategories/AddCategory.jsx";
import ViewCategory from "./components/Admin/Manage/ManageCategories/ViewCategory.jsx";
import UpdateCategory from "./components/Admin/Manage/ManageCategories/UpdateCategory.jsx";
import ManageBooks from "./components/Admin/Manage/ManageBooks/ManageBooks.jsx";
import AddBook from "./components/Admin/Manage/ManageBooks/AddBook.jsx";
import ViewBook from "./components/Admin/Manage/ManageBooks/ViewBook.jsx";
import UpdateBook from "./components/Admin/Manage/ManageBooks/UpdateBook.jsx";
import ViewUser from "./components/Admin/Manage/ManageUsers/ViewUser.jsx";
import NotFound from "./components/NotFound/NotFound.jsx";
import LandingPage from "./Pages/Landing/LandingPage.jsx";
import DisplayBooks from "./components/Books/DisplayBooks.jsx";
import UserLayout from "./Layout/UserLayout.jsx";
import ManageWorkshops from "./components/Admin/Manage/ManageWorkshops/ManageWorkshops.jsx";
import AdminRouteGuard from "./components/Admin/Auth/AdminRouteGuard.jsx";
import CmsAdminPage from "./Pages/Admin/CmsAdminPage.jsx";
function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/educational/courses" element={<EducationalPrograms />} />
        {/* User routes */}
        <Route path="/subh" element={<UserLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="books" element={<DisplayBooks />} />
        </Route>
        {/* admin routes */}
        <Route element={<AdminRouteGuard />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="add/user" element={<AddUser />} />
            <Route path="categories" element={<DisplayCategories />} />
            <Route path="workshops" element={<ManageWorkshops />} />
            <Route path="new-category" element={<AddCategory />} />
            <Route path="view/category/:id" element={<ViewCategory />} />
            <Route path="view/user/:id" element={<ViewUser />} />
            <Route path="books" element={<ManageBooks />} />
            <Route path="book/new" element={<AddBook />} />
            <Route path="view/book/:id" element={<ViewBook />} />
            <Route path="category/update/:id" element={<UpdateCategory />} />
            <Route path="book/update/:id" element={<UpdateBook />} />
            <Route path="user/update/:id" element={<UpdateBook />} />
            <Route path="cms" element={<CmsAdminPage />} />
            <Route path="cms/:pageId" element={<CmsAdminPage />} />
            <Route
              path="cms/:pageId/sections/:sectionId"
              element={<CmsAdminPage />}
            />
            <Route
              path="pages/view"
              element={<Navigate to="/admin/cms" replace />}
            />
            <Route
              path="view-page/:pageId"
              element={<Navigate to="/admin/cms" replace />}
            />
            <Route
              path="view-section/:sectionId"
              element={<Navigate to="/admin/cms" replace />}
            />
            <Route
              path="view-sections"
              element={<Navigate to="/admin/cms" replace />}
            />
            <Route
              path="edit-section-content/:sectionId"
              element={<Navigate to="/admin/cms" replace />}
            />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
