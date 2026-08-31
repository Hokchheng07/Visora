import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";  
import SignUp from "./Components/Auth/SignUp.jsx";
import { store } from "./Components/redux/store";
import { Provider } from "react-redux";

import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import Login from "./Components/Auth/Login.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/signup",
    element: <SignUp />,
  },
  {
    path: "/login",
    element: <Login />,
  },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);