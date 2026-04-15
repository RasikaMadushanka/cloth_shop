import './App.css'
import InventoryBilling from './components/inventory/inventoryBilling/InventoryBilling'
import ItemManagement from './components/inventory/ItemManagement'
import Clothnav from './components/navbar/Clothnav'
import Topheader from './components/topheader/Topheader'

function App() {
  return (
    <div className="app-wrapper">
      <Clothnav />
      <div className="main-content">
        <Topheader />
        <div className="inventory-row">
          {/* LEFT SIDE: Management & Product Grid */}
          <div className="left-panel">
            <ItemManagement />
          </div>

          {/* RIGHT SIDE: Dedicated Billing Sidebar */}
          <div className="right-panel">
            <InventoryBilling />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App