import './App.css'
import InventoryBilling from './components/inventory/inventoryBilling/InventoryBilling'
import ItemManagement from './components/inventory/ItemManagement'
import Clothnav from './components/navbar/Clothnav'
import Sales from './components/Sales/Sales'
import Topheader from './components/topheader/Topheader'

function App() {
  return (
    <div className="app-wrapper">
      <Clothnav />
      <div className="main-content">
        <Topheader />
        <div className="sales_overview">
        <Sales></Sales>
        </div>
      </div>
    </div>
  )
}

export default App