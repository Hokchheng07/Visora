import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { Navigate, createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.jsx";
import Layout from "./Layout.jsx";
import Home from "./Components/Pages/Home.jsx";
import About from "./Components/Pages/About.jsx";
import NotFound from "./Components/Pages/NotFound.jsx";
import Login from "./Components/Auth/Login.jsx";
import SignUp from "./Components/Auth/SignUp.jsx";
import ForgotPassword from "./Components/Auth/ForgotPassword.jsx";
import AuthLayout from "./Components/Layout/auth/AuthLayout.jsx";
import { store } from "./Components/redux/store";
import CvTemplate from "./Components/LandingPageComponents/Features/CvTemplate.jsx";
import Editor from "./Components/Pages/Editor.jsx";
import UserDashboardLayout from "./Components/UserDashboard/UserDashboardLayout.jsx";
import Profile from "./Components/UserDashboard/Profile/Profile.jsx";
import Recent from "./Components/UserDashboard/Recent/Recent.jsx";
import Favorites from "./Components/UserDashboard/Favorites/Favorites.jsx";
import MyDesigns from "./Components/UserDashboard/MyDesigns/MyDesigns.jsx";
import Drafts from "./Components/UserDashboard/MyDesigns/Drafts.jsx";
import PostedTemplates from "./Components/UserDashboard/MyDesigns/PostedTemplates.jsx";
import Shared from "./Components/UserDashboard/Shared/Shared.jsx";
import Trash from "./Components/UserDashboard/Trash/Trash.jsx";
import { ThemeProvider } from "./theme/ThemeProvider";
import "./theme/theme.css";
import Templates from "./Components/Pages/Templates.jsx";
import DashboardLayout from "./Components/Dashboard/DashboardLayout.jsx";
import UserManagement from "./Components/Dashboard/UserManagement.jsx";
import {
  CategoriesPage,
  PendingPage,
  ReportPage,
  TemplatesPage,
} from "./Components/Dashboard/DashboardPages.jsx";
import AdminDashboard from "./Components/Dashboard/AdminDashboard.jsx";
import { DashboardDataProvider } from "./Components/Dashboard/dashboardData.jsx";

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "editor",
        element: <Editor />,
      },
      {
        path: "profile",
        element: <Navigate to="/user-dashboard/profile" replace />,
      },
      {
        path: "user-dashboard",
        element: <UserDashboardLayout />,
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "profile", element: <Profile /> },
          { path: "recent", element: <Recent /> },
          { path: "favorites", element: <Favorites /> },
          {
            path: "my-designs",
            element: <MyDesigns />,
            children: [
              { path: "drafts", element: <Drafts /> },
              { path: "posted-templates", element: <PostedTemplates /> },
            ],
          },
          { path: "shared", element: <Shared /> },
          { path: "trash", element: <Trash /> },
        ],
      },
      {
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path: "/cv",
            element: <CvTemplate />,
          },
          {
            path: "about",
            element: <About />,
          },
          {
            path: "templates",
            element: <Templates />,
          },
          {
            path: "*",
            element: <NotFound />,
          },
        ],
      },
      {
        path: "auth",
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="login" replace />,
          },
          {
            path: "login",
            element: <Login />,
          },
          {
            path: "register",
            element: <SignUp />,
          },
          { path: "forgot-password", element: <ForgotPassword /> },
        ],
      },
      {
        path: "login",
        element: <Navigate to="/auth/login" replace />,
      },
      { path: "forgot-password", element: <Navigate to="/auth/forgot-password" replace /> },
      {
        path: "dashboard",
        element: <DashboardLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <UserManagement /> },
          { path: "templates", element: <TemplatesPage /> },
          { path: "categories", element: <CategoriesPage /> },
          { path: "pending", element: <PendingPage /> },
          { path: "report", element: <ReportPage /> },
        ],
      },
      {
        path: "signup",
        element: <Navigate to="/auth/register" replace />,
      },
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <DashboardDataProvider>
          <RouterProvider router={router} />
        </DashboardDataProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
);
