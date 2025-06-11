import React from "react";
import "./loading.css";

const LoadingScreen = () => {
  return (
    <div className="loading-overlay">
      <div className="spinner-container">
        <div className="glow-spinner"></div>
        <div className="loading-text">
          Loading<span className="dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
