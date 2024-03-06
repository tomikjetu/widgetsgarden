import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App, { AppLoader } from "./App";
import "./Styles/root/mediaquery.css";
import "./Styles/root/root.css";
import "./Styles/root/elements.css";
import "./Styles/root/animations.css";

const router = createBrowserRouter([
  {
    path: "*",
    loader: AppLoader,
    element: <App />,
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);
