import React from "react";
import "./auth.css"; // Assuming the CSS is properly linked
import { Link } from "react-router-dom";

const Verify = () => {
  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Verify Your Account</h2>
        <form>
          <label htmlFor="verificationCode">Enter Verification Code</label>
          <input
            type="text"
            id="verificationCode"
            name="verificationCode"
            required
            placeholder="Enter your code"
          />
          <button type="submit" className="common-btn">Verify</button>
        </form>
        <div className="auth-links">
          <p>
             <Link to="/">Return to home page</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Verify;
