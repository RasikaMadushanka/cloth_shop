import { MdAttachMoney, MdWarningAmber, MdShoppingBag, MdBarChart } from "react-icons/md";
import './AdminSlot.css'; 
function AdminSlot() {
    const status = [
       {
      label: "Total Sales Today",
      value: "$ 1,250.00",
      icon: <MdAttachMoney />,
      color: "#fdf2e9", // Light Orange
      iconColor: "#e67e22",
    },
    {
      label: "Low Stock Items",
      value: "3",
      icon: <MdWarningAmber />,
      color: "#fef2f2", // Light Red
      iconColor: "#e74c3c",
    },
    {
      label: "Total Products",
      value: "150",
      icon: <MdShoppingBag />,
      color: "#ebf5ff", // Light Blue
      iconColor: "#3498db",
    },
    {
      label: "Total Sales",
      value: "1,125",
      icon: <MdBarChart />,
      color: "#f0fdf4", // Light Green
      iconColor: "#27ae60",
    }
    ];
  return (
    <div className="status_grid">
        {status.map((stat,index)=>(
            <div className="status_card" key = {index}>
                <div 
            className="stat_icon_wrapper" 
            style={{ backgroundColor: stat.color, color: stat.iconColor }}
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

  )
}

export default AdminSlot