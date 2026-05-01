import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Dashboard from "./components/Pages/Dashboard";
import Inventory from "./components/Pages/Inventory";
import Reports from "./components/Pages/Reports";
import SALES from "./components/Pages/SALES";
import Setting from "./components/Pages/Setting";
import Login from "./components/Admin/login";

import ProtectedRoute from "./components/Pages/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>

        {/*  LOGIN */}
        <Route path="/" element={<Login />} />

        {/*  DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN","ADMIN"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/*  INVENTORY */}
        <Route
          path="/inventory"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <Inventory />
            </ProtectedRoute>
          }
        />

        {/*  SALES */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
              <SALES />
            </ProtectedRoute>
          }
        />

        {/*  REPORTS */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <Reports />
            </ProtectedRoute>
          }
        />

        {/*  SETTINGS */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
              <Setting />
            </ProtectedRoute>
          }
        />

        {/*  404 */}
        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </Router>
  );
};

export default App;