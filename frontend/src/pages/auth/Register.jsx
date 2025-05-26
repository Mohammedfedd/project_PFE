import React, { useState, useRef } from "react";
import "./auth.css";
import { Link, useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";

const defaultPfp = "https://www.gravatar.com/avatar/?d=mp&s=200";

const Register = () => {
  const navigate = useNavigate();
  const { btnLoading, registerUser } = UserData();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [preview, setPreview] = useState(defaultPfp);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    await registerUser(firstName, lastName, email, phone, preview, password, navigate);
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={submitHandler} encType="multipart/form-data">
          {/* Profile Picture */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={preview}
              alt="Profile"
              onClick={triggerFileInput}
              style={{
                width: "100px",
                height: "100px",
                borderRadius: "50%",
                objectFit: "cover",
                cursor: "pointer",
                border: "2px solid #ccc",
              }}
            />
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {/* First Name */}
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          {/* Last Name */}
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />

          {/* Email */}
          <label htmlFor="email">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Phone */}
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Password */}
          <label htmlFor="password">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Submit Button */}
          <button type="submit" disabled={btnLoading} className="common-btn">
            {btnLoading ? "Please Wait..." : "Register"}
          </button>
        </form>

        <p>
          have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
