import Clothnav from "../navbar/Clothnav";
import Report_Overview from "../Reports/overview_Reports/Report_Overview";
import Topheader from "../topheader/Topheader";
import "./Reports.css"; 

function Reports() {
  return (
    <div className="app-wrapper">
      <Clothnav />
      <div className="main-content">
        <Topheader />
        <div className="reports-body">
          <header className="reports-header">
            <h2>Analytics & Reports</h2>
          </header>
          <div className="reports-content">
             <Report_Overview />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;