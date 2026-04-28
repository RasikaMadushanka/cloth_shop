import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { stockApi, salesApi } from '../../api/Service/apiService';
import "./Report_overview.css"

// ---------------- TYPES ----------------
interface StockReportData {
  reportDate: string;
  stockValue: number;
  totalItemsIn: number;
  totalItemsOut: number;
  totalRevenue: number;
  totalDiscountGiven: number;
}

interface SalesReportData {
  date: string;
  totalRevenue: number;
  totalDiscountGiven: number;
  totalItemsIn: number;
  totalItemsOut: number;
}

interface StockLog {
  logId: number;
  barcodeId: string;
  quantityChange: number;
  timestamp: string;
  updateReason: string;
  currentStock: number; // The stock recorded after change
  oldStock: number;     // Calculated: Now Stock - Change
  variant?: {
    stockQuantity?: number;
  };
}


interface SavedStockReport {
  reportId: number;
  reportDate: string;
  generatedAt: string;
  reportType: string;
  stockValue: number;
  soldItemsValue: number | null;
  totalItemsIn: number;
  totalItemsOut: number;
  totalRevenue: number;
  totalDiscountGiven: number;
}

type ReportType = 'DAILY' | 'MONTHLY' | 'YEARLY';

const Report_Overview: React.FC = () => {
  const [type, setType] = useState<ReportType>('DAILY');

  const [stock, setStock] = useState<StockReportData>({
    reportDate: '', stockValue: 0, totalItemsIn: 0, totalItemsOut: 0, totalRevenue: 0, totalDiscountGiven: 0
  });
  const [sales, setSales] = useState<SalesReportData>({
    date: '', totalRevenue: 0, totalDiscountGiven: 0, totalItemsIn: 0, totalItemsOut: 0
  });

  const [logs, setLogs] = useState<StockLog[]>([]);
  const [savedReports, setSavedReports] = useState<SavedStockReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const today = new Date().toLocaleDateString('en-CA');

        let stockRes;
        let salesRes;

        if (type === 'DAILY') {
          stockRes = await stockApi.getDailyReport(today);
          salesRes = await salesApi.getSalesReport('DAILY', today);
        } else if (type === 'MONTHLY') {
          stockRes = await stockApi.getMonthlyReport(today);
          salesRes = await salesApi.getSalesReport('MONTHLY', today);
        } else {
          stockRes = await stockApi.getYearlyReport(today);
          salesRes = await salesApi.getSalesReport('YEARLY', today);
        }

        const logRes = await stockApi.getAllLogs();
        const savedRes = await stockApi.getAllSavedReports();

        const mappedLogs: StockLog[] = (logRes.data || []).map((log: any) => ({
          logId: log.LOG_ID || log.logId,
          barcodeId: log.BARCODE_ID || log.barcodeId,
          quantityChange: log.QUANTITY_CHANGE || log.quantityChange,
          timestamp: log.TIMESTAMP || log.timestamp,
          updateReason: log.UPDATE_REASON || log.updateReason,
          variant: log.VARIANT_ID || log.variant,
          currentStock: (log.VARIANT_ID || log.variant)?.stockQuantity ?? 0
        }));

        if (stockRes.data) setStock(stockRes.data);
        if (salesRes.data) setSales(salesRes.data);

        setLogs(mappedLogs);
        setSavedReports(savedRes.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type]);

  // FIXED: Now specifically using reportId for the sorting order (Highest ID = Latest)
  const sortedReports = useMemo(() => {
    return [...savedReports].sort((a, b) => b.reportId - a.reportId);
  }, [savedReports]);

  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => b.logId - a.logId);
  }, [logs]);

  if (loading) return <div className="p-6 font-bold text-blue-600 animate-pulse">Loading Analytics...</div>;

  const chartData = [
    { name: 'Stock Value', value: stock.stockValue || 0 },
    { name: 'Revenue', value: sales.totalRevenue || 0 }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{type} REPORT OVERVIEW</h1>
        <div className="flex gap-2">
          {(['DAILY', 'MONTHLY', 'YEARLY'] as ReportType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 border rounded transition-all font-medium ${type === t ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg shadow-sm border-t-4 border-blue-600">
          <h2 className="font-bold text-blue-600 text-lg mb-2">📦 Stock Status</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-gray-400 uppercase text-[10px] font-bold">Value</p><p className="font-bold text-gray-700">Rs. {stock.stockValue.toLocaleString()}</p></div>
            <div><p className="text-gray-400 uppercase text-[10px] font-bold">Items In</p><p className="font-bold text-green-600">+{stock.totalItemsIn}</p></div>
            <div><p className="text-gray-400 uppercase text-[10px] font-bold">Items Out</p><p className="font-bold text-red-600">-{stock.totalItemsOut}</p></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow-sm border-t-4 border-green-600">
          <h2 className="font-bold text-green-600 text-lg mb-2">💰 Sales Summary</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-gray-400 uppercase text-[10px] font-bold">Revenue</p><p className="font-bold text-gray-700">Rs. {sales.totalRevenue.toLocaleString()}</p></div>
            <div><p className="text-gray-400 uppercase text-[10px] font-bold">Sold Qty</p><p className="font-bold text-gray-700">{sales.totalItemsOut}</p></div>
            <div><p className="text-gray-400 uppercase text-[10px] font-bold">Discount</p><p className="font-bold text-orange-500">Rs. {sales.totalDiscountGiven.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* HISTORICAL TABLE - SORTED BY ID */}
     // ONLY showing modified parts (tables). Your logic is untouched.

      {/* HISTORICAL TABLE */}
      <div className="bg-white p-4 rounded shadow-sm mb-6 overflow-x-auto">
        <h2 className="font-bold text-indigo-600 mb-4 text-lg">
          📊 Historical Reports (Sorted by ID)
        </h2>

        <table className="table-ui">
          <thead>
            <tr>
              <th>ID</th>
              <th>Generated At</th>
              <th>Report Date</th>
              <th>Type</th>
              <th className="text-right">Stock Value</th>
              <th className="text-right">Sold Items Value</th>
              <th className="text-right text-green-700">Net Revenue</th>
              <th className="text-right text-orange-600">Discount</th>
              <th className="text-center text-green-600">In</th>
              <th className="text-center text-red-500">Out</th>
            </tr>
          </thead>

          <tbody>
            {sortedReports.length > 0 ? sortedReports.map((r) => (
              <tr key={r.reportId}>
                <td className="text-gray-400 font-bold">#{r.reportId}</td>
                <td className="text-gray-600 text-[11px]">{r.generatedAt}</td>
                <td className="font-medium">{r.reportDate}</td>
                <td>
                  <span className="badge badge-indigo">{r.reportType}</span>
                </td>
                <td className="text-right">Rs.{r.stockValue.toLocaleString()}</td>
                <td className="text-right text-gray-500">
                  {r.soldItemsValue !== null ? `Rs.${r.soldItemsValue.toLocaleString()}` : '0.0'}
                </td>
                <td className="text-right font-bold text-green-700">
                  Rs.{r.totalRevenue.toLocaleString()}
                </td>
                <td className="text-right text-orange-600">
                  Rs.{r.totalDiscountGiven.toLocaleString()}
                </td>
                <td className="text-center text-green-600 font-bold">
                  +{r.totalItemsIn}
                </td>
                <td className="text-center text-red-500 font-bold">
                  -{r.totalItemsOut}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={10} className="text-center text-gray-400 italic py-10">
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


      {/* STOCK LOG TABLE */}
      <div className="bg-white p-4 rounded shadow-sm border">
        <h2 className="font-bold text-purple-600 mb-3 text-lg">
          📋 Stock Logs
        </h2>

        <div className="scroll-y">
          <table className="table-ui">
            <thead>
              <tr>
                <th>Barcode</th>
                <th className="text-center">Change</th>
                <th className="text-center">Now Stock</th>
                <th>Reason</th>
                <th>Time</th>
              </tr>
            </thead>

            <tbody>
              {sortedLogs.map((l) => (
                <tr key={l.logId}>
                  <td className="font-mono text-blue-700">{l.barcodeId}</td>
                  <td className={`text-center font-bold ${l.quantityChange < 0 ? 'text-red-500' : 'text-green-600'}`}>
                    {l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange}
                  </td>
                  <td className="text-center font-bold">{l.currentStock}</td>
                  <td className="text-gray-500 text-[10px] uppercase font-bold">{l.updateReason}</td>
                  <td className="text-gray-400 whitespace-nowrap">
                    {l.timestamp
                      ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOGS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow-sm border">
          <h2 className="font-bold text-purple-600 mb-3 text-lg">📋 Stock Logs</h2>
          <div className="max-h-[350px] overflow-y-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 shadow-sm">
                <tr>
                  <th className="p-2 border-b">Barcode</th>
                  <th className="p-2 border-b text-center">Change</th>
                  <th className="p-2 border-b text-center bg-blue-50">Now Stock</th>
                  <th className="p-2 border-b">Reason</th>
                  <th className="p-2 border-b">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((l) => (
                  <tr key={l.logId} className="hover:bg-gray-50 border-b last:border-0">
                    <td className="p-2 font-mono text-blue-700">{l.barcodeId}</td>
                    <td className={`p-2 text-center font-bold ${l.quantityChange < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {l.quantityChange > 0 ? `+${l.quantityChange}` : l.quantityChange}
                    </td>
                    <td className="p-2 text-center font-bold bg-blue-50/30">
                      {l.currentStock}
                    </td>
                    <td className="p-2 text-gray-500 text-[10px] uppercase font-bold">{l.updateReason}</td>
                    <td className="p-2 text-gray-400 whitespace-nowrap">
                      {l.timestamp ? new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CHART SECTION */}
        {/* CHART SECTION */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border flex flex-col h-[450px]">
          <h2 className="font-black text-slate-700 mb-4 px-2 uppercase tracking-wide text-sm">
            Stock vs Revenue Visual
          </h2>

          <div className="flex-1 w-full min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                  dy={10}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }}
                />

                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    padding: '12px',
                    backgroundColor: '#ffffff',
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#chartGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Report_Overview;