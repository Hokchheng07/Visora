import { createRoot } from 'react-dom/client'
import "./index.css";
import { Provider } from "react-redux";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { store } from "./Components/redux/store.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Hello World</div>,
  },
]);

const root = document.getElementById("root");
createRoot(root).render(
  <Provider store={store}>
    <RouterProvider router={router} />
  </Provider>
)
