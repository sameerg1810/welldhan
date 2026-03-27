import React from "react";
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

import UserDashboard from "./pages/user/UserDashboard";
import BookSlotPage from "./pages/user/BookSlotPage";
import MyBookingsPage from "./pages/user/MyBookingsPage";
import FoodPreferencesPage from "./pages/user/FoodPreferencesPage";
import PaymentsPage from "./pages/user/PaymentsPage";
import FamilyMembersPage from "./pages/user/FamilyMembersPage";
import ProfilePage from "./pages/user/ProfilePage";

import TrainerHome from "./pages/trainer/TrainerHome";
import AttendancePage from "./pages/trainer/AttendancePage";
import StudentsPage from "./pages/trainer/StudentsPage";
import TrainerProfilePage from "./pages/trainer/TrainerProfilePage";

import ManagerDashboard from "./pages/manager/ManagerDashboard";
import ResidentsPage from "./pages/manager/ResidentsPage";
import ManagerPaymentsPage from "./pages/manager/ManagerPaymentsPage";
import InventoryPage from "./pages/manager/InventoryPage";
import SlotsManagementPage from "./pages/manager/SlotsManagementPage";

import AdminDashboard from "./pages/admin/AdminDashboard";

function RequireAuth({ roles }: { roles?: string[] }) {
  const { token, role } = useAuthStore();
  if (!token) return <Navigate to="/" replace />;
  if (roles && role && !roles.includes(role)) {
    if (role === "Trainer") return <Navigate to="/trainer/home" replace />;
    if (role === "Manager") return <Navigate to="/manager/dashboard" replace />;
    if (role === "Admin") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  {
    element: <RequireAuth roles={["User"]} />,
    children: [
      { path: "/dashboard", element: <UserDashboard /> },
      { path: "/book", element: <BookSlotPage /> },
      { path: "/bookings", element: <MyBookingsPage /> },
      { path: "/food", element: <FoodPreferencesPage /> },
      { path: "/payments", element: <PaymentsPage /> },
      { path: "/members", element: <FamilyMembersPage /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },

  {
    element: <RequireAuth roles={["Trainer"]} />,
    children: [
      { path: "/trainer/home", element: <TrainerHome /> },
      { path: "/trainer/attendance", element: <AttendancePage /> },
      { path: "/trainer/students", element: <StudentsPage /> },
      { path: "/trainer/profile", element: <TrainerProfilePage /> },
    ],
  },

  {
    element: <RequireAuth roles={["Manager", "Admin"]} />,
    children: [
      { path: "/manager/dashboard", element: <ManagerDashboard /> },
      { path: "/manager/residents", element: <ResidentsPage /> },
      { path: "/manager/payments", element: <ManagerPaymentsPage /> },
      { path: "/manager/inventory", element: <InventoryPage /> },
      { path: "/manager/slots", element: <SlotsManagementPage /> },
    ],
  },

  {
    element: <RequireAuth roles={["Admin"]} />,
    children: [{ path: "/admin/dashboard", element: <AdminDashboard /> }],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
