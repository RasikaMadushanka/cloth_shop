import React, { useEffect, useState } from "react";
import { MdSearch } from "react-icons/md";
import "./ItemManagement.css";
import { productApi } from "../api/Service/apiService";

interface Variant {
  barcodeId: string;
  color: string;
  size: string;
  sku: string;
  stockQuantity: number;
  priceOverride: number;
}

interface Product {
  productId: number;
  productName: string;
  category: string;
  basePrice: number;
  totalQuantity: number;
  availableColors: string[];
  availableSizes: string[];
  variants: Variant[];
}

function ItemManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await productApi.getAll();
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.variants.some(v => v.barcodeId.includes(search) || v.sku.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="inventory_table_container">

      {/* HEADER */}
      <div className="inventory_header">


        <div className="search_box">
          <MdSearch />
          <input
            type="text"
            placeholder="Search product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* BIG TABLE */}
      <div className="table_wrapper">
        <table className="inventory_big_table">

          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Colors</th>
              <th>Sizes</th>
              <th>Barcode</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Stock</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map(product =>
              product.variants.map((v) => (
                <tr key={v.barcodeId}>

                  {/* PRODUCT NAME */}
                  <td className="product_name">
                    {product.productName}
                  </td>

                  {/* CATEGORY */}
                  <td>{product.category}</td>

                  {/* COLOR - Now shows ONLY the variant's color */}
                  <td>
                    <span className="tag color">{v.color}</span>
                  </td>

                  {/* SIZE - Now shows ONLY the variant's size */}
                  <td>
                    <span className="tag size">{v.size}</span>
                  </td>

                  {/* BARCODE */}
                  <td className="mono" style={{ color: '#2563eb' }}>{v.barcodeId}</td>

                  {/* SKU */}
                  <td>{v.sku}</td>

                  {/* PRICE */}
                  <td className="price" style={{ fontWeight: 'bold' }}>
                    LKR {(v.priceOverride ?? product.basePrice).toLocaleString()}
                  </td>

                  {/* STOCK */}
                  <td>
                    <span className={`stock-badge ${v.stockQuantity < 10 ? "low" : "ok"}`}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: v.stockQuantity < 10 ? '#fee2e2' : '#dcfce7',
                        color: v.stockQuantity < 10 ? '#b91c1c' : '#15803d'
                      }}>
                      {v.stockQuantity}
                    </span>
                  </td>

                </tr>
              ))
            )}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default ItemManagement;