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
  const [adminId, setAdminId] = useState<number>(() => {
    const savedUser = localStorage.getItem('user'); // Adjust key name to match your login logic
    if (savedUser) {
      try {
        const userObj = JSON.parse(savedUser);
        return Number(userObj.adminId || userObj.id);
      } catch (e) {
        console.error("Failed to parse user data", e);
      }
    }
    return 1; // Fallback only if no one is logged in
  });
  const [buffer, setBuffer] = useState<string>('');
  const [manualSearch, setManualSearch] = useState<string>('');
  const [cashReceived, setCashReceived] = useState<number>(0);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [lastSaleId, setLastSavedSaleId] = useState<string>('');
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

    // FIND PRODUCT
    for (const product of products) {
      const variant = product.variants?.find(
        (v: any) => String(v.barcodeId).trim() === cleanInput
      );

      if (variant) {
        foundProduct = product;
        foundVariant = variant;
        break;
      }
    }

    // PRODUCT NOT FOUND
    if (!foundVariant) {
      alert("Product not found");
      return;
    }

    playSuccessBeep();

    setItems(prev => {
      // FORCE BARCODE AS STRING
      const barcodeText = String(foundVariant.barcodeId);

      // CHECK EXISTING ITEM
      const existingItem = prev.find(
        item => item.barcodeId === barcodeText
      );

      // NEW QUANTITY
      const newQty = existingItem
        ? existingItem.quantity + 1
        : 1;

      // WHOLESALE CHECK
      const isWholesale = newQty >= 6;

      // PRICES
      const retailRate = Number(foundProduct.retailPrice || 0);
      const wholesaleRate = Number(foundProduct.wholesalePrice || 0);

      // FINAL PRICE
      const priceToUse = isWholesale
        ? wholesaleRate
        : retailRate;

      // AUTO SALE TYPE
      if (isWholesale && saleType !== 'WHOLESALE') {
        setSaleType('WHOLESALE');
      }

      // UPDATE EXISTING ITEM
      if (existingItem) {
        return prev.map(item =>
          item.barcodeId === barcodeText
            ? {
                ...item,
                quantity: newQty,
                unitPrice: priceToUse,
                priceType: isWholesale
                  ? 'WHOLESALE'
                  : 'RETAIL'
              }
            : item
        );
      }

      // ADD NEW ITEM
      return [
        ...prev,
        {
          barcodeId: barcodeText,
          productName: foundProduct.productName,
          quantity: 1,
          unitPrice: priceToUse,
          retailPrice: retailRate,
          wholesalePrice: wholesaleRate,
          priceType: isWholesale
            ? 'WHOLESALE'
            : 'RETAIL'
        }
      ];
    });

    setManualSearch('');

  } catch (err) {
    console.error("Barcode Processing Error:", err);
    alert("Failed to process barcode");
  }
}, [playSuccessBeep, saleType]);

  useEffect(() => {
    const syncUser = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        setAdminId(Number(userObj.adminId || userObj.id));
      }
    };

    window.addEventListener('storage', syncUser); // Listens for login/logout in other tabs
    return () => window.removeEventListener('storage', syncUser);
  }, [buffer, processBarcode]);

  const subTotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const discountAmount = subTotal * (discount / 100);
  const finalTotal = subTotal - discountAmount;

  const balance = cashReceived - finalTotal;

  const removeItem = (barcodeId: string) => {
    setItems(prev => prev.filter(i => i.barcodeId !== barcodeId));
  };

const updateQuantity = (barcodeId: string, qty: number) => {
  setItems(prev => prev.map(item => {
    if (item.barcodeId !== barcodeId) return item;

    const isWholesale = qty >= 6;
    return {
      ...item,
      quantity: qty,
      unitPrice: isWholesale ? item.wholesalePrice : item.retailPrice,
      priceType: isWholesale ? 'WHOLESALE' : 'RETAIL'
    };
  }));
};
  const clearCart = () => {
    setItems([]);
    setDiscount(0);
  };

const handleCheckout = async () => {
  // 1. Validation
  if (items.length === 0) return alert("Cart is empty!");
  if (cashReceived < finalTotal) {
    return alert(`Insufficient cash! LKR ${(finalTotal - cashReceived).toFixed(2)} more required.`);
  }

  // 2. Pre-open window (Prevents Pop-up Blocker)
  const printWindow = window.open('', '_blank', 'width=450,height=900');
  if (printWindow) {
    printWindow.document.write(`
      <html><body style="font-family:sans-serif; text-align:center; padding-top:50px;">
        <h2>Processing Sale...</h2>
        <p>Please wait while we generate your receipt.</p>
      </body></html>
    `);
  }

  try {
    // 3. API Call
    const payload = {
      adminId,
      saleType: items.some(i => i.quantity >= 6) ? 'WHOLESALE' : 'RETAIL',
      paymentMethod,
      discountPercentage: Number(discount),
      items: items.map(i => ({
        barcodeId: i.barcodeId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        totalPrice: i.quantity * i.unitPrice,
        itemName: i.productName
      }))
    };

    const response = await salesApi.placeOrder(payload);
    
    // 4. Robust ID Extraction
    // Checks for saleId, id, _id, or if the response itself is the string ID
    const generatedId = response.data?.saleId || response.data?.id || 
                        response.data?._id || (typeof response.data === 'string' ? response.data : null);

    if (!generatedId) {
      throw new Error("Server confirmed order but did not return a Sale ID.");
    }

    // 5. Success Flow
    setLastSavedSaleId(String(generatedId));
    
    // Pass current data directly to print to avoid "empty cart" race conditions
    executePrint(String(generatedId), printWindow, [...items], finalTotal, cashReceived, balance);
    
    alert("Order Successful!");
    clearCart();
    setCashReceived(0);

  } catch (error: any) {
    console.error("Checkout Error:", error);
    if (printWindow) printWindow.close();
    
    const errorMsg = error.response?.data?.message || error.message || "Transaction Failed";
    alert(errorMsg);
  }
};
const executePrint = (saleId: string, win: Window | null, printItems: SaleItem[], total: number, cash: number, bal: number) => {
  if (!win) return;

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const staff = (user.fullName || user.username || "Staff").toUpperCase();
  
  const isWholesaleBill = printItems.some(i => i.quantity >= 6);
  const billMode = isWholesaleBill ? "WHOLESALE BILL" : "RETAIL BILL";

  // Generate rows with item-specific barcodes
  const rows = printItems.map(item => `
    <div style="margin-bottom: 12px; border-bottom: 1px dashed #ccc; padding-bottom: 8px;">
      <div style="font-weight:bold; font-size:13px;">${item.productName.toUpperCase()}</div>
      
      <!-- Item Barcode Image -->
      <div style="margin: 5px 0;">
        <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${String(item.barcodeId)}&scale=1&height=10&includetext=false" 
             style="height: 30px; width: auto;" />
        <div style="font-size:9px; color: #555;">ID: ${String(item.barcodeId)}</div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:12px;">
        <span>${item.quantity} x ${item.unitPrice.toFixed(2)} ${item.quantity >= 6 ? '(WS)' : '(RT)'}</span>
        <span>LKR ${(item.quantity * item.unitPrice).toFixed(2)}</span>
      </div>
    </div>
  `).join('');

  win.document.open();
  win.document.write(`
    <html>
      <head>
        <title>Receipt - ${saleId}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 10px; color: #000; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .mode-badge { 
            border: 2px solid #000; 
            padding: 5px; 
            margin: 10px 0; 
            text-align: center; 
            font-weight: bold; 
            letter-spacing: 2px;
          }
          .total-line { display: flex; justify-content: space-between; font-weight: bold; margin-top: 5px; }
          img { display: block; margin: 0 auto; }
        </style>
      </head>
      <body>
        <h2 class="center" style="margin:0;">හෙළ සිත් රූ</h2>
        <p class="center" style="font-size:10px;">${new Date().toLocaleString()}<br>Staff: ${staff}</p>
        
        <div class="mode-badge">${billMode}</div>

        <div style="margin-top:10px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:bold; border-bottom:1px solid #000; margin-bottom:10px;">
            <span>ITEM / BARCODE</span>
            <span>TOTAL</span>
          </div>
          ${rows}
        </div>

        <div style="margin-top: 10px; border-top: 2px solid #000; padding-top: 5px;">
          <div class="total-line"><span>NET TOTAL:</span><span>LKR ${total.toFixed(2)}</span></div>
          <div class="total-line" style="font-weight:normal; font-size:12px;"><span>CASH:</span><span>LKR ${cash.toFixed(2)}</span></div>
          <div class="total-line" style="font-weight:normal; font-size:12px;"><span>BALANCE:</span><span>LKR ${bal.toFixed(2)}</span></div>
        </div>

        <div class="center" style="margin-top:20px; border-top: 1px dashed #000; padding-top: 15px;">
          <!-- Sale ID Barcode Image -->
          <img src="https://bwipjs-api.metafloor.com/?bcid=code128&text=${saleId}&scale=2&height=15" style="max-width:100%"/>
          <div style="font-size:11px; font-weight:bold; margin-top:5px;">SALE INVOICE: ${saleId}</div>
          <p style="font-size:9px;">Thank you! Please keep this receipt for returns.</p>
        </div>

        <script>
          window.onload = () => {
            // Give images time to load before printing
            setTimeout(() => { 
              window.print(); 
              window.close(); 
            }, 800);
          };
        </script>
      </body>
    </html>
  `);
  win.document.close();
};


  return (
    <div className="sales-page-container">
      <div className="sales-header">
        <h1>POS Terminal</h1>

        {/* Replace the Admin ID input in your JSX with this: */}
        <div className="admin-info-display" style={{ marginBottom: "10px", color: "#4b5563" }}>
          <span>Logged in as: <strong>{adminId}</strong></span>
          {/* If you have the name in localStorage, show it here: */}
          {/* <span> (Amashi Pathiraja)</span> */}
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
    <tr key={item.barcodeId}>
      {/* 1. BARCODE - Fixed as text */}
      <td>{item.barcodeId}</td>

      {/* 2. PRODUCT NAME */}
      <td>{item.productName}</td>

      {/* 3. PRICE - Shows Retail/Wholesale label */}
      <td>
        LKR {item.unitPrice.toLocaleString()}
        <small style={{
          color: item.quantity >= 6 ? '#f59e0b' : '#94a3b8',
          display: 'block',
          fontSize: '10px'
        }}>
          {item.quantity >= 6 ? 'WHOLESALE' : 'RETAIL'}
        </small>
      </td>

      {/* 4. QUANTITY - CLICK TO EDIT */}
      <td>
        {editingId === item.barcodeId ? (
          <input
            type="number"
            min="1"
            className="qty-edit-input"
            value={item.quantity}
            onChange={(e) =>
              updateQuantity(item.barcodeId, Math.max(1, Number(e.target.value)))
            }
            onBlur={() => setEditingId(null)} // Save/Close when clicking away
            onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)} // Save on Enter
            autoFocus
            style={{ width: "70px", padding: "4px", textAlign: "center" }}
          />
        ) : (
          <div 
            onClick={() => setEditingId(item.barcodeId)} 
            style={{ 
              cursor: 'pointer', 
              padding: '5px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              textAlign: 'center',
              border: '1px solid #e5e7eb'
            }}
            title="Click to change quantity"
          >
            {item.quantity} <span style={{fontSize: '10px'}}>✏️</span>
          </div>
        )}
      </td>

      {/* 5. TOTAL */}
      <td>LKR {(item.unitPrice * item.quantity).toLocaleString()}</td>

      {/* 6. ACTION */}
      <td>
        <button
          onClick={() => removeItem(item.barcodeId)}
          className="remove-btn"
          style={{
            background: "#fee2e2",
            color: "#b91c1c",
            border: "none",
            padding: "5px 10px",
            borderRadius: "4px",
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
          {/* 1. SALE MODE DISPLAY */}
          <div style={{
            padding: "10px",
            backgroundColor: items.some(i => i.quantity >= 6) ? "#fef3c7" : "#f3f4f6",
            borderRadius: "8px",
            marginBottom: "15px",
            fontWeight: "bold",
            textAlign: "center",
            color: items.some(i => i.quantity >= 6) ? "#b45309" : "#374151",
            border: "1px solid"
          }}>
            MODE: {items.some(i => i.quantity >= 6) ? "WHOLESALE" : "RETAIL"}
          </div>

          {/* 2. DISCOUNT INPUT */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Discount (%)</label>
            <input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(Number(e.target.value))}
              style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
            />
          </div>

          {/* 3. CASH RECEIVED INPUT (RESTORED) */}
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Cash Received (LKR)</label>
            <input
              type="number"
              placeholder="0.00"
              value={cashReceived}
              onChange={(e) => setCashReceived(Number(e.target.value))}
              style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", fontSize: "1.1rem" }}
            />
          </div>

          <hr style={{ margin: "15px 0", opacity: 0.2 }} />

          {/* 4. TOTALS DISPLAY */}
          <div className="totals-display">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal:</span>
              <span>LKR {subTotal.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#ef4444' }}>
              <span>Discount:</span>
              <span>- LKR {discountAmount.toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontWeight: 'bold' }}>
              <span>Total Payable:</span>
              <span>LKR {finalTotal.toLocaleString()}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: '10px',
              padding: '5px',
              backgroundColor: balance < 0 ? '#fee2e2' : '#dcfce7',
              borderRadius: '4px'
            }}>
              <span>Balance:</span>
              <span style={{ color: balance < 0 ? '#b91c1c' : '#15803d', fontWeight: 'bold' }}>
                LKR {balance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 5. BUTTONS */}
          <button 
  className="order-success-btn" 
  onClick={handleCheckout} 
  style={{ 
    width: "100%", 
    background: "#10b981", 
    color: "white", 
    padding: "15px", 
    borderRadius: "8px", 
    fontWeight: "bold",
    fontSize: "1.1rem",
    border: "none",
    cursor: "pointer"
  }}
>
  ORDER SUCCESS (PROCESS & PRINT)
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
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            CLEAR CART
          </button>

          
        </div>
      </div>
    </div>
  );
};

export default Sales;