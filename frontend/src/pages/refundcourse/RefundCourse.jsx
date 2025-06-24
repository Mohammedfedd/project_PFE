import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main";
import "./refuncourse.css";

const RefundCourse = ({ user }) => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [refundSuccess, setRefundSuccess] = useState(false);

  const handleRefundRequest = async () => {
    if (!window.confirm("Are you sure you want to request a refund for this course?")) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/course/refund/${courseId}`,
        {},
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      toast.success(data.message || "Refund requested successfully");
      setRefundSuccess(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Refund request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refund-container">
      {!refundSuccess ? (
        <>
          <h1>Request Refund</h1>
          <p>
            We're sorry to hear you want a refund. Please confirm below to submit your refund request. Our team
            will review and process it within 7–10 business days.
          </p>
          <button
            onClick={handleRefundRequest}
            disabled={loading}
            className="refund-btn"
          >
            {loading ? "Requesting..." : "Request Refund"}
          </button>
        </>
      ) : (
        <div className="refund-success">
          <div className="success-icon">&#10004;</div>
          <h2>Refund Successful</h2>
          <p>Your refund has been processed successfully.</p>
          <button
            className="dashboard-btn"
            onClick={() => navigate(`/${user._id}/dashboard`)}
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default RefundCourse;
