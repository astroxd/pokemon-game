import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./Lobby";
import GameDemo from "./GameDemo";
import { UserProvider } from "./UserProvider";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";

const router = createBrowserRouter([
  {
    path: "demo",
    element: <GameDemo />,
  },
  {
    path: "login",
    element: <Login />,
  },
  {
    element: <PrivateRoute />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "game",
        element: <Lobby />,
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);
