import './App.css'
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

          {/* LEFT SIDE (Item Management - SMALL) */}
          <div className="left-panel">
            <ItemManagement />
          </div>

          {/* RIGHT SIDE (BIG AREA) */}
          <div className="right-panel">
            <h2>Right Content</h2>
            <p>Add POS / Billing / Dashboard here</p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default App