import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../Utils/Layout.jsx";
import { server } from "../../main";
import "./sales.css";

const AdminSales = ({ user }) => {
  const [totalSales, setTotalSales] = useState(0);
  const [salesByDate, setSalesByDate] = useState([]);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const { data } = await axios.get(`${server}/api/sales/total`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });
        setTotalSales(data.totalSales ?? 0);
      } catch (error) {
        toast.error("Failed to fetch total sales");
      }
    };

    const fetchSalesByDate = async () => {
      try {
        const { data } = await axios.get(`${server}/api/sales/by-date`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        setSalesByDate(data.dailySales || []);
      } catch (error) {
        toast.error("Failed to fetch sales by date");
      }
    };

    fetchSales();
    fetchSalesByDate();
  }, []);

  if (user && user.role !== "admin") {
    return <p>Access Denied</p>;
  }

  // Constants for SVG size
  const width = 600;
  const height = 300;
  const padding = 40;

  // Prepare data for chart
  const maxSale =
    salesByDate.length > 0
      ? Math.max(...salesByDate.map((d) => d.totalAmount))
      : 0;

  // Map sales data points to SVG coordinates
  const points = salesByDate.map((d, i) => {
    const x = padding + (i * (width - 2 * padding)) / (salesByDate.length - 1 || 1);
    const y = height - padding - ((d.totalAmount / maxSale) * (height - 2 * padding));
    return { x, y, date: d._id, value: d.totalAmount };
  });

  // Create path string for the line
  const linePath = points
    .map((point, i) => (i === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`))
    .join(" ");

  // Determine sales trend indicator
  let salesTrendMessage = "No sales data available.";
  if (points.length > 1) {
    const firstValue = points[0].value;
    const lastValue = points[points.length - 1].value;

    if (lastValue > firstValue * 1.1) {
      salesTrendMessage = "Sales are trending up 📈";
    } else if (lastValue < firstValue * 0.9) {
      salesTrendMessage = "Sales are trending down 📉";
    } else {
      salesTrendMessage = "Sales are stable ➖";
    }
  }

  return (
    <Layout>
      <div className="admin-sales-container">
        <h1>Total Sales</h1>
        <div className="sales-card">
          <p className="sales-amount">MAD {totalSales.toFixed(2)}</p>
        </div>

        <h2>Sales Over Time</h2>
        {salesByDate.length === 0 ? (
          <p>No sales data available</p>
        ) : (
          <>
            <svg width={width} height={height} style={{ border: "1px solid #ccc" }}>
              {/* X and Y axis */}
              <line
                x1={padding}
                y1={height - padding}
                x2={width - padding}
                y2={height - padding}
                stroke="black"
              />
              <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="black" />

              {/* Y axis labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((t) => {
                const y = height - padding - t * (height - 2 * padding);
                const label = Math.round(maxSale * t);
                return (
                  <g key={t}>
                    <line x1={padding - 5} y1={y} x2={padding} y2={y} stroke="black" />
                    <text
                      x={padding - 10}
                      y={y + 4}
                      fontSize="10"
                      textAnchor="end"
                      fill="#333"
                    >
                      {label}
                    </text>
                  </g>
                );
              })}

              {/* X axis labels (dates) - show only some for clarity */}
              {points.map((point, i) => {
                if (i % Math.ceil(points.length / 6) !== 0) return null;
                return (
                  <text
                    key={point.date}
                    x={point.x}
                    y={height - padding + 15}
                    fontSize="10"
                    textAnchor="middle"
                    fill="#333"
                  >
                    {point.date}
                  </text>
                );
              })}

              {/* Line path */}
              <path d={linePath} fill="none" stroke="#007bff" strokeWidth="2" />

              {/* Data points */}
              {points.map((point) => (
                <circle key={point.date} cx={point.x} cy={point.y} r={3} fill="#007bff" />
              ))}
            </svg>

            {/* Sales trend indicator */}
            <p style={{ marginTop: "10px", fontWeight: "bold", fontSize: "1.1rem", textAlign: "center" }}>
              {salesTrendMessage}
            </p>
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminSales;
