import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";

import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

import InboxPage from "../pages/InboxPage";
import TodayPage from "../pages/TodayPage";
import UpcomingPage from "../pages/UpcomingPage";
import CompletedPage from "../pages/CompletedPage";
import ListPage from "../pages/ListPage";
import SettingsPage from "../pages/SettingsPage";
import ProfilePage from "../pages/ProfilePage";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage />},
  { path: "/register", element: <RegisterPage />},
  
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <TodayPage /> },
      { path: "/inbox", element: <InboxPage /> },
      { path: "/today", element: <TodayPage /> },
      { path: "/upcoming", element: <UpcomingPage /> },
      { path: "/completed", element: <CompletedPage /> },
      { path: "/lists/:id", element: <ListPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
]);