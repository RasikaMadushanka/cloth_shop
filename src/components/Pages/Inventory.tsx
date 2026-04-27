import InventoryBilling from "../inventory/inventoryBilling/InventoryBilling";
import ItemManagement from "../inventory/ItemManagement";
import Clothnav from "../navbar/Clothnav";
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
            <div className="inventory-billing-section">
              <InventoryBilling />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Inventory;