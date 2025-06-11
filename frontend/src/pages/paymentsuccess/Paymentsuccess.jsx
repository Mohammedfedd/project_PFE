import React, { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [showContent, setShowContent] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const hasVerified = useRef(false);

  useEffect(() => {
    if (sessionId && !hasVerified.current) {
      hasVerified.current = true;
      axios
        .post(`http://localhost:5000/api/verification/${sessionId}`, {
          withCredentials: true,
        })
        .then((res) => {
          console.log("✅ Payment verified:", res.data);
        })
        .catch((err) => {
          console.error(
            "❌ Payment verification failed:",
            err.response?.data || err.message
          );
        });
    }

    // Staggered animations
    setTimeout(() => setShowContent(true), 300);
    setTimeout(() => setShowConfetti(true), 800);
    setTimeout(() => setShowEmoji(true), 1200);
    setTimeout(() => setShowButton(true), 1800);
    setTimeout(() => setShowInfo(true), 2200);
  }, [sessionId]);

  // Confetti pieces
  const confettiPieces = Array.from({ length: 100 }, (_, i) => {
    const shapes = ["rect", "circle", "triangle"];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    const size = `${Math.random() * 10 + 5}px`;
    const rotation = `${Math.random() * 360}deg`;
    const duration = `${Math.random() * 3 + 2}s`;

    return (
      <div
        key={i}
        className={`confetti-piece ${shape}`}
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * -20}%`,
          animationDelay: `${Math.random() * 2}s`,
          animationDuration: duration,
          transform: `rotate(${rotation})`,
          width: size,
          height: size,
          backgroundColor: [
            "#ff6b6b",
            "#4ecdc4",
            "#45b7d1",
            "#96ceb4",
            "#feca57",
            "#ff9ff3",
            "#ffbe76",
            "#ff7979",
            "#badc58",
            "#dff9fb",
            "#f9ca24",
            "#eb4d4b",
          ][Math.floor(Math.random() * 12)],
          opacity: Math.random() * 0.7 + 0.3,
        }}
      />
    );
  });

  // Floating orbs
  const floatingOrbs = Array.from({ length: 8 }, (_, i) => {
    const size = `${Math.random() * 200 + 50}px`;
    const posX = `${Math.random() * 100}%`;
    const posY = `${Math.random() * 100}%`;
    const delay = `${Math.random() * 5}s`;
    const duration = `${Math.random() * 20 + 10}s`;

    return (
      <div
        key={`orb-${i}`}
        className="gradient-orb"
        style={{
          width: size,
          height: size,
          left: posX,
          top: posY,
          animationDelay: delay,
          animationDuration: duration,
          background: `radial-gradient(circle, 
            rgba(${Math.floor(Math.random() * 255)},${Math.floor(
          Math.random() * 255
        )},${Math.floor(Math.random() * 255)},0.3) 0%, 
            rgba(${Math.floor(Math.random() * 255)},${Math.floor(
          Math.random() * 255
        )},${Math.floor(Math.random() * 255)},0) 70%)`,
        }}
      />
    );
  });

  return (
    <div className="payment-success-wrapper">
      {/* Animated Background */}
      <div className="animated-bg">{floatingOrbs}</div>

      {/* Confetti */}
      {showConfetti && <div className="confetti-container">{confettiPieces}</div>}

      {/* Main Content */}
      <div className={`payment-success-container ${showContent ? "show" : ""}`}>
        {/* Success Icon */}
        <div className="success-icon-wrapper">
          <div className="success-icon">
            <svg viewBox="0 0 52 52" className="checkmark">
              <circle
                className="checkmark-circle"
                cx="26"
                cy="26"
                r="25"
                fill="none"
                strokeDasharray="157"
                strokeDashoffset="157"
                style={showContent ? { strokeDashoffset: 0 } : {}}
              />
              <path
                className="checkmark-check"
                fill="none"
                d="m14.1 27.2l7.1 7.2 16.7-16.8"
                strokeDasharray="50"
                strokeDashoffset="50"
                style={
                  showContent
                    ? {
                        strokeDashoffset: 0,
                        transition: "stroke-dashoffset 0.8s ease-in-out 0.3s",
                      }
                    : {}
                }
              />
            </svg>
            <div className="icon-pulse"></div>
          </div>
        </div>

        {/* Success Message */}
        <div className="success-content">
          <h1 className="success-title">
            <span className={`party-emoji ${showEmoji ? "pop" : ""}`}>🎉</span>
            <span className="title-text">
              <span className="text-part" style={{ transitionDelay: "0.1s" }}>
                Payment
              </span>{" "}
              <span className="text-part" style={{ transitionDelay: "0.2s" }}>
                Successful!
              </span>
            </span>
          </h1>
          <p className="success-message">
            <span className="message-line" style={{ transitionDelay: "0.3s" }}>
              Congratulations! Your purchase has been completed successfully.
            </span>
            <br />
            <span className="message-line" style={{ transitionDelay: "0.4s" }}>
              You now have access to your new courses.
            </span>
          </p>
        </div>

        {/* Action Button */}
        <div className={`action-section ${showButton ? "show" : ""}`}>
          <Link to="/mycourses" className="cta-button">
            <span className="button-text">Go to My Courses</span>
            <span className="button-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                />
              </svg>
            </span>
            <span className="button-hover-effect"></span>
          </Link>
        </div>

        {/* Additional Info */}
        <div className={`additional-info ${showInfo ? "show" : ""}`}>
          <p>
            <svg
              className="envelope-icon"
              viewBox="0 0 24 24"
              width="16"
              height="16"
            >
              <path
                fill="currentColor"
                d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6M20 6L12 11L4 6H20M20 18H4V8L12 13L20 8V18Z"
              />
            </svg>
            A confirmation email has been sent to your inbox
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
