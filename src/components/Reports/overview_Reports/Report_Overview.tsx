import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

// --- Interfaces ---
interface StockMovement {
  sku: string;
  name: string;
  opening: number;
  received: number;
  sold: number;
  closing: number;
  value: string;
}

interface SellingDetail {
  orderId: string;
  date: string;
  customer: string;
  items: number;
  total: string;
  method: 'Cash' | 'Card' | 'Online';
}

// --- New Mock Data ---
const STOCK_REPORT: StockMovement[] = [
  { sku: 'TSH-001', name: 'Black T-Shirt', opening: 150, received: 100, sold: 195, closing: 55, value: '$550.00' },
  { sku: 'JNS-002', name: 'Blue Jeans', opening: 200, received: 50, sold: 180, closing: 70, value: '$1,400.00' },
  { sku: 'HOD-003', name: 'Grey Hoodie', opening: 80, received: 120, sold: 160, closing: 40, value: '$800.00' },
  { sku: 'DRS-004', name: 'Red Dress', opening: 50, received: 150, sold: 150, closing: 50, value: '$1,250.00' },
];

const SELLING_REPORT: SellingDetail[] = [
  { orderId: '#ORD-9901', date: '2024-04-28', customer: 'John Doe', items: 3, total: '$120.00', method: 'Card' },
  { orderId: '#ORD-9902', date: '2024-04-28', customer: 'Sarah Smith', items: 1, total: '$45.00', method: 'Cash' },
  { orderId: '#ORD-9903', date: '2024-04-29', customer: 'Mike Ross', items: 5, total: '$310.00', method: 'Online' },
  { orderId: '#ORD-9904', date: '2024-04-30', customer: 'Emma Watson', items: 2, total: '$85.00', method: 'Card' },
];

const COLORS = ['#1e40af', '#bfdbfe'];
const SALES_DATA = [
  { day: 'W1', sales: 4200 }, { day: 'W2', sales: 5100 }, { day: 'W3', sales: 4800 }, { day: 'W4', sales: 6200 }
];

const Report_Overview: React.FC = () => {
  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen text-slate-800 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <nav className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Analytics Dashboard</nav>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Monthly Operations Report</h1>
        </div>
        <div className="flex gap-2">
          <button className="bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold shadow-sm hover:bg-slate-50 transition-all">Print Report</button>
          <button className="bg-[#1e40af] text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-800 transition-all text-xs font-bold">Download CSV</button>
        </div>
      </div>

      {/* Top Row: Visual Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Revenue Growth (Weekly)</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
            <div className="mb-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inventory Status</p>
                <h3 className="text-2xl font-black text-slate-900">70% Turnover</h3>
            </div>
            <div className="h-40 w-40 relative">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={[{v:70}, {v:30}]} innerRadius={50} outerRadius={70} dataKey="v" startAngle={90} endAngle={-270}>
                            <Cell fill="#1e40af" /><Cell fill="#f1f5f9" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 w-full border-t pt-4">
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">Sold</p><p className="font-bold">1,240</p></div>
                <div><p className="text-[10px] text-slate-400 font-bold uppercase">In Stock</p><p className="font-bold">988</p></div>
            </div>
        </div>
      </div>

      {/* --- FULL MONTHLY ITEM STOCK REPORT TABLE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-8">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Full Monthly Item Stock Report</h2>
          <span className="text-[10px] bg-blue-100 text-blue-700 font-black px-2 py-1 rounded">Total Items: 142</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-black border-b bg-slate-50/30">
                <th className="p-4">SKU</th>
                <th className="p-4">Item Name</th>
                <th className="p-4 text-center">Opening Stock</th>
                <th className="p-4 text-center">Received (+)</th>
                <th className="p-4 text-center">Sold (-)</th>
                <th className="p-4 text-center">Closing Stock</th>
                <th className="p-4 text-right">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {STOCK_REPORT.map((item) => (
                <tr key={item.sku} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-slate-400">{item.sku}</td>
                  <td className="p-4 font-bold text-slate-700">{item.name}</td>
                  <td className="p-4 text-center">{item.opening}</td>
                  <td className="p-4 text-center text-green-600 font-bold">+{item.received}</td>
                  <td className="p-4 text-center text-red-500 font-bold">-{item.sold}</td>
                  <td className="p-4 text-center">
                    <span className={`font-black ${item.closing < 50 ? 'text-orange-500' : 'text-slate-900'}`}>{item.closing}</span>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- FULL MONTHLY SELLING REPORT TABLE --- */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">Full Monthly Selling Report</h2>
          <button className="text-blue-600 text-[10px] font-black uppercase hover:underline">View All Transactions</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] uppercase text-slate-400 font-black border-b bg-slate-50/30">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Customer</th>
                <th className="p-4 text-center">Items</th>
                <th className="p-4 text-center">Method</th>
                <th className="p-4 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs">
              {SELLING_REPORT.map((sale) => (
                <tr key={sale.orderId} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-blue-600">{sale.orderId}</td>
                  <td className="p-4 text-slate-500">{sale.date}</td>
                  <td className="p-4 font-semibold text-slate-700">{sale.customer}</td>
                  <td className="p-4 text-center">{sale.items}</td>
                  <td className="p-4 text-center">
                    <span className="bg-slate-100 px-2 py-1 rounded text-[9px] font-bold text-slate-600">{sale.method}</span>
                  </td>
                  <td className="p-4 text-right font-black text-slate-900 text-sm">{sale.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Report_Overview;
