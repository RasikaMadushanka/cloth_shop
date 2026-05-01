import React from "react";
import "./Topheader.css";
import {
  MdNotificationsNone,
  MdPlayCircleOutline,
  MdKeyboardArrowDown,
} from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

const Topheader: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getPageName = () => {
    const path = location.pathname;

    if (path.startsWith("/dashboard")) return "Dashboard";
    if (path.startsWith("/sales")) return "Sales";
    if (path.startsWith("/settings")) return "Settings";
    if (path.startsWith("/reports")) return "Reports";
    if (path.startsWith("/inventory")) return "Inventory";

    return "Admin";
  };

  // ✅ SIGN OUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="top_header">
      <div className="header_left">
        <div className="breadcrumb">
          <span className="breadcrumb-icon">📊</span>
          <span className="breadcrumb-item text-red-500 font-bold text-2xl">
            හෙළ සිත් රූ
          </span>
          <span className="breadcrumb-separator">&gt;</span>
          <span className="breadcrumb-item active">{getPageName()}</span>
        </div>
      </div>

      <div className="header_right">
        <div className="header_icon_btns">
          <button className="icon_btn">
            <MdNotificationsNone />
          </button>
          <button className="icon_btn">
            <MdPlayCircleOutline />
          </button>
        </div>

        {/* USER MENU */}
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

          {/* 🔥 LOGOUT BUTTON */}
          <button
            onClick={handleLogout}
            className="ml-3 text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topheader;