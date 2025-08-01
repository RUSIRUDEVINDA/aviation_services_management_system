
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuthContext } from "@asgardeo/auth-react";
import { useEffect } from "react";
import Index from "./pages/Index";
import FlightBooking from "./pages/FlightBooking";
import AirTaxiBooking from "./pages/AirTaxiBooking";
import FlightTracking from "./pages/FlightTracking";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
// ...existing code...
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();


const asgardeoConfig = {
  signInRedirectURL: window.location.origin,
  clientID: "uW3NRWmKv8b_xy1I3gP_9WiqCU0a",
  baseUrl: "https://api.asgardeo.io/t/aeroxbooking",
  scope: ["openid", "profile", "email"]
};



function AppRoutes() {
  const { state } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!state || !state.isAuthenticated) return;
    const userEmail = state.email;
    // Only admin@aerox.com should be treated as admin
    if (userEmail === "admin@aerox.com") {
      if (location.pathname !== "/admin-dashboard") {
        navigate("/admin-dashboard", { replace: true });
      }
    } else {
      // Non-admin: if on /dashboard, redirect to /user-dashboard
      if (location.pathname === "/dashboard") {
        navigate("/user-dashboard", { replace: true });
      }
    }
  }, [state?.isAuthenticated, state?.email, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/flights" element={<FlightBooking />} />
      <Route path="/air-taxi" element={<AirTaxiBooking />} />
      <Route path="/flight-status" element={<FlightTracking />} />
      <Route path="/dashboard" element={<UserDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/user-dashboard" element={<UserDashboard />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
      {/* Login and SignUp routes removed for Asgardeo integration */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <AuthProvider config={asgardeoConfig}>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
