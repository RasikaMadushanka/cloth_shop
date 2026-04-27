import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Pages/Dashboard';
import Inventory from './components/Pages/Inventory';
import Reports from './components/Pages/Reports';
import SALES from './components/Pages/SALES';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Redirect empty path to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Standard Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/sales" element={<SALES />} />
        <Route path="/reports" element={<Reports />} />

        {/* Catch-all 404 */}
        <Route path="*" element={
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404: Page Not Found</h1>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;