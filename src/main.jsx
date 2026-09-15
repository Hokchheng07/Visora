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
<<<<<<< HEAD
=======
import ForgotPassword from "./Components/Auth/ForgotPassword.jsx";
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
import AuthLayout from "./Components/Layout/auth/AuthLayout.jsx";
import { store } from "./Components/redux/store";
import CvTemplate from "./Components/LandingPageComponents/Features/CvTemplate.jsx";
import Editor from "./Components/Pages/Editor.jsx";
<<<<<<< HEAD
import { ThemeProvider } from './theme/ThemeProvider';
import './theme/theme.css';
=======
import Profile from "./Components/Pages/Profile.jsx";
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
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: "editor",
        element: <Editor />,
      },
      {
<<<<<<< HEAD
=======
        // Standalone like the editor: the page carries its own "Back to Visora" bar.
        path: "profile",
        element: <Profile />,
      },
      {
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
        path: "/",
        element: <Layout />,
        children: [
          {
            index: true,
            element: <Home />,
          },
          {
<<<<<<< HEAD
            path : "/cv",
            element : <CvTemplate/>
=======
            path: "/cv",
            element: <CvTemplate />,
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
          },
          {
            path: "about",
            element: <About />,
          },
          {
<<<<<<< HEAD
=======
            path: "templates",
            element: <Templates />,
          },
          {
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
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
<<<<<<< HEAD
=======
          { path: "forgot-password", element: <ForgotPassword /> },
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
        ],
      },
      {
        path: "login",
        element: <Navigate to="/auth/login" replace />,
      },
<<<<<<< HEAD
=======
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
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
      {
        path: "signup",
        element: <Navigate to="/auth/register" replace />,
      },
<<<<<<< HEAD
    
=======
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
    ],
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
<<<<<<< HEAD
      <ThemeProvider><RouterProvider router={router} /></ThemeProvider>
    </Provider>
  </StrictMode>
=======
      <ThemeProvider>
        <DashboardDataProvider>
          <RouterProvider router={router} />
        </DashboardDataProvider>
      </ThemeProvider>
    </Provider>
  </StrictMode>,
>>>>>>> f9e4eef75714c554db8a83d494c2842113b6e9bb
);
