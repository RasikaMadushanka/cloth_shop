import React from 'react';
import './Topheader.css';
import { MdNotificationsNone, MdPlayCircleOutline, MdKeyboardArrowDown } from "react-icons/md";

const Topheader: React.FC = () => {
  return (
    <header className="top_header">
      <div className="header_left">
        <div className="breadcrumb">
          <span className="breadcrumb-icon">📊</span>
          <span className="breadcrumb-item">Inventory</span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-item active">Admin</span>
        </div>
      </div>

      {/* Right Side: Actions & Profile */}
      <div className="header_right">
        <div className="header_icon_btns">
          <button className="icon_btn">
            <MdNotificationsNone />
          </button>
          <button className="icon_btn">
            <MdPlayCircleOutline />
          </button>
        </div>
        
        <div className="user_profile">
          <img 
            src="https://via.placeholder.com/35" 
            alt="User Avatar" 
            className="avatar" 
          />
          <div className="user_info">
            <span className="user_name">Admin</span>
            <MdKeyboardArrowDown className="dropdown_arrow" />
          </div>
        </div>
      </div>   
    </header>
  );
};

export default Topheader;