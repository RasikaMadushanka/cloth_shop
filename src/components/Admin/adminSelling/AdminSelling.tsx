import './AdminSelling.css'


function AdminSelling() {
    const products = [
        { id: 1, name: "Black T-Shirt", sold: 50, revenue: "$ 1,200.00", icon: "👕" },
        { id: 2, name: "Blue Jeans", sold: 40, revenue: "$ 1,600.00", icon: "👖" },
        { id: 3, name: "Red Dress", sold: 3, revenue: "Low Sales", icon: "👗", isLow: true },
        { id: 4, name: "Grey Hoodie", sold: 28, revenue: "$ 1,400.00", icon: "🧥" },
        { id: 5, name: "Green Jacket", sold: 25, revenue: "$ 1,250.00", icon: "🧥" },
    ]

    return (
        <div className="selling_container">
            <div className="selling_top">
                <h4>Best Selling Products</h4><span className="top_options">...</span>
            </div>
            <table className="selling_table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Sold</th>
                        <th>Revenue</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>
                            <td className="product_cell">
                                <div className="product_icon_bg">{item.icon}</div><span>{item.name}</span>
                            </td>
                            <td>{item.sold}</td>
                            <td><span className={item.isLow ? "revenue_badge_low" : "revenue_text"}></span></td>

                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="selling_footer">
                <input type="text" placeholder="search" className="footer_search" />
                <div className="filter_buttons">
                    <button className="active">All</button>
                    <button>T-Shirts</button>
                    <button>Jeans</button>
                    <button>Dresses</button>
                    <button>Jackets</button>
                </div>
            </div>
        </div>
    );
}

export default AdminSelling