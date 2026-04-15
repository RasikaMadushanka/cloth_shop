import { useState } from "react";
import "./inventoryBilling.css";

interface Product {
  id: number;
  name: string;
  price: number;
  qty: number;
}

function InventoryBilling() {
  // Mock data - in a real app, this state might be lifted to App.tsx 
  // to allow ItemManagement to trigger addToCart
  const [cart, setCart] = useState<Product[]>([
    { id: 1, name: "Black T-Shirt", price: 20.0, qty: 1 },
    { id: 2, name: "Blue Jeans", price: 40.0, qty: 2 },
  ]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div className="billing-wrapper">
      <div className="billing-header">
        <h2>Current Order</h2>
        <div className="search-container">
          <input type="text" placeholder="Scan Barcode..." className="barcode-input" />
        </div>
      </div>

      <div className="cart-list">
        {cart.length === 0 ? (
          <div className="empty-state">
            <p>Your cart is empty</p>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-detail">${item.price.toFixed(2)} x {item.qty}</span>
              </div>
              <span className="item-total-price">
                ${(item.price * item.qty).toFixed(2)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="billing-footer">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="summary-row grand-total">
          <span>Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button className="complete-btn" disabled={cart.length === 0}>
          Complete Sale
        </button>
      </div>
    </div>
  );
}

export default InventoryBilling;