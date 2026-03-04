import { createBrowserRouter } from "react-router-dom";
import React from "react";

import AppShell from "./AppShell";
import ProtectedRoute from "@/components/ProtectedRoute";
import RedirectIfAuthed from "@/components/RedirectIfAuthed";

import Landing from "@/pages/Landing";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

import InboxPage from "@/pages/InboxPage";
import TodayPage from "@/pages/TodayPage";
import UpcomingPage from "@/pages/UpcomingPage";
import CompletedPage from "@/pages/CompletedPage";
import ListPage from "@/pages/ListPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <RedirectIfAuthed to="/inbox">
        <Landing />
      </RedirectIfAuthed>
    ),
  },
  {
    path: "/login",
    element: (
      <RedirectIfAuthed to="/inbox">
        <LoginPage />
      </RedirectIfAuthed>
    ),
  },
  {
    path: "/register",
    element: (
      <RedirectIfAuthed to="/inbox">
        <RegisterPage />
      </RedirectIfAuthed>
    ),
  },

  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
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