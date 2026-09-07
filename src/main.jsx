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
      <ThemeProvider><RouterProvider router={router} /></ThemeProvider>
    </Provider>
  </StrictMode>
);
