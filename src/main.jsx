
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.jsx";
import { store } from "./Components/redux/store";
import { createRoot } from 'react-dom/client'
import "./index.css";
import { Provider } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { store } from "./Components/redux/store.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const root = document.getElementById("root");
ReactDOM.createRoot(root).render(
  <StrictMode>
    <Provider store={store()}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
createRoot(root).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
