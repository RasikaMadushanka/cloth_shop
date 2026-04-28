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
  const [adminId, setAdminId] = useState<number>(1); // ✅ NEW
  const [buffer, setBuffer] = useState<string>('');
  const [manualSearch, setManualSearch] = useState<string>('');

  // 🔊 Beep sound
  const playSuccessBeep = useCallback(() => {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/700/700-preview.mp3');
    audio.play().catch(() => { });
  }, []);

  // ✅ Barcode processing (variant-based)
  const processBarcode = useCallback(async (barcode: string) => {
    const cleanInput = String(barcode).trim();
    if (!cleanInput) return;

    try {
      const response = await productApi.getAll();
      const products = response.data;

      let foundProduct: any = null;
      let foundVariant: any = null;

      for (const product of products) {
        if (product.variants && Array.isArray(product.variants)) {
          const variant = product.variants.find((v: any) =>
            String(v.barcodeId).trim() === cleanInput
          );

          if (variant) {
            foundProduct = product;
            foundVariant = variant;
            break;
          }
        }
      }

      if (!foundVariant) {
        alert(`❌ Product with barcode [${cleanInput}] not found`);
        return;
      }

      playSuccessBeep();

      const finalBarcode = foundVariant.barcodeId;
      const finalPrice =
        foundVariant.priceOverride ?? foundProduct.basePrice ?? 0;

      setItems(prev => {
        const exists = prev.find(i => i.barcodeId === finalBarcode);

        if (exists) {
          return prev.map(i =>
            i.barcodeId === finalBarcode
              ? { ...i, quantity: i.quantity + 1 }
              : i
          );
        }

        return [
          ...prev,
          {
            barcodeId: finalBarcode,
            productName: foundProduct.productName || "Product",
            quantity: 1,
            unitPrice: finalPrice
          }
        ];
      });

      setManualSearch('');
    } catch (err) {
      console.error(err);
      alert("❌ Database error");
    }
  }, [playSuccessBeep]);

  // ⌨️ Scanner listener
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

  // 💰 Calculations
  const subTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const discountAmount = subTotal * (discount / 100);
  const finalTotal = subTotal - discountAmount;

  // 🧾 Checkout
  const handleCheckout = async () => {
    if (items.length === 0) return alert("Cart is empty!");
    if (!adminId) return alert("Enter Admin ID");

    const orderPayload = {
      adminId: adminId, // ✅ uses input
      paymentMethod,
      discountPercentage: discount,
      items: items.map(i => ({
        barcodeId: i.barcodeId,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    };

    try {
      await salesApi.placeOrder(orderPayload);
      alert("✅ Order Placed Successfully!");
      setItems([]);
      setDiscount(0);
    } catch {
      alert("❌ Transaction Failed");
    }
  };
  const printFinalBill = () => {
    const shopName = "ASIKA FASHION STORE";
    const contactNumber = "+94 77 123 4567"; // change your shop number
    const dateTime = new Date().toLocaleString();

    if (items.length === 0) {
      alert("No items in cart");
      return;
    }

    let itemList = "";

    items.forEach((item) => {
      itemList += `
${item.productName}
Barcode: ${item.barcodeId}
Qty: ${item.quantity} x LKR ${item.unitPrice} = LKR ${item.quantity * item.unitPrice}
-----------------------------
`;
    });

    const bill = `
=============================
      ${shopName}
=============================
Contact: ${contactNumber}
Date/Time: ${dateTime}
=============================

${itemList}

-----------------------------
SUB TOTAL : LKR ${subTotal.toFixed(2)}
DISCOUNT  : LKR ${discountAmount.toFixed(2)}
-----------------------------
TOTAL PAY : LKR ${finalTotal.toFixed(2)}

=============================
   THANK YOU COME AGAIN!
=============================
`;

    const win = window.open('', '', 'width=400,height=600');

    if (win) {
      win.document.write(`
            <html>
            <head>
                <title>Bill</title>
                <style>
                    body {
                        font-family: monospace;
                        padding: 20px;
                        white-space: pre;
                    }
                </style>
            </head>
            <body onload="window.print(); window.close();">
                <pre>${bill}</pre>
            </body>
            </html>
        `);

      win.document.close();
    }
  };

  return (
    <div className="sales-page-container">
      <div className="sales-header">
        <h1>POS Terminal</h1>

        {/* ✅ ADMIN ID INPUT */}
        <div style={{ marginBottom: "10px" }}>
          <label>Admin ID</label>
          <input
            type="number"
            value={adminId}
            onChange={(e) => setAdminId(Number(e.target.value))}
            style={{ marginLeft: "10px", width: "100px" }}
          />
        </div>

        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Scan or type barcode..."
            value={manualSearch}
            onChange={(e) => setManualSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') processBarcode(manualSearch);
            }}
          />
          <button onClick={() => processBarcode(manualSearch)}>
            Add Item
          </button>
        </div>

        <div className="scan-status">
          {buffer ? `Scanning: ${buffer}` : "🟢 System Ready"}
        </div>
      </div>

      <div className="pos-main-layout">
        {/* 🛒 CART */}
        <div className="cart-container">
          <h3>Current Basket ({items.length} items)</h3>

          <table className="sales-table">
            <thead>
              <tr>
                <th>BARCODE</th>
                <th>PRODUCT</th>
                <th>PRICE</th>
                <th>QTY</th>
                <th>TOTAL</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.barcodeId}</td>
                  <td>{item.productName}</td>
                  <td>LKR {item.unitPrice}</td>

                  {/* ✅ QTY INPUT */}
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const qty = Math.max(1, Number(e.target.value));
                        setItems(prev =>
                          prev.map(i =>
                            i.barcodeId === item.barcodeId
                              ? { ...i, quantity: qty }
                              : i
                          )
                        );
                      }}
                      style={{ width: "60px" }}
                    />
                  </td>

                  <td>LKR {item.unitPrice * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 💳 SUMMARY */}
        <div className="summary-card">
          <div style={{ marginBottom: "10px" }}>
            <label>Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              style={{ width: "100%", padding: "5px" }}
            />
          </div>

          <h3>Subtotal: LKR {subTotal.toLocaleString()}</h3>
          <h4>Discount: - LKR {discountAmount.toLocaleString()}</h4>
          <h2>Total Payable: LKR {finalTotal.toLocaleString()}</h2>

          <button className="checkout-btn" onClick={handleCheckout}>
            PROCESS PAYMENT
          </button>
          <button
            onClick={printFinalBill}
            style={{
              width: "100%",
              marginTop: "10px",
              background: "#3b82f6",
              color: "white",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            PRINT FINAL BILL
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sales;