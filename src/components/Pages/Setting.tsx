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