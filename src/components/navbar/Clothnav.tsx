import React from 'react';
import "./Clothnav.css"
import { Link, useLocation } from 'react-router-dom';
import { MdDashboard, MdInventory, MdPointOfSale, MdAssessment, MdSettings, MdCheckroom } from "react-icons/md";

interface MenuItem {
  name: string;
  icon: React.ReactNode;
  path: string;
}

const Navbarasika: React.FC = () => {
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <MdDashboard />, path: '/dashboard' },
    { name: 'Inventory', icon: <MdInventory />, path: '/inventory' },
    { name: 'Sales', icon: <MdPointOfSale />, path: '/sales' }, 
    { name: 'Reports', icon: <MdAssessment />, path: '/reports' },
    { name: 'Settings', icon: <MdSettings />, path: '/settings' }
  ];

  return (
    <div className='sidebar_container'>
      <div className='sidebar_title'>
        <MdCheckroom className='logo-icon' />
        <div className='title_text'>
          <h3>Clothing Shop</h3>
          <span>Management System</span>
        </div>
      </div>

      <nav className='side_navbar'>
        <ul>
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            
            return (
              <li key={index}>
                <Link 
                  to={item.path} 
                  className={`nav-item ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar_footer">
        <Link to="/settings" className="footer-icon">⚙️</Link>
        <div className="footer-icon">🔄</div>
      </div>
    </div>
  );
};

export default Navbarasika;