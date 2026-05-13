import React, { useEffect, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { stockApi, salesApi } from '../../api/Service/apiService';

// ================= TYPES =================

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

interface SalesRecord {
  saleId: string;
  timestamp: string;
  saleType: string;
  netAmount: number;
  paymentMethod: string;
  discountAmount: number;
}

interface StockLog {
  logId: number;
  barcodeId: string;
  quantityChange: number;
  timestamp: string;
  updateReason: string;
  currentStock: number;
  saleType?: 'RETAIL' | 'WHOLESALE' | null;
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

// ================= HELPERS =================

const safeNum = (val: unknown): number =>
  typeof val === 'number' && isFinite(val) ? val : 0;

const fmt = (val: unknown): string =>
  safeNum(val).toLocaleString();

const formatTimestamp = (ts: string): string => {
  if (!ts) return 'N/A';
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
};

const formatTime = (ts: string): string => {
  if (!ts) return 'N/A';
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return ts;
  }
};

// ================= SALES ROW =================

const SalesRow: React.FC<{ sale: SalesRecord }> = React.memo(({ sale }) => (
  <tr style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
    onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
  >
    <td style={{ padding: '12px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>
      {sale.saleId}
    </td>
    <td style={{ padding: '12px', fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>
      {formatTimestamp(sale.timestamp)}
    </td>
    <td style={{ padding: '12px' }}>
      <span style={{
        padding: '2px 8px',
        borderRadius: '9999px',
        fontSize: '10px',
        fontWeight: 700,
        background: sale.saleType === 'WHOLESALE' ? '#f3e8ff' : '#fff7ed',
        color: sale.saleType === 'WHOLESALE' ? '#7e22ce' : '#c2410c',
      }}>
        {sale.saleType || 'N/A'}
      </span>
    </td>
    <td style={{ padding: '12px', fontSize: '12px', fontWeight: 500, color: '#4b5563' }}>
      {sale.paymentMethod || 'N/A'}
    </td>
    <td style={{ padding: '12px', textAlign: 'right', color: '#ef4444', fontWeight: 600 }}>
      Rs. {fmt(sale.discountAmount)}
    </td>
    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#15803d' }}>
      Rs. {fmt(sale.netAmount)}
    </td>
  </tr>
));

// ================= STAT CARD =================

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, sub, color }) => (
  <div>
    <p style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', color }}>
      {title}
    </p>
    <p style={{ fontWeight: 700, color: '#1f2937', marginTop: '2px' }}>{value}</p>
    {sub && <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{sub}</p>}
  </div>
);

// ================= EMPTY ROW =================

const EmptyRow: React.FC<{ colSpan: number; label: string }> = ({ colSpan, label }) => (
  <tr>
    <td colSpan={colSpan} style={{ padding: '40px', textAlign: 'center', color: '#9ca3af', fontStyle: 'italic' }}>
      {label}
    </td>
  </tr>
);

// ================= DEFAULTS =================

const defaultStock: StockReportData = {
  reportDate: '',
  stockValue: 0,
  totalItemsIn: 0,
  totalItemsOut: 0,
  totalRevenue: 0,
  totalDiscountGiven: 0,
};

const defaultSales: SalesReportData = {
  date: '',
  totalRevenue: 0,
  totalDiscountGiven: 0,
  totalItemsIn: 0,
  totalItemsOut: 0,
};

// ================= MAIN COMPONENT =================

const Report_Overview: React.FC = () => {
  const [type, setType] = useState<ReportType>('DAILY');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stock, setStock] = useState<StockReportData>(defaultStock);
  const [sales, setSales] = useState<SalesReportData>(defaultSales);
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [savedReports, setSavedReports] = useState<SavedStockReport[]>([]);
  const [allSales, setAllSales] = useState<SalesRecord[]>([]);

  // ================= LOAD DATA =================

  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const today = new Date().toLocaleDateString('en-CA');

        let stockRes;
        if (type === 'DAILY') {
          stockRes = await stockApi.getDailyReport(today);
        } else if (type === 'MONTHLY') {
          stockRes = await stockApi.getMonthlyReport(today);
        } else {
          stockRes = await stockApi.getYearlyReport(today);
        }

        const [salesRes, logsRes, reportsRes, allSalesRes] = await Promise.all([
          salesApi.getSalesReport(type, today),
          stockApi.getAllLogs(),
          stockApi.getAllSavedReports(),
          salesApi.getAllSales(),
        ]);

        if (cancelled) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mappedLogs: StockLog[] = (logsRes?.data ?? []).map((log: any) => ({
          logId: safeNum(log.LOG_ID ?? log.logId),
          barcodeId: log.BARCODE_ID ?? log.barcodeId ?? 'N/A',
          quantityChange: safeNum(log.QUANTITY_CHANGE ?? log.quantityChange),
          timestamp: log.TIMESTAMP ?? log.timestamp ?? '',
          updateReason: log.UPDATE_REASON ?? log.updateReason ?? 'UNKNOWN',
          saleType: log.SALE_TYPE ?? log.saleType ?? null,
          currentStock: safeNum(log.CURRENT_STOCK ?? log.currentStock),
        }));

        setStock(stockRes?.data ?? defaultStock);
        setSales(salesRes?.data ?? defaultSales);
        setLogs(mappedLogs);
        setSavedReports(reportsRes?.data ?? []);

        // getAllSales returns SaleRecord[] (from apiService), map to local SalesRecord shape
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rawSales: any[] = allSalesRes?.data ?? [];
        const mappedSales: SalesRecord[] = rawSales.map((s) => ({
          saleId: s.saleId ?? '',
          timestamp: s.timestamp ?? '',
          saleType: s.saleType ?? '',
          netAmount: safeNum(s.netAmount),
          paymentMethod: s.paymentMethod ?? '',
          // API uses discountedApplied; fall back gracefully
          discountAmount: safeNum(s.discountedApplied ?? s.discountAmount),
        }));
        setAllSales(mappedSales);
      } catch (err: unknown) {
        if (!cancelled) {
          console.error('REPORT ERROR:', err);
          const msg = err instanceof Error ? err.message : 'Failed to load report data.';
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();
    return () => { cancelled = true; };
  }, [type]);

  // ================= MEMO =================

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.logId - a.logId),
    [logs]
  );

  const sortedReports = useMemo(
    () => [...savedReports].sort((a, b) => b.reportId - a.reportId),
    [savedReports]
  );

  const filteredSales = useMemo(() => {
    const today = new Date().toLocaleDateString('en-CA');
    const currentMonth = today.slice(0, 7);
    const currentYear = today.slice(0, 4);

    return [...allSales]
      .filter((sale) => {
        if (!sale.timestamp) return false;
        if (type === 'DAILY') return sale.timestamp.startsWith(today);
        if (type === 'MONTHLY') return sale.timestamp.startsWith(currentMonth);
        if (type === 'YEARLY') return sale.timestamp.startsWith(currentYear);
        return true;
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [allSales, type]);

  const chartData = useMemo(() => {
    if (sortedReports.length === 0) {
      return [{
        name: 'Current',
        stockValue: safeNum(stock.stockValue),
        revenue: safeNum(sales.totalRevenue),
        discount: 0,
      }];
    }
    return [...sortedReports]
      .slice(0, 6)
      .reverse()
      .map((r) => ({
        name: r.reportDate,
        stockValue: safeNum(r.stockValue),
        revenue: safeNum(r.totalRevenue),
        discount: safeNum(r.totalDiscountGiven),
      }));
  }, [sortedReports, stock.stockValue, sales.totalRevenue]);

  // ================= LOADING / ERROR =================

  if (loading) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '400px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: '4px solid #3b82f6',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <p style={{ fontWeight: 600, color: '#3b82f6' }}>Loading Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', minHeight: '400px' }}>
        <p style={{ color: '#ef4444', fontWeight: 700, fontSize: '18px' }}>⚠️ Error</p>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>{error}</p>
        <button
          onClick={() => setType((t) => t)}
          style={{ marginTop: '8px', padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
        >
          Retry
        </button>
      </div>
    );
  }

  // ================= SHARED STYLES =================

  const card: React.CSSProperties = {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    border: '1px solid #f1f5f9',
  };

  const thStyle: React.CSSProperties = {
    padding: '12px',
    borderBottom: '1px solid #f1f5f9',
    fontSize: '10px',
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    textAlign: 'left',
    background: '#f8fafc',
  };

  // ================= UI =================

  return (
    <div style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh', display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>
            Report Overview
          </h1>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>
            Viewing {type.toLowerCase()} data
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {(['DAILY', 'MONTHLY', 'YEARLY'] as ReportType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                background: type === t ? '#2563eb' : '#fff',
                color: type === t ? '#fff' : '#4b5563',
                borderColor: type === t ? '#2563eb' : '#e5e7eb',
                boxShadow: type === t ? '0 2px 8px rgba(37,99,235,0.25)' : 'none',
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>

        {/* Stock */}
        <div style={{ ...card, padding: '20px', borderTop: '4px solid #3b82f6' }}>
          <h2 style={{ fontWeight: 700, color: '#2563eb', fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            📦 Stock Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <StatCard title="Stock Value" value={`Rs. ${fmt(stock.stockValue)}`} color="#3b82f6" />
            <StatCard title="Items In" value={`+${safeNum(stock.totalItemsIn)}`} color="#22c55e" />
            <StatCard title="Items Out" value={`-${safeNum(stock.totalItemsOut)}`} color="#f87171" />
          </div>
        </div>

        {/* Sales */}
        <div style={{ ...card, padding: '20px', borderTop: '4px solid #22c55e' }}>
          <h2 style={{ fontWeight: 700, color: '#16a34a', fontSize: '15px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            💰 Sales Summary
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            <StatCard title="Revenue" value={`Rs. ${fmt(sales.totalRevenue)}`} color="#22c55e" />
            <StatCard title="Sold Qty" value={String(safeNum(sales.totalItemsOut))} color="#9ca3af" />
            <StatCard title="Discount" value={`Rs. ${fmt(sales.totalDiscountGiven)}`} color="#f97316" />
          </div>
        </div>
      </div>

      {/* CHART */}
      <div style={{ ...card, padding: '20px' }}>
        <h2 style={{ fontWeight: 900, color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
          Stock Value vs Revenue (Last {chartData.length} Reports)
        </h2>
        <div style={{ height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
  contentStyle={{ 
    borderRadius: '8px', 
    border: 'none', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
    fontSize: '12px' 
  }}
  // Explicitly typing 'value' as any or number, and returning the tuple
  formatter={(value: any) => [`Rs. ${Number(value).toLocaleString()}`]}
/>
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="stockValue" name="Stock Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="discount" name="Discount" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* HISTORICAL REPORTS */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 700, color: '#4f46e5', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            📊 Historical Reports
          </h2>
          <span style={{ fontSize: '11px', background: '#eef2ff', color: '#4f46e5', padding: '4px 12px', borderRadius: '9999px', fontWeight: 700, border: '1px solid #e0e7ff' }}>
            {sortedReports.length} Reports
          </span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                {['ID', 'Generated At', 'Report Date', 'Type', 'Stock Value', 'Sold Value', 'Revenue', 'Discount', 'In', 'Out'].map((h) => (
                  <th key={h} style={{ ...thStyle, textAlign: ['In', 'Out'].includes(h) ? 'center' : h === 'ID' ? 'left' : 'right' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedReports.length > 0 ? sortedReports.map((report) => (
                <tr key={report.reportId}
                  style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px', fontWeight: 700, color: '#9ca3af', fontSize: '12px' }}>#{report.reportId}</td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{report.generatedAt}</td>
                  <td style={{ padding: '12px', fontWeight: 600, color: '#374151' }}>{report.reportDate}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '10px', fontWeight: 700, background: '#eef2ff', color: '#4f46e5', border: '1px solid #e0e7ff' }}>
                      {report.reportType}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#2563eb' }}>Rs. {fmt(report.stockValue)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#6b7280' }}>Rs. {fmt(report.soldItemsValue)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: '#16a34a' }}>Rs. {fmt(report.totalRevenue)}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: '#f97316' }}>Rs. {fmt(report.totalDiscountGiven)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#16a34a' }}>+{safeNum(report.totalItemsIn)}</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: 700, color: '#ef4444' }}>-{safeNum(report.totalItemsOut)}</td>
                </tr>
              )) : <EmptyRow colSpan={10} label="No Historical Reports Found" />}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK LOGS */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 700, color: '#7c3aed', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            📋 Stock Logs
          </h2>
          <span style={{ fontSize: '11px', background: '#f5f3ff', color: '#7c3aed', padding: '4px 12px', borderRadius: '9999px', fontWeight: 700, border: '1px solid #ede9fe' }}>
            {sortedLogs.length} Entries
          </span>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                {['Barcode', 'Change', 'Stock', 'Type', 'Reason', 'Time'].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedLogs.length > 0 ? sortedLogs.map((log) => (
                <tr key={log.logId}
                  style={{ borderBottom: '1px solid #f8fafc', transition: 'background 0.15s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#2563eb', fontWeight: 600 }}>{log.barcodeId}</td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: log.quantityChange < 0 ? '#ef4444' : '#16a34a' }}>
                    {log.quantityChange > 0 ? `+${log.quantityChange}` : log.quantityChange}
                  </td>
                  <td style={{ padding: '8px 12px', fontWeight: 700, color: '#374151' }}>{log.currentStock}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{
                      padding: '2px 6px', borderRadius: '9999px', fontSize: '9px', fontWeight: 700,
                      background: log.saleType === 'WHOLESALE' ? '#fef3c7' : log.saleType === 'RETAIL' ? '#eff6ff' : '#f3f4f6',
                      color: log.saleType === 'WHOLESALE' ? '#d97706' : log.saleType === 'RETAIL' ? '#2563eb' : '#9ca3af',
                      border: `1px solid ${log.saleType === 'WHOLESALE' ? '#fde68a' : log.saleType === 'RETAIL' ? '#bfdbfe' : '#e5e7eb'}`,
                    }}>
                      {log.saleType ?? 'N/A'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px', textTransform: 'uppercase', fontWeight: 700, color: '#9ca3af', fontSize: '10px' }}>{log.updateReason}</td>
                  <td style={{ padding: '8px 12px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{formatTime(log.timestamp)}</td>
                </tr>
              )) : <EmptyRow colSpan={6} label="No Stock Logs Found" />}
            </tbody>
          </table>
        </div>
      </div>

      {/* SALES HISTORY */}
      <div style={{ ...card, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontWeight: 700, color: '#374151', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            📜 Sales History
          </h2>
          <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '9999px', fontWeight: 700, border: '1px solid #dcfce7' }}>
            {filteredSales.length} Transactions
          </span>
        </div>
        <div style={{ maxHeight: '450px', overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                {['Sale ID', 'Date & Time', 'Type', 'Method', 'Discount', 'Net Total'].map((h, i) => (
                  <th key={h} style={{ ...thStyle, textAlign: i >= 4 ? 'right' : 'left' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0
                ? filteredSales.map((sale) => <SalesRow key={sale.saleId} sale={sale} />)
                : <EmptyRow colSpan={6} label="No Sales Found for This Period" />}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default Report_Overview;