import { useEffect, useMemo, useState } from "react";
import { MdKeyboardArrowRight } from "react-icons/md";
import "./AdminOverview.css";
import { productApi } from "../../api/Service/apiService";

/* ================= TYPES ================= */

interface Variant {
    barcodeId: string;
    color: string;
    size: string;
    sku: string;
    stockQuantity: number;
}

interface Product {
    productId: number;
    productName: string;
    category: string;
    basePrice: number;
    discountedPrice: number;
    discountPercentage: number;
    totalQuantity: number;
    stockStatus: string;
    availableColors: string[];
    availableSizes: string[];
    variants: Variant[];
}

interface LowStockItem {
    productName: string;
    category: string;
    sku: string;
    color: string;
    size: string;
    stock: number;
}

/* ================= COMPONENT ================= */

function AdminOverview() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    /* ================= FETCH DATA ================= */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const res = await productApi.getAll();
                setProducts(res.data);
            } catch (err) {
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    /* ================= LOW STOCK ENGINE ================= */
    const lowStock = useMemo(() => {
        const list: LowStockItem[] = [];

        products.forEach((p) => {
            p.variants.forEach((v) => {
                if (v.stockQuantity <= 10) {
                    list.push({
                        productName: p.productName,
                        category: p.category,
                        sku: v.sku,
                        color: v.color,
                        size: v.size,
                        stock: v.stockQuantity
                    });
                }
            });
        });

        return list;
    }, [products]);

    /* ================= SUMMARY ================= */
    const summary = useMemo(() => {
        const totalVariants = products.reduce(
            (acc, p) => acc + p.variants.length,
            0
        );

        const totalStock = products.reduce(
            (acc, p) => acc + p.totalQuantity,
            0
        );

        return { totalVariants, totalStock };
    }, [products]);

    /* ================= SALES DEMO ================= */
    const sales = [
        { day: "Mon", val: 35 },
        { day: "Tue", val: 55 },
        { day: "Wed", val: 25 },
        { day: "Thu", val: 80 },
        { day: "Fri", val: 60 },
        { day: "Sat", val: 95 },
        { day: "Sun", val: 70 }
    ];

    /* ================= UI ================= */

    return (
        <div className="right_panel">

            {/* ================= SALES ================= */}
            <div className="card">
                <div className="card_header">
                    <h4> Overview</h4>
                    <span className="link">
                        Report <MdKeyboardArrowRight />
                    </span>
                </div>

                <div className="chart">
                    {sales.map((s, i) => (
                        <div key={i} className="bar_box">
                            <div
                                className="bar"
                                style={{ height: `${s.val}%` }}
                            />
                            <span>{s.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ================= LOW STOCK ================= */}
            <div className="card">
                <div className="card_header">
                    <h4>Low Stock Products</h4>
                    <span className="menu">⋯</span>
                </div>

                {loading ? (
                    <div className="info">Loading products...</div>
                ) : lowStock.length === 0 ? (
                    <div className="info success">All stocks are healthy ✔</div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>SKU</th>
                                <th>Color</th>
                                <th>Size</th>
                                <th>Stock</th>
                            </tr>
                        </thead>

                        <tbody>
                            {lowStock.map((i, idx) => (
                                <tr key={idx}>
                                    <td>{i.productName}</td>
                                    <td>{i.category}</td>
                                    <td className="sku">{i.sku}</td>
                                    <td>{i.color}</td>
                                    <td>{i.size}</td>
                                    <td
                                        className={
                                            i.stock <= 5
                                                ? "danger"
                                                : "warn"
                                        }
                                    >
                                        {i.stock}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ================= SUMMARY ================= */}
            <div className="card summary">
                <div className="card_header">
                    <h4>Inventory Summary</h4>
                </div>

                <div className="stats">
                    <div>
                        <h3>{products.length}</h3>
                        <p>Products</p>
                    </div>

                    <div>
                        <h3>{summary.totalVariants}</h3>
                        <p>Variants</p>
                    </div>

                    <div>
                        <h3>{summary.totalStock}</h3>
                        <p>Total Stock</p>
                    </div>

                    <div>
                        <h3>{lowStock.length}</h3>
                        <p>Low Stock</p>
                    </div>
                </div>
            </div>

        </div>
    );
}

export default AdminOverview;