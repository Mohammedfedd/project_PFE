import React, { useState } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext"; // Update the path as needed

const Verify = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const { btnLoading, verifyOtp } = UserData();

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!otp || isNaN(otp)) return;
    await verifyOtp(Number(otp), navigate);
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Verify Your Account</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="verificationCode">Enter Verification Code</label>
          <input
            type="text"
            id="verificationCode"
            name="verificationCode"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
            placeholder="Enter your code"
          />
          <button type="submit" className="common-btn" disabled={btnLoading}>
            {btnLoading ? "Verifying..." : "Verify"}
          </button>
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
