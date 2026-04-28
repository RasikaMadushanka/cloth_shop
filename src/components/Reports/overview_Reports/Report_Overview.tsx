import React, { useEffect, useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { stockApi, salesApi } from '../../api/Service/apiService';

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
  variant?: {
    barcodeId?: string;
    color?: string;
    size?: string;
    stockQuantity?: number;
  };
}

// ✅ UPDATED INTERFACE WITH ALL ATTRIBUTES FROM YOUR JSON
interface SavedStockReport {
  reportId: number;
  reportDate: string;
  generatedAt: string;
  reportType: string;
  stockValue: number;
  soldItemsValue: number | null; // Added
  totalItemsIn: number;
  totalItemsOut: number;
  totalRevenue: number;
  totalDiscountGiven: number;
}

type ReportType = 'DAILY' | 'MONTHLY' | 'YEARLY';

const Report_Overview: React.FC = () => {
  const [type, setType] = useState<ReportType>('DAILY');
  const [stock, setStock] = useState<StockReportData | null>(null);
  const [sales, setSales] = useState<SalesReportData | null>(null);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [savedReports, setSavedReports] = useState<SavedStockReport[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const today = new Date().toISOString().split('T')[0];

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
          logId: log.LOG_ID,
          barcodeId: log.BARCODE_ID,
          quantityChange: log.QUANTITY_CHANGE,
          timestamp: log.TIMESTAMP,
          updateReason: log.UPDATE_REASON,
          variant: log.VARIANT_ID
        }));

        setStock(stockRes.data);
        setSales(salesRes.data);
        setLogs(mappedLogs);
        setSavedReports(savedRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [type]);

  // ✅ SORTED REPORTS (Latest First based on generatedAt)
  const sortedReports = useMemo(() => {
    return [...savedReports].sort((a, b) => {
      const timeA = a.generatedAt ? new Date(a.generatedAt.replace(/-/g, "/")).getTime() : 0;
      const timeB = b.generatedAt ? new Date(b.generatedAt.replace(/-/g, "/")).getTime() : 0;
      return timeB - timeA;
    });
  }, [savedReports]);

  // ✅ SORTED LOGS (Latest First)
  const sortedLogs = useMemo(() => {
    return [...logs].sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return timeB - timeA;
    });
  }, [logs]);

  if (loading) return <div className="p-6 font-bold text-gray-500">Loading Report...</div>;
  if (!stock || !sales) return <div className="p-6 text-red-500">No Data Found</div>;

  const chartData = [
    { name: 'Stock', value: stock.stockValue },
    { name: 'Revenue', value: sales.totalRevenue }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">{type} REPORT OVERVIEW</h1>
        <div className="flex gap-2">
          {(['DAILY', 'MONTHLY', 'YEARLY'] as ReportType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`px-4 py-1.5 border rounded transition-colors font-medium ${
                type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY BOXES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-blue-600">
          <h2 className="font-bold text-blue-600 text-lg mb-2">📦 Stock Status</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-gray-400">Value</p><p className="font-bold">${stock.stockValue.toLocaleString()}</p></div>
            <div><p className="text-gray-400">Items In</p><p className="font-bold text-green-600">{stock.totalItemsIn}</p></div>
            <div><p className="text-gray-400">Items Out</p><p className="font-bold text-red-600">{stock.totalItemsOut}</p></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow border-t-4 border-green-600">
          <h2 className="font-bold text-green-600 text-lg mb-2">💰 Sales Summary</h2>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div><p className="text-gray-400">Revenue</p><p className="font-bold">${sales.totalRevenue.toLocaleString()}</p></div>
            <div><p className="text-gray-400">Sold Qty</p><p className="font-bold">{sales.totalItemsOut}</p></div>
            <div><p className="text-gray-400">Discount</p><p className="font-bold text-orange-500">${sales.totalDiscountGiven.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* ✅ FULL ATTRIBUTE SAVED REPORT TABLE */}
      <div className="bg-white p-4 rounded shadow mb-6 overflow-x-auto">
        <h2 className="font-bold text-indigo-600 mb-4 text-lg">📊 Historical Reports (All Attributes)</h2>
        <table className="w-full text-[13px] border-collapse text-left">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-2 border">No.</th>
              <th className="p-2 border">Generated At</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Stock Value</th>
              <th className="p-2 border">Sold Val</th>
              <th className="p-2 border">In</th>
              <th className="p-2 border">Out</th>
              <th className="p-2 border">Revenue</th>
              <th className="p-2 border">Disc.</th>
            </tr>
          </thead>
          <tbody>
            {sortedReports.map((r, index) => (
              <tr key={`${r.reportId}-${index}`} className="border hover:bg-blue-50/50 transition-colors">
                <td className="p-2 border font-bold text-gray-400">{index + 1}</td>
                <td className="p-2 border whitespace-nowrap">{r.generatedAt}</td>
                <td className="p-2 border whitespace-nowrap">{r.reportDate}</td>
                <td className="p-2 border text-center uppercase font-bold text-[10px]">{r.reportType}</td>
                <td className="p-2 border font-medium">Rs.{r.stockValue.toLocaleString()}</td>
                <td className="p-2 border text-gray-500">Rs.{r.soldItemsValue?.toLocaleString() ?? '0'}</td>
                <td className="p-2 border text-green-600">+{r.totalItemsIn}</td>
                <td className="p-2 border text-red-500">-{r.totalItemsOut}</td>
                <td className="p-2 border font-bold text-green-700">Rs.{r.totalRevenue.toLocaleString()}</td>
                <td className="p-2 border text-orange-600">Rs{r.totalDiscountGiven.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOGS & CHART */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-purple-600 mb-3 text-lg">📋 Stock Logs</h2>
          <div className="max-h-[300px] overflow-y-auto">
            <table className="w-full text-xs border text-left">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-2 border">No.</th>
                  <th className="p-2 border">Barcode</th>
                  <th className="p-2 border">Change</th>
                  <th className="p-2 border">Reason</th>
                  <th className="p-2 border">Time</th>
                </tr>
              </thead>
              <tbody>
                {sortedLogs.map((l, index) => (
                  <tr key={`${l.logId}-${index}`} className="hover:bg-gray-50">
                    <td className="p-2 border text-gray-400">{index + 1}</td>
                    <td className="p-2 border font-mono">{l.barcodeId}</td>
                    <td className={`p-2 border font-bold ${l.quantityChange < 0 ? 'text-red-500' : 'text-green-600'}`}>
                      {l.quantityChange > 0 ? `+{l.quantityChange}` : l.quantityChange}
                    </td>
                    <td className="p-2 border">{l.updateReason}</td>
                    <td className="p-2 border text-gray-500">{new Date(l.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-gray-700 mb-4">Stock vs Revenue Visual</h2>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#93c5fd" fillOpacity={0.4} strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Report_Overview;