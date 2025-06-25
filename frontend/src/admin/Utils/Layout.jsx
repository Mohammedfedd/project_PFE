import React, { useState } from "react";
import Sidebar from "./Sidebar";
import "./common.css";

const Layout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard-admin">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar}
      />
      <div className={`content ${sidebarCollapsed ? 'content-expanded' : ''}`}>
        <header className="content-header">
          <button 
            className="sidebar-toggle"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
        </header>
        <main className="content-main">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;