import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./store/authStore";
import Home from "./pages/index";
import Login from "./pages/auth/login";
import Otp from "./pages/auth/otp";
import Register from "./pages/auth/register";
import Booking from "./pages/user/booking";
import Members from "./pages/user/members";
import Packages from "./pages/packages";
import Trainers from "./pages/trainers";
import Profile from "./pages/user/profile";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/otp" element={<Otp />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/user/booking" element={<Booking />} />
          <Route path="/user/members" element={<Members />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/trainers" element={<Trainers />} />
          <Route path="/user/profile" element={<Profile />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
