import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AppLoading from "@/components/AppLoading";

export default function RedirectIfAuthed({ children, to = "/inbox" }) {
  const { user, loading } = useAuth();

  if (loading) return <AppLoading />;
  if (user) return <Navigate to={to} replace />;

  return children;
}