import React from "react";
import { Link } from "react-router-dom";
import "./paymentcanceled.css"; // Create this file to style it similarly but more muted

const PaymentCancelled = () => {
  return (
    <div className="payment-cancelled-wrapper">
      <div className="cancelled-container">
        <div className="cancelled-icon-wrapper">
          <div className="cancelled-icon">
            <svg viewBox="0 0 52 52" className="crossmark">
              <circle
                className="crossmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
              />
              <path
                className="crossmark-cross1"
                fill="none"
                d="M16 16 L36 36"
              />
              <path
                className="crossmark-cross2"
                fill="none"
                d="M36 16 L16 36"
              />
            </svg>
          </div>
        </div>

        <div className="cancelled-content">
          <h1 className="cancelled-title">Payment Cancelled</h1>
          <p className="cancelled-message">
            Your payment was not completed. If this was a mistake, you can try again below.
          </p>
        </div>

        <div className="action-section">
          <Link to="/courses" className="cta-button muted">
            Back to Courses
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;
