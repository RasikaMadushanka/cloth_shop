import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import Pages
// Ensure these paths match your folder structure exactly
import Dashboard from './components/Pages/Dashboard';
import Inventory from './components/Pages/Inventory';
import Reports from './components/Pages/Reports';
import SALES from './components/Pages/SALES';
import Setting from './components/Pages/Setting';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* 1. Default Redirect: Sends user to /dashboard if path is empty */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 2. Main Application Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        
        {/* Standardized to lowercase /sales for the URL path */}
        <Route path="/sales" element={<SALES />} />
        
        <Route path="/reports" element={<Reports />} />
        
        {/* The route causing the 404 - Ensure you browse to /setting (lowercase) */}
        <Route path="/settings" element={<Setting />} />

        {/* 3. Catch-all Route: Displays 404 for any undefined URL */}
        <Route path="*" element={
          <div style={{ 
            textAlign: 'center', 
            marginTop: '100px', 
            color: 'white', 
            fontFamily: 'sans-serif' 
          }}>
            <h1 style={{ fontSize: '3rem' }}>404</h1>
            <p>Oops! The page you are looking for does not exist.</p>
            <button 
              onClick={() => window.location.href = '/dashboard'}
              style={{
                marginTop: '20px',
                padding: '10px 20px',
                cursor: 'pointer',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#3b82f6',
                color: 'white'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        } />
      </Routes>
    </Router>
  );
};

export default App;