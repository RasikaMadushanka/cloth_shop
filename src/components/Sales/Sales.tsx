import './sales.css';

function Sales() {
  // Mock data for the weekly overview
  const weeklyStats = [
    { label: "Weekly Revenue", value: "$8,450.00", icon: "📈", trend: "+12.5%" },
    { label: "Items Sold", value: "342", icon: "📦", trend: "+8%" },
    { label: "Average Order", value: "$24.70", icon: "💳", trend: "-2%" },
    { label: "New Customers", value: "18", icon: "👥", trend: "+4%" },
  ];

  return (
    <div className="sales-page-container">
      <div className="sales-header">
        <h1>Sales Overview</h1>
        <div className="date-picker">
          <span>This Week: April 09 - April 15</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="sales-stats-grid">
        {weeklyStats.map((stat, index) => (
          <div key={index} className="sales-stat-card">
            <div className="stat-header">
              <span className="stat-icon">{stat.icon}</span>
              <span className={`stat-trend ${stat.trend.startsWith('+') ? 'up' : 'down'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="stat-value">{stat.value}</h3>
            <p className="stat-label">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Detailed Sales Table */}
      <div className="recent-sales-section">
        <div className="section-header">
          <h3>Recent Transactions</h3>
          <button className="export-btn">Export CSV</button>
        </div>
        <table className="sales-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#12548</td>
              <td>Blue Jeans (x2)</td>
              <td>Cash</td>
              <td>$80.00</td>
              <td><span className="status-badge complete">Complete</span></td>
            </tr>
            <tr>
              <td>#12547</td>
              <td>Black T-Shirt (x1)</td>
              <td>Card</td>
              <td>$20.00</td>
              <td><span className="status-badge complete">Complete</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sales;