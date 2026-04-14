import './App.css'
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
        
        <div className="dashboard-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <h4 style={{ color: '#333', margin: 0 }}>Admin Dashboard</h4>
            <button style={{ 
              backgroundColor: '#4caf50', 
              color: 'white', 
              border: 'none', 
              padding: '5px 10px', 
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              + Add New Product
            </button>
          </div>

          {/* Top 4 Stats Slots */}
          <AdminSlot />

          {/* Main Content Row: Table and Charts */}
          <div className="dashboard-main-row">
            <AdminSelling />
            
            {/* Right Side Column for Charts/Low Stock */}
            <div className="dashboard-side-column">
               {/* SalesOverview Component will go here */}
               <div style={{ background: 'white', padding: '10px', borderRadius: '12px', height: '100%', border: '1px solid #f0f0f0' }}>
                  <p style={{ color: '#888', textAlign: 'center' }}>Sales Overview Chart Space</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App