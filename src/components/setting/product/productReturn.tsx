import { useState, type ChangeEvent } from 'react';
import { salesApi, type SaleRecord } from '../../api/Service/apiService';

const ProductReturn: React.FC = () => {
    const [barcode, setBarcode] = useState<string>('');
    const [salesFound, setSalesFound] = useState<SaleRecord[]>([]);
    const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [returnQty, setReturnQty] = useState<number>(1);

    // Helper to format date for better readability
    const formatDateTime = (dateTimeStr: string) => {
        const date = new Date(dateTimeStr);
        return {
            date: date.toLocaleDateString('en-GB'), // e.g., 13/05/2026
            time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) // e.g., 09:30
        };
    };

    const handleSearch = async () => {
        if (!barcode.trim()) return;
        setLoading(true);
        try {
            const response = await salesApi.findSalesByBarcode(barcode);
            setSalesFound(response.data);
            setSelectedSale(null);
            setReturnQty(1);
        } catch (error) {
            console.error('Search error:', error);
            alert('No sales records found for this barcode.');
            setSalesFound([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSearch();
    };

    // This matches your @PostMapping("/process-return") in SaleController.java
    const handleConfirmReturn = async () => {
        if (!selectedSale || !barcode) return;

        // 1. Validation: Ensure the item exists in the selected sale
        const itemInSale = selectedSale.items.find(item => item.barcodeId === barcode);
        if (!itemInSale) return;

        // 2. Validation: Prevent returning more than what was bought
        if (returnQty > itemInSale.quantity || returnQty <= 0) {
            alert(`Max available: ${itemInSale.quantity}`);
            return;
        }

        if (window.confirm(`Return ${returnQty} unit(s)?`)) {
            setLoading(true);
            try {
                // 3. API Call: Sends { saleId, barcodeId, quantity }
                await salesApi.processReturn({
                    saleId: selectedSale.saleId,
                    barcodeId: barcode,
                    quantity: returnQty,
                });

                alert('Return successful.');
                // 4. State Reset: Clears UI after success
                setBarcode('');
                setSalesFound([]);
                setSelectedSale(null);
            } catch (error) {
                alert('Failed to process return. Please check backend logs.');
            } finally {
                setLoading(false);
            }
        }
    };
    const card: React.CSSProperties = {
        background: '#fff',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    };

    return (
        <div style={{ padding: '24px', maxWidth: '950px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <header style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: 800 }}>Identify Bill & Return</h2>
                <p style={{ color: '#6b7280' }}>Select the specific transaction time from the list below.</p>
            </header>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '32px' }}>
                <input
                    value={barcode}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setBarcode(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Scan barcode..."
                    style={{ flex: 1, padding: '12px', border: '2px solid #e5e7eb', borderRadius: '10px' }}
                />
                <button onClick={handleSearch} disabled={loading} style={{ background: '#111827', color: '#fff', padding: '12px 24px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                    {loading ? 'Searching...' : 'Find Sales'}
                </button>
            </div>

            {/* RESULTS TABLE WITH TIME IDENTIFICATION */}
            {salesFound.length > 0 && !selectedSale && (
                <div style={card}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f9fafb', textAlign: 'left' }}>
                            <tr>
                                <th style={{ padding: '16px 12px' }}>Sale Time & Date</th>
                                <th style={{ padding: '16px 12px' }}>Sale ID</th>
                                <th style={{ padding: '16px 12px' }}>Sales Person</th>
                                <th style={{ padding: '16px 12px' }}>Amount</th>
                                <th style={{ padding: '16px 12px' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {salesFound.map((sale) => {
                                const { date, time } = formatDateTime(sale.timestamp);
                                return (
                                    <tr key={sale.saleId} style={{ borderTop: '1px solid #eee' }}>
                                        <td style={{ padding: '16px 12px' }}>
                                            <div style={{ fontWeight: 700, color: '#111827' }}>{time}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{date}</div>
                                        </td>
                                        <td style={{ padding: '16px 12px', fontFamily: 'monospace', fontSize: '13px' }}>
                                            {sale.saleId}
                                        </td>
                                        <td style={{ padding: '16px 12px' }}>{sale.salesPersonName}</td>
                                        <td style={{ padding: '16px 12px', fontWeight: 600 }}>Rs. {sale.netAmount?.toFixed(2)}</td>
                                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedSale(sale)}
                                                style={{ padding: '8px 16px', borderRadius: '6px', background: '#eff6ff', color: '#2563eb', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Open Bill
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* BILL DETAIL VIEW */}
            {selectedSale && (
                <div style={{ ...card, padding: '24px', marginTop: 20, borderTop: '4px solid #2563eb' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                        <button onClick={() => setSelectedSale(null)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>← Back to results</button>
                        <span style={{ color: '#6b7280', fontSize: '14px' }}>Transaction Date: <b>{selectedSale.timestamp}</b></span>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Bill Summary</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                            <div><b>ID:</b> {selectedSale.saleId}</div>
                            <div><b>Person:</b> {selectedSale.salesPersonName}</div>
                            <div><b>Method:</b> {selectedSale.paymentMethod}</div>
                            <div><b>Net Total:</b> Rs. {selectedSale.netAmount?.toFixed(2)}</div>
                        </div>
                    </div>

                    <h4 style={{ borderBottom: '2px solid #f3f4f6', paddingBottom: 8 }}>Restock Item</h4>
                    {selectedSale.items
                        .filter(item => item.barcodeId === barcode)
                        .map((item, i) => (
                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                                <div>
                                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{item.itemName}</div>
                                    <div style={{ fontSize: '13px', color: '#6b7280' }}>Purchased Qty: {item.quantity}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>Return Amount</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max={item.quantity}
                                        value={returnQty}
                                        onChange={(e) => setReturnQty(parseInt(e.target.value) || 1)}
                                        style={{ width: '70px', padding: '8px', textAlign: 'center', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    />
                                </div>
                            </div>
                        ))}

                    <button
                        onClick={handleConfirmReturn}
                        disabled={loading}
                        style={{
                            // ... your existing styles
                            background: loading ? '#9ca3af' : '#111827',
                        }}
                    >
                        {loading ? 'Processing...' : `Return ${returnQty} unit(s) for Bill ${selectedSale.saleId}`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default ProductReturn;