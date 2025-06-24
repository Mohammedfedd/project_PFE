import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import "./account.css";
import { IoMdLogOut } from "react-icons/io";
import { UserData } from "../../context/UserContext";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { FiEdit } from "react-icons/fi"; // Icon for edit

const Account = ({ user }) => {
  const { setIsAuth, setUser } = UserData();
  const navigate = useNavigate();
  const [isZoomed, setIsZoomed] = useState(false);

  const logoutHandler = () => {
    localStorage.clear();
    setUser([]);
    setIsAuth(false);
    toast.success("Logged Out");
    navigate("/login");
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const dashboardHandler = () => {
    window.location.href = `/${user._id}/dashboard`;
  };

  // Edited to force full browser reload
  const editProfileHandler = () => {
    window.location.href = `/${user._id}/edit-profile`;
  };

  return (
    <div className="account-container">
      {user && (
        <div className="profile-card">
          <div className="profile-banner"></div>

          <div className="profile-content">
            <div
              className="avatar-wrapper"
              onClick={toggleZoom}
              style={{ cursor: "pointer" }}
            >
              {user.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="profile-avatar"
                />
              ) : (
                <div className="default-avatar">
                  <FaUserCircle />
                </div>
              )}
            </div>

            <div className="profile-info">
              <h2 className="profile-name">
                {user.firstName} {user.lastName}
              </h2>
              <p className="profile-email">{user.email}</p>
            </div>

            <div className="action-buttons">
              <button onClick={dashboardHandler} className="dashboard-btn">
                <MdDashboard className="btn-icon" />
                Dashboard
              </button>

              <button onClick={editProfileHandler} className="dashboard-btn">
                <FiEdit className="btn-icon" />
                Edit Profile
              </button>

              <button onClick={logoutHandler} className="logout-btn">
                <IoMdLogOut className="btn-icon" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {isZoomed && user?.profilePicture && (
        <div className="zoom-overlay" onClick={toggleZoom}>
          <div className="zoom-content">
            <img
              src={user.profilePicture}
              alt="Zoomed Profile"
              className="zoomed-image"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
