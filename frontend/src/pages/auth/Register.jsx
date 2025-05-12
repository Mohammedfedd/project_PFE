import React, { useState, useRef } from "react";
import "./auth.css";
import { Link } from "react-router-dom";

// Use a generic Gravatar as the default profile picture
const defaultPfp = "https://www.gravatar.com/avatar/?d=mp&s=200";

const Register = () => {
  const [preview, setPreview] = useState(defaultPfp); // Default PFP as the initial state
  const fileInputRef = useRef(null);

  // Handle the image change when the user selects a file
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Set the selected image as preview
      };
      reader.readAsDataURL(file); // Read the file as base64
    }
  };

  // Trigger the file input when the user clicks the profile picture
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Register</h2>
        <form encType="multipart/form-data">
          {/* Profile Picture */}
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <img
              src={preview} // Display the preview (default or selected)
              alt="Profile Preview"
              onClick={triggerFileInput} // Trigger file input on click
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
              name="profilePicture"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }} // Hide the default file input
              onChange={handleImageChange} // Handle file input change
            />
          </div>

          {/* Other Form Fields */}
          <label htmlFor="firstName">First Name</label>
          <input type="text" name="firstName" required />

          <label htmlFor="lastName">Last Name</label>
          <input type="text" name="lastName" />

          <label htmlFor="email">Email</label>
          <input type="email" name="email" required />

          <label htmlFor="phone">Phone</label>
          <input type="text" name="phone" />

          <label htmlFor="password">Password</label>
          <input type="password" name="password" required />

          <button type="submit" className="common-btn">
            Register
          </button>
        </form>
        <p>
          Have an account already? <Link to="/login">Sign up!</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
