import { MdEdit, MdDelete, MdSearch, MdAdd } from "react-icons/md";

interface ProductItem {
    id: number;
    name: string;
    price: number;
    stock: number;
    category: string;
    image: string; // Emoji or URL
    sku: string;
}

function ItemManagement() {

    const products: ProductItem[] = [
        { id: 1, name: "Black T-Shirt", price: 20.00, stock: 50, category: "T-Shirts", image: "👕", sku: "TS-001" },
        { id: 2, name: "Blue Jeans", price: 40.00, stock: 35, category: "Jeans", image: "👖", sku: "JN-002" },
        { id: 3, name: "Red Dress", price: 60.00, stock: 3, category: "Dresses", image: "👗", sku: "DR-003" },
        { id: 4, name: "Grey Hoodie", price: 35.00, stock: 28, category: "Jackets", image: "🧥", sku: "HD-004" },
    ];

    return (
        <div className="inventory_left">
            <div className="inventory_header">
                <h3>Inventory Management</h3><button className="btn_add_new"><MdAdd />Add New Product</button>
            </div>
            <div className="inventory_controls">
                <div className="filter_tabs">
                    <button className="tab_btn active">All</button>
                    <button className="tab_btn">T-Shirts</button>
                    <button className="tab_btn">Jeans</button>
                    <button className="tab_btn">Dresses</button>
                    <button className="tab_btn">Jackets</button>
                </div>
                <div className="inventory_search">
                    <MdSearch className="search_icon" /><input type="text" placeholder="Search" />
                </div>
            </div>
            <div className="inventory_table">
                <table className="management_table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item) => (
                            <tr key={item.id}>
                                <td className="item_cell">
                                    <div className="item_icon">{item.image}</div>
                                    <div className="item_details_text">
                                        <span className="item_name">{item.name}</span>
                                        <span className="item_sku">{item.sku}</span>
                                    </div>
                                </td>
                                <td className="item_price">${item.price.toFixed(2)}</td>
                                <td className="item_stock">
                                    <span className={item.stock < 10 ? "stock_low" : "stock_normal"}>
                                        {item.stock}
                                    </span>
                                </td>
                                <td>
                                    <div className="action_btns_group">
                                        <button className="action_btn edit"><MdEdit /></button>
                                        <button className="action_btn delete"><MdDelete /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ItemManagement