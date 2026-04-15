import React from 'react';
import './Clothnav.css';
import { MdDashboard, MdInventory, MdPointOfSale, MdAssessment, MdSettings, MdCheckroom } from "react-icons/md";

// Define the interface for your navigation items
interface MenuItem {
  name: string;
  icon: React.ReactNode;
  active?: boolean; // Optional property
}

const Navbarasika: React.FC = () => {
  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: <MdDashboard />, active: true },
    { name: 'Inventory', icon: <MdInventory /> },
    { name: 'Sales', icon: <MdPointOfSale /> },
    { name: 'Reports', icon: <MdAssessment /> },
    { name: 'Settings', icon: <MdSettings /> }
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
          {menuItems.map((item, index) => (
            <li key={index} className={item.active ? 'nav-item active' : 'nav-item'}>
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.name}</span>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar_footer">
        <div className="footer-icon">🔄</div>
        <div className="footer-icon">⚙️</div>
      </div>
    </div>
  );
};

export default Navbarasika;