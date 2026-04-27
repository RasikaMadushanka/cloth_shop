import React from "react";
import Clothnav from "../navbar/Clothnav";
import AdminAdd from "../setting/AdminAdd"; // Ensure this folder path is correct
import Topheader from "../topheader/Topheader";
import ProductManagement from "../setting/product/productManagement";

function Setting() {
  return (
    <div className="app-wrapper">
      <Clothnav />
      <div className="main-content">
        <Topheader />
        <div className="content-body"> 
          <header className="page-header">
            <h2 className="text-white text-2xl font-bold p-4">Settings</h2>
          </header>
          
          {/* This is where your Admin Add Form will appear */}
          <div className="settings-container">
             <AdminAdd />
          </div>
          <div>
            <ProductManagement/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Setting;