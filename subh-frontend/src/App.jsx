import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UserLayout from "./Layout/UserLayout.jsx";
import RouteLoading from "./components/Loading/RouteLoading.jsx";
import { lazy, Suspense } from "react";

const Home = lazy(() => import("./Pages/Home/Home.jsx"));
const AboutPage = lazy(() => import("./Pages/About/About.jsx"));
const ContactPage = lazy(() => import("./Pages/Contact/ContactPage.jsx"));
const EducationalPrograms = lazy(
  () => import("./Pages/EducationalPrograms/EducationalPrograms.jsx"),
);
const Register = lazy(() => import("./components/Auth/Register.jsx"));
const Login = lazy(() => import("./components/Auth/Login.jsx"));
const LandingPage = lazy(() => import("./Pages/Landing/LandingPage.jsx"));
const DisplayBooks = lazy(() => import("./components/Books/DisplayBooks.jsx"));
const BookDetailPage = lazy(() => import("./Pages/Books/BookDetailPage.jsx"));
const CategoriesPage = lazy(
  () => import("./Pages/Categories/CategoriesPage.jsx"),
);
const CategoryDetailPage = lazy(
  () => import("./Pages/Categories/CategoryDetailPage.jsx"),
);
const NotFound = lazy(() => import("./components/NotFound/NotFound.jsx"));
const CustomerRouteGuard = lazy(
  () => import("./components/BookRequests/CustomerRouteGuard.jsx"),
);
const BookRequestCreatePage = lazy(
  () => import("./Pages/BookRequests/BookRequestCreatePage.jsx"),
);
const MyBookRequestsPage = lazy(
  () => import("./Pages/BookRequests/MyBookRequestsPage.jsx"),
);
const MyBookRequestDetailPage = lazy(
  () => import("./Pages/BookRequests/MyBookRequestDetailPage.jsx"),
);

const AdminRouteGuard = lazy(
  () => import("./components/Admin/Auth/AdminRouteGuard.jsx"),
);
const AdminLayout = lazy(() => import("./Layout/AdminLayout.jsx"));
const AdminDashboard = lazy(() => import("./Pages/Admin/AdminDashboard.jsx"));
const AdminProfilePage = lazy(
  () => import("./Pages/Admin/AdminProfilePage.jsx"),
);
const ManageUsers = lazy(
  () => import("./components/Admin/Manage/ManageUsers/ManageUsers.jsx"),
);
const AddUser = lazy(
  () => import("./components/Admin/Manage/ManageUsers/AddUser.jsx"),
);
const ViewUser = lazy(
  () => import("./components/Admin/Manage/ManageUsers/ViewUser.jsx"),
);
const DisplayCategories = lazy(
  () =>
    import("./components/Admin/Manage/ManageCategories/DisplayCategories.jsx"),
);
const AddCategory = lazy(
  () => import("./components/Admin/Manage/ManageCategories/AddCategory.jsx"),
);
const ViewCategory = lazy(
  () => import("./components/Admin/Manage/ManageCategories/ViewCategory.jsx"),
);
const UpdateCategory = lazy(
  () => import("./components/Admin/Manage/ManageCategories/UpdateCategory.jsx"),
);
const ManageBooks = lazy(
  () => import("./components/Admin/Manage/ManageBooks/ManageBooks.jsx"),
);
const AddBook = lazy(
  () => import("./components/Admin/Manage/ManageBooks/AddBook.jsx"),
);
const ViewBook = lazy(
  () => import("./components/Admin/Manage/ManageBooks/ViewBook.jsx"),
);
const UpdateBook = lazy(
  () => import("./components/Admin/Manage/ManageBooks/UpdateBook.jsx"),
);
const WorkshopsPage = lazy(() => import("./Pages/Workshops/WorkshopsPage.jsx"));
const WorkshopDetailPage = lazy(() => import("./Pages/Workshops/WorkshopDetailPage.jsx"));
const WorkshopBookingPage = lazy(() => import("./Pages/Workshops/WorkshopBookingPage.jsx"));
const MyWorkshopBookingsPage = lazy(() => import("./Pages/Workshops/MyWorkshopBookingsPage.jsx"));
const MyWorkshopBookingDetailPage = lazy(() => import("./Pages/Workshops/MyWorkshopBookingDetailPage.jsx"));
const AdminWorkshopsPage = lazy(() => import("./Pages/Admin/AdminWorkshopsPage.jsx"));
const AdminWorkshopEditorPage = lazy(() => import("./Pages/Admin/AdminWorkshopEditorPage.jsx"));
const AdminWorkshopDetailPage = lazy(() => import("./Pages/Admin/AdminWorkshopDetailPage.jsx"));
const AdminWorkshopResourcesPage = lazy(() => import("./Pages/Admin/AdminWorkshopResourcesPage.jsx"));
const AdminWorkshopBookingsPage = lazy(() => import("./Pages/Admin/AdminWorkshopBookingsPage.jsx"));
const AdminWorkshopBookingDetailPage = lazy(() => import("./Pages/Admin/AdminWorkshopBookingDetailPage.jsx"));
const CmsAdminPage = lazy(() => import("./Pages/Admin/CmsAdminPage.jsx"));
const AdminMediaLibraryPage = lazy(
  () => import("./Pages/Admin/AdminMediaLibraryPage.jsx"),
);
const AdminBookRequestsPage = lazy(
  () => import("./Pages/Admin/AdminBookRequestsPage.jsx"),
);
const AdminBookRequestDetailPage = lazy(
  () => import("./Pages/Admin/AdminBookRequestDetailPage.jsx"),
);
const AdminAnalyticsPage = lazy(
  () => import("./Pages/Admin/AdminAnalyticsPage.jsx"),
);

function LazyRoute({ component: Component, fullPage = false }) {
  return (
    <Suspense fallback={<RouteLoading fullPage={fullPage} />}>
      <Component />
    </Suspense>
  );
}

function App() {
  return (
    <>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/" element={<UserLayout />}>
          <Route index element={<LazyRoute component={Home} />} />
          <Route path="about" element={<LazyRoute component={AboutPage} />} />
          <Route
            path="contact"
            element={<LazyRoute component={ContactPage} />}
          />
          <Route path="register" element={<LazyRoute component={Register} />} />
          <Route path="login" element={<LazyRoute component={Login} />} />
          <Route
            path="educational/courses"
            element={<LazyRoute component={EducationalPrograms} />}
          />
          <Route
            path="categories"
            element={<LazyRoute component={CategoriesPage} />}
          />
          <Route
            path="categories/:id"
            element={<LazyRoute component={CategoryDetailPage} />}
          />
          <Route
            path="categories/:id/books"
            element={<LazyRoute component={DisplayBooks} />}
          />
          <Route
            path="books"
            element={<LazyRoute component={DisplayBooks} />}
          />
          <Route
            path="books/:id"
            element={<LazyRoute component={BookDetailPage} />}
          />
          <Route path="workshops" element={<LazyRoute component={WorkshopsPage} />} />
          <Route path="workshops/:id" element={<LazyRoute component={WorkshopDetailPage} />} />
          <Route path="subh">
            <Route index element={<LazyRoute component={LandingPage} />} />
            <Route
              path="books"
              element={<LazyRoute component={DisplayBooks} />}
            />
          </Route>
          <Route element={<LazyRoute component={CustomerRouteGuard} />}>
            <Route
              path="request-books"
              element={<LazyRoute component={BookRequestCreatePage} />}
            />
            <Route
              path="my-requests"
              element={<LazyRoute component={MyBookRequestsPage} />}
            />
            <Route
              path="my-requests/:id"
              element={<LazyRoute component={MyBookRequestDetailPage} />}
            />
            <Route path="workshops/:workshopId/sessions/:sessionId/book" element={<LazyRoute component={WorkshopBookingPage} />} />
            <Route path="my-workshops" element={<LazyRoute component={MyWorkshopBookingsPage} />} />
            <Route path="my-workshops/:id" element={<LazyRoute component={MyWorkshopBookingDetailPage} />} />
          </Route>
        </Route>
        {/* admin routes */}
        <Route element={<LazyRoute component={AdminRouteGuard} fullPage />}>
          <Route
            path="/admin"
            element={<LazyRoute component={AdminLayout} fullPage />}
          >
            <Route index element={<LazyRoute component={AdminDashboard} />} />
            <Route
              path="profile"
              element={<LazyRoute component={AdminProfilePage} />}
            />
            <Route
              path="users"
              element={<LazyRoute component={ManageUsers} />}
            />
            <Route
              path="add/user"
              element={<LazyRoute component={AddUser} />}
            />
            <Route
              path="categories"
              element={<LazyRoute component={DisplayCategories} />}
            />
            <Route
              path="workshops"
              element={<LazyRoute component={AdminWorkshopsPage} />}
            />
            <Route path="workshops/new" element={<LazyRoute component={AdminWorkshopEditorPage} />} />
            <Route path="workshops/:id" element={<LazyRoute component={AdminWorkshopDetailPage} />} />
            <Route path="workshops/:id/edit" element={<LazyRoute component={AdminWorkshopEditorPage} />} />
            <Route path="workshop-resources" element={<LazyRoute component={AdminWorkshopResourcesPage} />} />
            <Route path="workshop-bookings" element={<LazyRoute component={AdminWorkshopBookingsPage} />} />
            <Route path="workshop-bookings/:id" element={<LazyRoute component={AdminWorkshopBookingDetailPage} />} />
            <Route
              path="new-category"
              element={<LazyRoute component={AddCategory} />}
            />
            <Route
              path="categories/:id"
              element={<LazyRoute component={ViewCategory} />}
            />
            <Route
              path="users/:id"
              element={<LazyRoute component={ViewUser} />}
            />
            <Route
              path="books"
              element={<LazyRoute component={ManageBooks} />}
            />
            <Route
              path="book/new"
              element={<LazyRoute component={AddBook} />}
            />
            <Route
              path="books/:id"
              element={<LazyRoute component={ViewBook} />}
            />
            <Route
              path="category/update/:id"
              element={<LazyRoute component={UpdateCategory} />}
            />
            <Route
              path="book/update/:id"
              element={<LazyRoute component={UpdateBook} />}
            />
            <Route
              path="user/update/:id"
              element={<LazyRoute component={UpdateBook} />}
            />
            <Route
              path="view/category/:id"
              element={<Navigate to="/admin/categories" replace />}
            />
            <Route
              path="view/user/:id"
              element={<Navigate to="/admin/users" replace />}
            />
            <Route
              path="cms"
              element={<LazyRoute component={CmsAdminPage} />}
            />
            <Route
              path="media"
              element={<LazyRoute component={AdminMediaLibraryPage} />}
            />
            <Route
              path="requests"
              element={<LazyRoute component={AdminBookRequestsPage} />}
            />
            <Route
              path="requests/:id"
              element={<LazyRoute component={AdminBookRequestDetailPage} />}
            />
            <Route
              path="analytics"
              element={<LazyRoute component={AdminAnalyticsPage} />}
            />
            <Route
              path="cms/:pageId"
              element={<LazyRoute component={CmsAdminPage} />}
            />
            <Route
              path="cms/:pageId/sections/:sectionId"
              element={<LazyRoute component={CmsAdminPage} />}
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
        <Route path="*" element={<LazyRoute component={NotFound} />} />
      </Routes>
    </>
  );
}

export default App;
