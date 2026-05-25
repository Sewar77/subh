import AboutPage from "./Pages/About/About.jsx";
import Home from "./Pages/Home/Home.jsx";
import ContactPage from "./Pages/Contact/ContactPage.jsx";
import EducationalPrograms from "./Pages/EducationalPrograms/EducationalPrograms.jsx";
import { Route, Routes } from "react-router-dom";
import Register from "./components/Auth/Register.jsx";
import Login from "./components/Auth/Login.jsx";
import { Toaster } from "react-hot-toast";
import AdminDashboard from "./Pages/Admin/AdminDashboard.jsx";
import AdminLayout from "./Layout/AdminLayout.jsx";
import ManageUsers from "./components/Admin/Manage/ManageUsers/ManageUsers.jsx";
import AddUser from "./components/Admin/Manage/ManageUsers/AddUser.jsx";
import DisplayCategories from "./components/Admin/Manage/ManageCategories/DisplayCategories.jsx";
import AddCategory from "./components/Admin/Manage/ManageCategories/AddCategory.jsx";
import { useParams } from "react-router-dom";
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
import CreatePage from "./components/Admin/Manage/ManagePages/CreatePage.jsx";
import ManageWorkshops from "./components/Admin/Manage/ManageWorkshops/ManageWorkshops.jsx";
import ManageAboutPage from "./components/Admin/Manage/ManagePages/AboutPage/ManageAboutPage.jsx";
import ViewPagesKeys from "./components/Admin/Manage/ManagePages/ViewPagesKeys.jsx";
import ViewSectionsPage from "./components/Admin/Manage/ManagePages/Sections/ViewSectionsPage.jsx";
import UpdateSectionPage from "./components/Admin/Manage/ManagePages/Sections/UpdateSectionPage.jsx";
import CreateSectionPage from "./components/Admin/Manage/ManagePages/Sections/CreateSectionPage.jsx";
function App() {
  const { id } = useParams();
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

          {/* manage pages */}
          <Route path="new-page" element={<CreatePage />} />
          <Route path="view-pages" element={<ViewPagesKeys />} />
          <Route path="sections/page/:pageId" element={<ViewSectionsPage />} />
          <Route
            path="update-section/:pageId/:sectionId"
            element={<UpdateSectionPage />}
          />
          <Route
            path="create-section/:pageId"
            element={<CreateSectionPage />}
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
