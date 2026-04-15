import './App.css'
import AdminOverview from './components/Admin/Adminoverview/AdminOverview'
import AdminSelling from './components/Admin/adminSelling/AdminSelling'
import AdminSlot from './components/Admin/AdminSlot/AdminSlot'
import Clothnav from './components/navbar/Clothnav'
import Topheader from './components/topheader/Topheader'

function App() {
  return (
    <div className="app-wrapper">
      <Clothnav />

      <div className="main-content">
        <Topheader />
        
        {/* <div className="dashboard-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h4 style={{ color: '#333', margin: 0 }}>Admin Dashboard</h4>
            <button style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '8px 15px', 
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              + Add New Product
            </button>
          </div>

          <AdminSlot />

          <div className="dashboard-main-row">
            <AdminSelling /> 
            <AdminOverview /> 
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default App