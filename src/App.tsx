
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";

import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import DoctorsPage from "./pages/DoctorsPage";
import ProfilePage from "./pages/ProfilePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFound from "./pages/NotFound";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./hooks/useAuth";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/admin-login" element={<AdminLoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    
    {/* Protected routes with layout */}
    <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
      <Route index element={<DashboardPage />} />
      <Route path="appointments" element={<AppointmentsPage />} />
      <Route path="doctors" element={<DoctorsPage />} />
      <Route path="profile" element={<ProfilePage />} />
      
      {/* Admin only routes */}
      <Route path="admin" element={<AdminRoute><Navigate to="/app/admin/dashboard" /></AdminRoute>} />
      <Route path="admin/dashboard" element={<AdminRoute><DashboardPage /></AdminRoute>} />
    </Route>
    
    {/* Catch-all route */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="medisync-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
