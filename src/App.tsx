import './App.css'
import AdminSlot from './components/Admin/AdminSlot/AdminSlot'
import Clothnav from './components/navbar/Clothnav'
import Topheader from './components/topheader/Topheader'

function App() {
  return (
    <div className="app-wrapper">
      {/* 1. Sidebar on the left */}
      <Clothnav />

      {/* 2. Content area on the right */}
      <div className="main-content">
        <Topheader />
        
        <div className="dashboard-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#333', margin: 0 }}>Admin Dashboard</h2>
            <button style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '10px 20px', 
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              + Add New Product
            </button>
          </div>

          {/* 3. The 4 Stats Slots in a row */}
          <AdminSlot />
        </div>
      </div>
    </div>
  )
}

export default App