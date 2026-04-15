import { MdKeyboardArrowRight } from "react-icons/md";
import "./AdminOverview.css";

interface SalesData {
    day: string;
    height: string;
}

interface LowStockItem {
    name: string;
    sku: string;
    stock: number;
}

function AdminOverview() {
    const salesData: SalesData[] = [
        { day: "Mon", height: "40%" }, 
        { day: "Tue", height: "60%" },
        { day: "Wed", height: "30%" }, 
        { day: "Thu", height: "75%" },
        { day: "Fri", height: "50%" }, 
        { day: "Sat", height: "90%" },
        { day: "Sun", height: "70%" }
    ];

    const lowStock: LowStockItem[] = [
        { name: "Black T-Shirt", sku: "123456789012", stock: 50 },
        { name: "Blue Jeans", sku: "987654321098", stock: 35 },
        { name: "Red Dress", sku: "456789012345", stock: 5 },
        { name: "Grey Hoodie", sku: "456789012345", stock: 28 },
    ];

    return (
        <div className="right_panel">
            <div className="overview_card">
                <div className="overview_card_header">
                    <h4>Sales Overview</h4>
                    <span className="uelv_link">
                        Uelv ID <MdKeyboardArrowRight />
                    </span>
                </div>
                {/* Check this class name against your CSS */}
                <div className="bar_chart_container">
                    {salesData.map((item, i) => (
                        <div key={i} className="bar_wrapper">
                            <div className="bar" style={{ height: item.height }}></div>
                            <span className="bar_label">{item.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="overview_card">
                <div className="overview_card_header">
                    <h4>Low Stock Items</h4>
                    <span className="dots_menu">...</span>
                </div>
                <table className="stock_table">
                    <thead>
                        <tr>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lowStock.map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td className="sku_fade">{item.sku.substring(0, 8)}...</td>
                                <td className="stock_val">
                                    {item.stock} <span className="check_mark">✓</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminOverview;