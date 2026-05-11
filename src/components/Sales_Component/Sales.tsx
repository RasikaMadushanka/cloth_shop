import React, { useState, useEffect, useCallback } from 'react';
import './sales.css';
import { salesApi, productApi } from '../api/Service/apiService';

interface SaleItem {
  barcodeId: string;
  productName: string;
  quantity: number;
  unitPrice: number; 
  retailPrice: number; 
  wholesalePrice: number; 
  priceType: 'RETAIL' | 'WHOLESALE';
}

const Sales: React.FC = () => {
  const [saleType, setSaleType] = useState<'RETAIL' | 'WHOLESALE'>('RETAIL');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [adminId, setAdminId] = useState<number>(1);
  const [buffer, setBuffer] = useState<string>('');
  const [manualSearch, setManualSearch] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<number>(0);

  const [editingId, setEditingId] = useState<string | null>(null);

  const playSuccessBeep = useCallback(() => {
    const audio = new Audio(
      'https://assets.mixkit.co/active_storage/sfx/270/270-preview.mp3'
    );
    audio.play().catch(() => { });
  }, []);

  const processBarcode = useCallback(async (barcode: string) => {
    const cleanInput = String(barcode).trim();
    if (!cleanInput) return;

    try {
      const response = await productApi.getAll();
      const products = response.data;

      let foundProduct: any = null;
      let foundVariant: any = null;

      for (const product of products) {
        const variant = product.variants?.find((v: any) => String(v.barcodeId).trim() === cleanInput);
        if (variant) {
          foundProduct = product;
          foundVariant = variant;
          break;
        }
      }

      if (!foundVariant) {
        alert(`Product not found`);
        return;
      }

      playSuccessBeep();

      setItems(prev => {
        const existingItem = prev.find(i => i.barcodeId === foundVariant.barcodeId);
        const newQty = existingItem ? existingItem.quantity + 1 : 1;

        // AUTO-SWITCH LOGIC: 6 or more = Wholesale
        const isWholesale = newQty >= 6;
        const priceToUse = isWholesale
          ? (foundProduct.wholesalePrice || 0)
          : (foundProduct.retailPrice || 0);

        if (existingItem) {
          return prev.map(i =>
            i.barcodeId === foundVariant.barcodeId
              ? { ...i, quantity: newQty, unitPrice: priceToUse, priceType: isWholesale ? 'WHOLESALE' : 'RETAIL' }
              : i
          );
        }

        return [...prev, {
          barcodeId: foundVariant.barcodeId,
          productName: foundProduct.productName,
          quantity: 1,
          unitPrice: priceToUse,
          priceType: isWholesale ? 'WHOLESALE' : 'RETAIL'
        }];
      });
      setManualSearch('');
    } catch (err) {
      console.error(err);
    }
  }, [playSuccessBeep]);

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

  const subTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const discountAmount = subTotal * (discount / 100);
  const finalTotal = subTotal - discountAmount;

  // ✅ NEW (balance calculation)
  const balance = cashReceived - finalTotal;

  const removeItem = (barcodeId: string) => {
    setItems(prev => prev.filter(i => i.barcodeId !== barcodeId));
  };

  const updateQuantity = (barcodeId: string, qty: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.barcodeId === barcodeId) {
          // Here we assume you've added wholesale/retail prices to the item object
          // If not, you'll need to fetch product data here.
          const isWholesale = qty >= 6;
          // This is a placeholder logic—ensure you have access to the actual rates
          return { ...item, quantity: qty, priceType: isWholesale ? 'WHOLESALE' : 'RETAIL' };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscount(0);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return alert("Cart is empty!");
    if (!adminId) return alert("Enter Admin ID");

    const orderPayload = {
      adminId: adminId,
      paymentMethod,
      discountPercentage: discount,
      items: items.map(i => ({
        barcodeId: i.barcodeId,
        quantity: i.quantity,
        unitPrice: i.unitPrice
      }))
    };

    if (cashReceived < finalTotal) {
      alert("Insufficient cash!");
      return;
    }

    try {
      await salesApi.placeOrder(orderPayload);
      alert(" Order Placed Successfully!");
      clearCart();
    } catch {
      alert(" Transaction Failed");
    }
  };

  const printFinalBill = () => {
    const shopName = "ASIKA FASHION STORE";
    const contactNumber = "+94 77 123 4567";
    const dateTime = new Date().toLocaleString();

    if (items.length === 0) {
      alert("No items in cart");
      return;
    }

    let itemList = "";

    items.forEach((item) => {
      // AUTO-DETECT TYPE: If qty >= 6, it's Wholesale
      const typeLabel = item.quantity >= 6 ? "[WHOLESALE]" : "[RETAIL]";

      itemList += `
${item.productName} ${typeLabel}
Barcode: ${item.barcodeId}
Qty: ${item.quantity} x LKR ${item.unitPrice.toFixed(2)}
Total: LKR ${(item.quantity * item.unitPrice).toFixed(2)}
-----------------------------`;
    });

    const width = 29;

    const bill = `
${"=".repeat(width)}
| ${shopName.padEnd(width - 4)} |
${"=".repeat(width)}
Contact: ${contactNumber}
Date: ${dateTime}
${"=".repeat(width)}

${itemList}

${"-".repeat(width)}
SUB TOTAL : LKR ${subTotal.toFixed(2)}
DISCOUNT  : LKR ${discountAmount.toFixed(2)}
NET TOTAL : LKR ${finalTotal.toFixed(2)}
${"-".repeat(width)}
PAYMENT   : ${paymentMethod}
CASH      : LKR ${cashReceived.toFixed(2)}
BALANCE   : LKR ${balance.toFixed(2)}
${"-".repeat(width)}

${"=".repeat(width)}
    THANK YOU COME AGAIN!
${"=".repeat(width)}
`;

    const win = window.open('', '', 'width=400,height=600');

    if (win) {
      win.document.write(`
        <html>
        <head>
          <title>Bill - ${shopName}</title>
          <style>
            body {
              font-family: 'Courier New', Courier, monospace;
              padding: 10px;
              white-space: pre;
              font-size: 12px;
              color: #000;
            }
            pre {
                margin: 0;
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
                <th>ACTION</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.barcodeId}</td>
                  <td>{item.productName}</td>
                  {/* Inside the items.map in the table */}
                  <td>
                    LKR {item.unitPrice}
                    <small style={{
                      color: item.quantity >= 6 ? '#f59e0b' : '#94a3b8',
                      display: 'block',
                      fontSize: '10px'
                    }}>
                      {item.quantity >= 6 ? 'WHOLESALE' : 'RETAIL'}
                    </small>
                  </td>

                  <td>
                    {editingId === item.barcodeId ? (
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.barcodeId, Math.max(1, Number(e.target.value)))
                        }
                        onBlur={() => setEditingId(null)}
                        autoFocus
                        style={{ width: "60px" }}
                      />
                    ) : (
                      <span onClick={() => setEditingId(item.barcodeId)}>
                        {item.quantity}
                      </span>
                    )}
                  </td>

                  <td>LKR {item.unitPrice * item.quantity}</td>

                  <td>
                    <button
                      onClick={() => removeItem(item.barcodeId)}
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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

          {/*  NEW CASH INPUT */}
          <div style={{ marginBottom: "10px" }}>
            <label>Cash Received</label>
            <input
              type="number"
              value={cashReceived}
              onChange={(e) => setCashReceived(Number(e.target.value))}
              style={{ width: "100%", padding: "5px" }}
            />
          </div>

          <h3>Subtotal: LKR {subTotal.toLocaleString()}</h3>
          <h4>Discount: - LKR {discountAmount.toLocaleString()}</h4>
          <h4>Balance: LKR {balance.toLocaleString()}</h4>

          <h2>Total Payable: LKR {finalTotal.toLocaleString()}</h2>

          <button className="checkout-btn" onClick={handleCheckout}>
            PROCESS PAYMENT
          </button>

          <button
            onClick={clearCart}
            style={{
              width: "100%",
              marginTop: "10px",
              background: "#ef4444",
              color: "white",
              padding: "10px",
              border: "none",
              borderRadius: "8px"
            }}
          >
            CLEAR CART
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
              fontWeight: "700"
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