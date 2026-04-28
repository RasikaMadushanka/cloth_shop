import React, { useState, useEffect, useCallback } from 'react';
import './sales.css';
import { salesApi, productApi } from '../api/Service/apiService';

interface SaleItem {
    barcodeId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

const Sales: React.FC = () => {
    const [items, setItems] = useState<SaleItem[]>([]);
    const [discount, setDiscount] = useState<number>(0);
    const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
    const [buffer, setBuffer] = useState<string>('');
    const [manualSearch, setManualSearch] = useState<string>('');

    const playSuccessBeep = useCallback(() => {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/700/700-preview.mp3');
        audio.play().catch(() => {});
    }, []);

    const processBarcode = useCallback(async (barcode: string) => {
        const cleanInput = String(barcode).trim();
        if (!cleanInput) return;

        try {
            // Fetch all products from your ProductController
            const response = await productApi.getAll();
            const databaseItems = response.data;

            // FIX: Match against 'id' or 'barcode' fields found in your console log
            const product = databaseItems.find((p: any) => 
                (p.id && String(p.id).trim() === cleanInput) || 
                (p.barcode && String(p.barcode).trim() === cleanInput) ||
                (p.barcodeId && String(p.barcodeId).trim() === cleanInput)
            );

            if (product) {
                playSuccessBeep();
                
                // MAP: Database 'basePrice' (from log) to Frontend 'unitPrice'
                const finalBarcode = String(product.barcode || product.id || product.barcodeId);
                const finalPrice = product.basePrice || product.price || 0;

                setItems(prev => {
                    const exists = prev.find(i => i.barcodeId === finalBarcode);
                    
                    if (exists) {
                        return prev.map(i => i.barcodeId === finalBarcode 
                            ? { ...i, quantity: i.quantity + 1 } : i);
                    }

                    return [...prev, { 
                        barcodeId: finalBarcode, 
                        productName: product.productName || "Product", 
                        quantity: 1, 
                        unitPrice: finalPrice 
                    }];
                });
                setManualSearch(''); 
            } else {
                alert(`Product with barcode [${cleanInput}] not found in Database.`);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            alert("Database connection error");
        }
    }, [playSuccessBeep]);

    // --- KEYBOARD LISTENER ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;

            if (e.key === 'Enter') {
                if (buffer.length >= 3) processBarcode(buffer);
                setBuffer('');
                return;
            }
            if (buffer.length > 25) setBuffer('');
            if (e.key.length === 1) setBuffer(prev => prev + e.key);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [buffer, processBarcode]);

    const subTotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const finalTotal = subTotal - (subTotal * (discount / 100));

    const handleCheckout = async () => {
        if (items.length === 0) return alert("Cart is empty!");

        // This Payload matches your Spring Boot SalesDto
        const orderPayload = {
            adminId: 1, 
            paymentMethod: paymentMethod,
            discountPercentage: discount,
            items: items.map(i => ({
                barcodeId: i.barcodeId,
                quantity: i.quantity,
                unitPrice: i.unitPrice
            }))
        };

        try {
            // Hits @PostMapping("/place-order") in your SaleController
            await salesApi.placeOrder(orderPayload);
            alert("✅ Order Placed Successfully!");
            setItems([]);
            setDiscount(0);
        } catch (error) {
            alert("❌ Transaction Failed");
        }
    };

    return (
        <div className="sales-page-container">
            <div className="sales-header">
                <h1>POS Terminal</h1>
                <div className="search-bar-container">
                    <input 
                        type="text" 
                        className="manual-search-input"
                        placeholder="Scan or type barcode..."
                        value={manualSearch}
                        onChange={(e) => setManualSearch(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') processBarcode(manualSearch); }}
                    />
                    <button className="search-btn" onClick={() => processBarcode(manualSearch)}>Add Item</button>
                </div>
                <div className="scan-status">{buffer.length > 0 ? `Scanning: ${buffer}` : "🟢 System Ready"}</div>
            </div>

            <div className="pos-main-layout">
                <div className="cart-container">
                    <h3>Current Basket ({items.length} items)</h3>
                    <table className="sales-table">
                        <thead>
                            <tr><th>BARCODE</th><th>PRODUCT</th><th>PRICE</th><th>QTY</th><th>TOTAL</th></tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx}>
                                    <td>{item.barcodeId}</td>
                                    <td>{item.productName}</td>
                                    <td>LKR {item.unitPrice}</td>
                                    <td>{item.quantity}</td>
                                    <td>LKR {item.unitPrice * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="summary-card">
                    <h3>Total Payable: LKR {finalTotal.toLocaleString()}</h3>
                    <button className="checkout-btn" onClick={handleCheckout}>PROCESS PAYMENT</button>
                </div>
            </div>
        </div>
    );
};

export default Sales;