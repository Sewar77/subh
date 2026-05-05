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
import AddBook from "./components/Books/AddBook.jsx";
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
        {/* admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="add/user" element={<AddUser />} />
          <Route path="categories" element={<DisplayCategories />} />
          <Route path="new-category" element={<AddCategory />} />
          <Route path="view/category/:id" element={<ViewCategory />} />
          <Route path="books" element={<ManageBooks />} />
          <Route path="book/new" element={<AddBook />} />
          <Route path="category/update/:id" element={<UpdateCategory />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
