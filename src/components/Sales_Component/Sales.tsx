import React from 'react';
import './sales.css';

// Define the shape of our stats data
interface WeeklyStat {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

// Define the shape of a transaction
interface Transaction {
  id: string;
  items: string;
  payment: 'Cash' | 'Card' | 'Online';
  total: string;
  status: 'Complete' | 'Pending' | 'Cancelled';
}

const Sales: React.FC = () => {
  // Type-safe mock data
  const weeklyStats: WeeklyStat[] = [
    { label: "Weekly Revenue", value: "$8,450.00", icon: "📈", trend: "+12.5%" },
    { label: "Items Sold", value: "342", icon: "📦", trend: "+8%" },
    { label: "Average Order", value: "$24.70", icon: "💳", trend: "-2%" },
    { label: "New Customers", value: "18", icon: "👥", trend: "+4%" },
  ];

  const transactions: Transaction[] = [
    { id: "#12548", items: "Blue Jeans (x2)", payment: "Cash", total: "$80.00", status: "Complete" },
    { id: "#12547", items: "Black T-Shirt (x1)", payment: "Card", total: "$20.00", status: "Complete" },
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
          <button className="export-btn" onClick={() => console.log('Exporting...')}>
            Export CSV
          </button>
        </div>
        
        {/* Responsive Table Wrapper */}
        <div className="table-responsive">
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
              {transactions.map((trx) => (
                <tr key={trx.id}>
                  <td>{trx.id}</td>
                  <td>{trx.items}</td>
                  <td>{trx.payment}</td>
                  <td>{trx.total}</td>
                  <td>
                    <span className={`status-badge ${trx.status.toLowerCase()}`}>
                      {trx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;