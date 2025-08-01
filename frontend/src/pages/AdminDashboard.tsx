
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AdminDashboardComponent from '../components/AdminDashboard';
import { useAuthContext } from "@asgardeo/auth-react";
import { getAllRequests } from '../services/api';
import { getAllBookings } from '../services/bookingApi';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  const { state } = useAuthContext();
  useEffect(() => {
    if (!state.isAuthenticated) {
      navigate("/", { replace: true });
    }
    // No admin email check, just show dashboard if authenticated
  }, [navigate, state.isAuthenticated]);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-navy-800 mb-2">Admin Dashboard</h1>
            <p className="text-navy-600">
              Manage bookings, cancellations, and system settings.
            </p>
          </div>
          
          <AdminDashboardComponent />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AdminDashboard;
