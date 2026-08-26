import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import "./index.css";
import App from "./App.jsx";
import { store } from "./Components/redux/store";

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
