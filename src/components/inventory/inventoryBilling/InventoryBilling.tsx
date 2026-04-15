import { useState } from "react";
import styles from "./InventoryBilling.module.css";

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  stock: number;
}

function InventoryBilling() {
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  
  const products: Product[] = [
    { id: 1, name: "Black T-Shirt", price: 20.0, stock: 50, image: "👕" },
    { id: 2, name: "Blue Jeans", price: 40.0, stock: 35, image: "👖" },
    { id: 3, name: "Red Dress", price: 60.0, stock: 3, image: "👗" },
  ];

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * (item.qty as number), 0);

  return (
    <div className={styles.container}>
      {/* Left: Inventory Section */}
      <section className={styles.inventory}>
        <div className={styles.header}>
          <h1>Inventory Management</h1>
          <button className={styles.addBtn}>+ Add New Product</button>
        </div>

        <div className={styles.productGrid}>
          {products.map((product) => (
            <div key={product.id} className={styles.card} onClick={() => addToCart(product)}>
              <div className={styles.imagePlaceholder}>{product.image}</div>
              <h3>{product.name}</h3>
              <p className={styles.price}>${product.price.toFixed(2)}</p>
              <p className={styles.stock}>{product.stock} in stock</p>
            </div>
          ))}
        </div>
      </section>

      <aside className={styles.billingContainer}>
        <div className={styles.billingHeader}>
          <h2>Current Order</h2>
          <input type="text" placeholder="Scan Barcode..." className={styles.barcodeInput} />
        </div>

        <div className={styles.cartList}>
          {cart.length === 0 ? (
            <p className={styles.empty}>Your cart is empty</p>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className={styles.cartItem}>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{item.product.name}</span>
                  <span className={styles.itemDetail}>${item.product.price} x {item.qty}</span>
                </div>
                <span className={styles.itemTotal}>
                    ${(item.product.price * (item.qty as number)).toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className={styles.billingFooter}>
          <div className={styles.summaryRow}>
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className={`${styles.summaryRow} ${styles.grandTotal}`}>
            <span>Total</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <button className={styles.completeBtn} disabled={cart.length === 0}>
            Complete Sale
          </button>
        </div>
      </aside>
    </div>
  );
}

export default InventoryBilling;