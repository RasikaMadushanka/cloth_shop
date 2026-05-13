import ItemManagement from "../inventory/ItemManagement";
import Clothnav from "../navbar/Clothnav";
import ProductReturn from "../setting/product/productReturn";
import Topheader from "../topheader/Topheader";
import "./Inventory.css"; // Create this file

function Inventory() {
  return (
    <div className="app-wrapper">
      <Clothnav />
      <div className="main-content">
        <Topheader />
        <div className="inventory-body">
          <div className="inventory-grid">
            <div className="inventory-list-section">
              <ItemManagement />
            </div>
            <div>
              <ProductReturn></ProductReturn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;