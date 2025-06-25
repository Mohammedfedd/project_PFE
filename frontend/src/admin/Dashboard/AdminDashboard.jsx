import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../Utils/Layout.jsx";
import axios from "axios";
import { server } from "../../main";
import { FaBook, FaChalkboardTeacher, FaUsers } from "react-icons/fa";
import "./admindashboard.css";

const AdminDashbord = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") {
    navigate("/");
    return null;
  }

  const [stats, setStats] = useState({});

  async function fetchStats() {
    try {
      const { data } = await axios.get(`${server}/api/stats`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setStats(data.stats);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout>
      <div className="admin-dashboard-container">
        <div className="stats-grid">
          <div className="stat-card total-courses">
            <div className="stat-icon">
              <FaBook />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Courses</p>
              <p className="stat-value">{stats.totalCourses ?? 0}</p>
            </div>
          </div>

          <div className="stat-card total-lectures">
            <div className="stat-icon">
              <FaChalkboardTeacher />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Lectures</p>
              <p className="stat-value">{stats.totalLectures ?? 0}</p>
            </div>
          </div>

          <div className="stat-card total-users">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-info">
              <p className="stat-label">Total Users</p>
              <p className="stat-value">{stats.totalUsers ?? 0}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashbord;
