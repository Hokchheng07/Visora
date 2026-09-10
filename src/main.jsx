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
import AuthLayout from "./Components/Layout/auth/AuthLayout.jsx";
import { store } from "./Components/redux/store";
import CvTemplate from "./Components/LandingPageComponents/Features/CvTemplate.jsx";
import Editor from "./Components/Pages/Editor.jsx";
import { ThemeProvider } from './theme/ThemeProvider';
import './theme/theme.css';
import DashboardLayout from "./Components/Dashboard/DashboardLayout.jsx";
import UserManagement from "./Components/Dashboard/UserManagement.jsx";
import { CategoriesPage, PendingPage, ReportPage, TemplatesPage } from "./Components/Dashboard/DashboardPages.jsx";
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
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
            path : "/cv",
            element : <CvTemplate/>
          },
          {
            path: "about",
            element: <About />,
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
        ],
      },
      {
        path: "login",
        element: <Navigate to="/auth/login" replace />,
      },
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
      <ThemeProvider><DashboardDataProvider><RouterProvider router={router} /></DashboardDataProvider></ThemeProvider>
    </Provider>
  </StrictMode>
);
