import React from "react";
import "./common.css";
import { Link, useLocation } from "react-router-dom";
import { AiFillHome, AiOutlineLogout } from "react-icons/ai";
import { FaBook, FaUserAlt, FaChevronLeft } from "react-icons/fa";
import { UserData } from "../../context/UserContext";

const Sidebar = ({ collapsed, onToggle }) => {
  const { user } = UserData();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: "/admin/dashboard",
      icon: <AiFillHome />,
      label: "Dashboard",
      show: true
    },
    {
      path: "/admin/course",
      icon: <FaBook />,
      label: "Courses",
      show: true
    },
    {
      path: "/admin/users",
      icon: <FaUserAlt />,
      label: "Users",
      show: !!user
    }
  ];

  const handleLogout = () => {
    // Add logout logic here if needed
    console.log("Logout clicked");
  };

  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && (
          <div className="sidebar-brand">
            <h3>Admin Panel</h3>
          </div>
        )}
        <button 
          className="sidebar-collapse-btn"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <FaChevronLeft className={collapsed ? 'rotate-180' : ''} />
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            item.show && (
              <li key={item.path} className="sidebar-item">
                <Link 
                  to={item.path}
                  className={`sidebar-link ${isActive(item.path) ? 'active' : ''}`}
                  title={collapsed ? item.label : ''}
                >
                  <div className="sidebar-icon">
                    {item.icon}
                  </div>
                  {!collapsed && <span className="sidebar-text">{item.label}</span>}
                </Link>
              </li>
            )
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="sidebar-item">
            <Link 
              to="/account"
              className="sidebar-link logout-link"
              onClick={handleLogout}
              title={collapsed ? "Logout" : ''}
            >
              <div className="sidebar-icon">
                <AiOutlineLogout />
              </div>
              {!collapsed && <span className="sidebar-text">Logout</span>}
            </Link>
          </div>

          {!collapsed && user && (
            <div className="sidebar-user">
              <div className="user-info">
                <span className="user-name">{user.name || 'Admin'}</span>
                <span className="user-role">Administrator</span>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;