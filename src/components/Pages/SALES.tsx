import Topheader from '../topheader/Topheader'
import Clothnav from '../navbar/Clothnav'
import Sales from '../Sales_Component/Sales'
import "./Sales_Overview.css"

function SALES() {
  return (
     <div className="app-wrapper">
      <Clothnav />
      <div className="main-content">
        <Topheader />
        <div className="reports-body">
          <header className="reports-header">
            <h2>Analytics & Reports</h2>
            </header>
            </div>
            <Sales></Sales>
            </div>
            </div>
            
  )
}

export default SALES