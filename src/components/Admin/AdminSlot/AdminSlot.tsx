import React, { useEffect, useMemo, useState } from "react";
import {
    MdAttachMoney,
    MdWarningAmber,
    MdShoppingBag,
    MdBarChart
} from "react-icons/md";
import "./AdminSlot.css";
import { productApi } from "../../api/Service/apiService";

/* ================= TYPES ================= */

interface Variant {
    variantId: string;
    barcodeId: string;
    sku: string;
    color: string;
    size: string;
    stockQuantity: number;
    priceOverride: number;
}

interface Product {
    productId: number;
    productName: string;
    retailPrice: number;     // From JSON: 3000.0
    discountedPrice: number; // From JSON: 3000.0
    totalQuantity: number;   // From JSON: 49
    stockStatus: string;
    variants: Variant[];
}

/* ================= COMPONENT ================= */

const AdminSlot: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    /* ================= FETCH ================= */
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const res = await productApi.getAll();
                // Ensure we handle cases where res.data might be null
                setProducts(res.data || []);
            } catch (err) {
                console.error("API error fetching products:", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    /* ================= METRICS ================= */

    // 1. Total unique products in the system
    const totalProducts = products.length;

    // 2. Total physical items in stock across all products/variants
    const totalStock = useMemo(() => {
        return products.reduce((acc, p) => acc + (p.totalQuantity || 0), 0);
    }, [products]);

    // 3. Count of specific variants that are running low (<= 10)
    const lowStockCount = useMemo(() => {
        let count = 0;
        products.forEach((p) => {
            (p.variants || []).forEach((v) => {
                if (v.stockQuantity <= 10) count++;
            });
        });
        return count;
    }, [products]);

    // 4. Financial valuation of all inventory
    const totalInventoryValue = useMemo(() => {
        return products.reduce((acc, p) => {
            // Priority: Use retailPrice from JSON, fallback to discountedPrice
            const price = p.retailPrice || p.discountedPrice || 0;
            const quantity = p.totalQuantity || 0;
            return acc + (price * quantity);
        }, 0);
    }, [products]);

    /* ================= STATUS CARD CONFIGURATION ================= */

    const statusCards = [
        {
            label: "Total Inventory Value",
            value: loading ? "..." : `Rs. ${totalInventoryValue.toLocaleString(undefined, { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
            })}`,
            icon: <MdAttachMoney />,
            color: "#fdf2e9",
            iconColor: "#e67e22"
        },
        {
            label: "Low Stock Items",
            value: loading ? "..." : String(lowStockCount),
            icon: <MdWarningAmber />,
            color: "#fef2f2",
            iconColor: "#e74c3c"
        },
        {
            label: "Total Products",
            value: loading ? "..." : String(totalProducts),
            icon: <MdShoppingBag />,
            color: "#ebf5ff",
            iconColor: "#3498db"
        },
        {
            label: "Total Physical Stock",
            value: loading ? "..." : String(totalStock),
            icon: <MdBarChart />,
            color: "#f0fdf4",
            iconColor: "#27ae60"
        }
    ];

    /* ================= UI RENDER ================= */

    return (
        <div className="status_grid">
            {statusCards.map((stat, index) => (
                <div className="status_card" key={index}>
                    <div
                        className="stat_icon_wrapper"
                        style={{
                            backgroundColor: stat.color,
                            color: stat.iconColor
                        }}
                    >
                        {stat.icon}
                    </div>

                    <div className="stat_content">
                        <p className="stat_label">{stat.label}</p>
                        <h3 className="stat_value">{stat.value}</h3>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AdminSlot;