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
        <div className="page-scroller"> {/* Added for scrolling */}
          <div className="reports-body">
            <header className="reports-header">
              <h2>Sales & POS Terminal</h2>
              <p className="subtitle">Scan items to process new transactions</p>
            </header>
            
            {/* The POS Component sits inside the body padding */}
            <Sales />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SALES