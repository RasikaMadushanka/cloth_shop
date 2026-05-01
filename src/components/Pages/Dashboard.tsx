import AdminOverview from "../Admin/Adminoverview/AdminOverview"
import AdminSelling from "../Admin/adminSelling/AdminSelling"
import AdminSlot from "../Admin/AdminSlot/AdminSlot"
import Clothnav from "../navbar/Clothnav"
import Topheader from "../topheader/Topheader"
import "./Dashboard.css"


function Dashboard() {
    return (
        <div className="app-wrapper">
            <Clothnav />
            <div className="main-content">
                <Topheader />
                <div className="dashboard-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    </div>
                    <AdminSlot />
                    <div className="dashboard-main-row">
                        <AdminSelling />
                        <AdminOverview />
                    </div>
                </div>

            </div>
        </div>
    )
}

export default Dashboard