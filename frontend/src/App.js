import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import "@/App.css";

import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import ClientCreate from "@/pages/ClientCreate";
import ClientDetails from "@/pages/ClientDetails";
import Projects from "@/pages/Projects";
import ProjectDetails from "@/pages/ProjectDetails";
import Campaigns from "@/pages/Campaigns";
import CampaignDetails from "@/pages/CampaignDetails";
import CampaignCreate from "@/pages/CampaignCreate";
import ProjectCreate from "@/pages/ProjectCreate";
import VendorCreate from "@/pages/VendorCreate";
import VendorDetails from "@/pages/VendorDetails";
import VehicleCreate from "@/pages/VehicleCreate";
import VehicleDetails from "@/pages/VehicleDetails";
import DriverCreate from "@/pages/DriverCreate";
import DriverDetails from "@/pages/DriverDetails";
import PromoterCreate from "@/pages/PromoterCreate";
import PromoterDetails from "@/pages/PromoterDetails";
import ExpenseCreate from "@/pages/ExpenseCreate";
import Vendors from "@/pages/Vendors";
import Vehicles from "@/pages/Vehicles";
import Drivers from "@/pages/Drivers";
import Promoters from "@/pages/Promoters";
import Operations from "@/pages/Operations";
import Expenses from "@/pages/Expenses";
import ExpenseDetails from "@/pages/ExpenseDetails";
import Reports from "@/pages/Reports";
import ReportCreate from "@/pages/ReportCreate";
import ReportDetails from "@/pages/ReportDetails";
import Accounts from "@/pages/Accounts";
import Analytics from "@/pages/Analytics";
import Settings from "@/pages/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <ProtectedRoute component={Layout} />
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="clients" element={<Clients />} />
              <Route path="clients/new" element={<ClientCreate />} />
              <Route path="clients/:id" element={<ClientDetails />} />
              <Route path="clients/:id/edit" element={<ClientCreate />} />
              <Route path="projects" element={<Projects />} />
              <Route path="projects/new" element={<ProjectCreate />} />
              <Route path="projects/:id" element={<ProjectDetails />} />
              <Route path="projects/:id/edit" element={<ProjectCreate />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="campaigns/new" element={<CampaignCreate />} />
              <Route path="campaigns/:id" element={<CampaignDetails />} />
              <Route path="campaigns/:id/edit" element={<CampaignCreate />} />
              <Route path="vendors" element={<Vendors />} />
              <Route path="vendors/new" element={<VendorCreate />} />
              <Route path="vendors/:id" element={<VendorDetails />} />
              <Route path="vendors/:id/edit" element={<VendorCreate />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="vehicles/new" element={<VehicleCreate />} />
              <Route path="vehicles/:id" element={<VehicleDetails />} />
              <Route path="vehicles/:id/edit" element={<VehicleCreate />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="drivers/new" element={<DriverCreate />} />
              <Route path="drivers/:id" element={<DriverDetails />} />
              <Route path="drivers/:id/edit" element={<DriverCreate />} />
              <Route path="promoters" element={<Promoters />} />
              <Route path="promoters/new" element={<PromoterCreate />} />
              <Route path="promoters/:id" element={<PromoterDetails />} />
              <Route path="promoters/:id/edit" element={<PromoterCreate />} />
              <Route path="operations" element={<Operations />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="expenses/new" element={<ExpenseCreate />} />
              <Route path="expenses/:id" element={<ExpenseDetails />} />
              <Route path="expenses/:id/edit" element={<ExpenseCreate />} />
              <Route path="reports" element={<Reports />} />
              <Route path="reports/new" element={<ReportCreate />} />
              <Route path="reports/:id" element={<ReportDetails />} />
              <Route path="reports/:id/edit" element={<ReportCreate />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<ProtectedRoute component={Settings} requiredRoles={['admin']} />} />
            </Route>
          </Routes>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
