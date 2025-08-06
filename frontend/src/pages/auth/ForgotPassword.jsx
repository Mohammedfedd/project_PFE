import React, { useState } from "react";
import "./auth.css";
import axios from "axios";
import { server } from "../../main"; // Adjust path if needed
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submitHandler = async (e) => {
  e.preventDefault();
  setLoading(true);
  console.log("Sending forgot password request for email:", email);

  try {
    const { data } = await axios.post(`${server}/api/user/forgot`, { email });
    console.log("Forgot password response data:", data);
    toast.success(data.message);
    navigate("/");
  } catch (err) {
    console.error("Forgot password error:", err);

    if (err.response) {
      console.error("Server responded with:", err.response.data);
      toast.error(err.response.data.message || "Something went wrong");
    } else if (err.request) {
      console.error("No response received:", err.request);
      toast.error("No response from server, please try again.");
    } else {
      console.error("Error setting up request:", err.message);
      toast.error(err.message);
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Forgot Password</h2>
        <form onSubmit={submitHandler}>
          <label htmlFor="email">Enter your email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button disabled={loading} type="submit" className="common-btn">
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        <p>
          <a
            onClick={() => navigate(-1)}
            className="forgot-link"
            style={{ cursor: "pointer" }}
          >
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
