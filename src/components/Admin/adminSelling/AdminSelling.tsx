import { useEffect, useMemo, useState } from "react";
import "./AdminSelling.css";
import { productApi } from "../../api/Service/apiService";

/* ================= TYPES ================= */

interface Variant {
    barcodeId: string;
    color: string;
    size: string;
    sku: string;
    stockQuantity: number;
    priceOverride?: number;
}

interface Product {
    productId: number;
    productName: string;
    category: string;
    basePrice: number;
    discountedPrice: number;
    totalQuantity: number;
    availableColors: string[];
    availableSizes: string[];
    variants: Variant[];
}

interface FlatRow {
    productName: string;
    category: string;
    sku: string;
    barcodeId: string;
    color: string;
    size: string;
    stock: number;
    price: number;
}

/* ================= COMPONENT ================= */

function AdminSelling() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    /* ================= FETCH ================= */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await productApi.getAll();
                setProducts(res.data);
            } catch (err) {
                console.error("API error:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    /* ================= FLATTEN + PRICE LOGIC ================= */
    const rows: FlatRow[] = useMemo(() => {
        const result: FlatRow[] = [];

        products.forEach((p) => {
            p.variants.forEach((v) => {

                const price =
                    v.priceOverride ??
                    p.discountedPrice ??
                    p.basePrice;

                result.push({
                    productName: p.productName,
                    category: p.category,
                    sku: v.sku,
                    barcodeId: v.barcodeId,
                    color: v.color,
                    size: v.size,
                    stock: v.stockQuantity,
                    price
                });
            });
        });

        return result;
    }, [products]);

    /* ================= FILTER ================= */
    const filtered = rows.filter((r) =>
        r.productName.toLowerCase().includes(search.toLowerCase()) ||
        r.sku.toLowerCase().includes(search.toLowerCase()) ||
        r.barcodeId.includes(search)
    );

    /* ================= UI ================= */

    return (
        <div className="selling_container">

            {/* ================= HEADER ================= */}
            <div className="selling_top">
                <h4>Product Selling Overview</h4>
                <span className="top_options">⋯</span>
            </div>

            {/* ================= SEARCH ================= */}
            <div className="selling_controls">
                <input
                    type="text"
                    placeholder="Search product, SKU or barcode..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="search_box"
                />
            </div>

            {/* ================= TABLE ================= */}
            {loading ? (
                <div className="loading">Loading products...</div>
            ) : (
                <table className="selling_table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>Category</th>
                            <th>SKU</th>
                            <th>Barcode</th>
                            <th>Color</th>
                            <th>Size</th>
                            <th>Price</th>
                            <th>Stock</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filtered.map((item, i) => (
                            <tr key={i}>
                                <td>{item.productName}</td>
                                <td className="fade">{item.category}</td>
                                <td className="mono">{item.sku}</td>
                                <td className="mono">{item.barcodeId}</td>
                                <td>{item.color}</td>
                                <td>{item.size}</td>

                                {/* ================= PRICE ================= */}
                                <td className="price">
                                    LKR {item.price.toFixed(2)}
                                </td>

                                {/* ================= STOCK ================= */}
                                <td
                                    className={
                                        item.stock <= 5
                                            ? "danger"
                                            : item.stock <= 10
                                            ? "warn"
                                            : "ok"
                                    }
                                >
                                    {item.stock}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {/* ================= FOOTER ================= */}
            <div className="selling_footer">
                <div className="filter_buttons">
                    <button className="active">All</button>
                    <button>Low Stock</button>
                    <button>Available</button>
                </div>
            </div>
        </div>
    );
}

export default AdminSelling;