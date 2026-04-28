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
    stockQuantity: number;
}

interface Product {
    productId: number;
    productName: string;
    basePrice: number;
    totalQuantity: number;
    variants: Variant[];
}

/* ================= COMPONENT ================= */

const AdminSlot: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

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

    /* ================= METRICS ================= */

    const totalProducts = products.length;

    const totalStock = useMemo(() => {
        return products.reduce(
            (acc, p) =>
                acc +
                p.variants.reduce((vAcc, v) => vAcc + v.stockQuantity, 0),
            0
        );
    }, [products]);

    const lowStockCount = useMemo(() => {
        let count = 0;

        products.forEach((p) => {
            p.variants.forEach((v) => {
                if (v.stockQuantity <= 10) count++;
            });
        });

        return count;
    }, [products]);

    const totalSalesEstimate = useMemo(() => {
        return products.reduce((acc, p) => {
            return acc + p.basePrice * p.totalQuantity;
        }, 0);
    }, [products]);

    /* ================= STATUS DATA ================= */

    const status = [
        {
            label: "Total Sales (Est.)",
            value: loading ? "..." : `Rs. ${totalSalesEstimate.toFixed(2)}`,
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
            label: "Total Stock",
            value: loading ? "..." : String(totalStock),
            icon: <MdBarChart />,
            color: "#f0fdf4",
            iconColor: "#27ae60"
        }
    ];

    /* ================= UI ================= */

    return (
        <div className="status_grid">
            {status.map((stat, index) => (
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