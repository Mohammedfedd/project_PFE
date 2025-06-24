import React, { useState, useEffect, useRef } from "react";
import { UserData } from "../../context/UserContext";

const defaultPfp = "https://www.gravatar.com/avatar/?d=mp&s=200";

const EditUser = () => {
  const { user, editUserProfile, btnLoading } = UserData();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    profilePicture: "", // base64 string
  });

  const [preview, setPreview] = useState(defaultPfp);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    if (user && user.profilePicture) {
      setPreview(user.profilePicture);
      setFormData((prev) => ({ ...prev, profilePicture: user.profilePicture }));
    } else {
      setPreview(defaultPfp);
    }
  }, [user]);

  const triggerFileInput = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData((prev) => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    const { currentPassword, newPassword, confirmNewPassword, profilePicture } = formData;

    if (!currentPassword && !profilePicture) {
      return setStatus({
        type: "error",
        message: "Either password or profile picture must be provided.",
      });
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      return setStatus({ type: "error", message: "New passwords do not match." });
    }

    const body = {
      currentPassword,
      profilePicture, // base64 string
    };
    if (newPassword) {
      body.newPassword = newPassword;
    }

    try {
      await editUserProfile(body); // sending JSON with base64 image string
      setStatus({ type: "success", message: "Profile updated successfully!" });
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
        profilePicture,
      });
    } catch (error) {
      setStatus({ type: "error", message: "Update failed. Try again." });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Edit Profile</h2>

        {status.message && (
          <p style={{ color: status.type === "error" ? "red" : "green" }}>
            {status.message}
          </p>
        )}

        <form onSubmit={handleSubmit}>
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

          <label>Current Password (required for password change)</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required={!!formData.newPassword}
          />

          <label>New Password (leave blank to keep current)</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
          />

          <label>Confirm New Password</label>
          <input
            type="password"
            name="confirmNewPassword"
            value={formData.confirmNewPassword}
            onChange={handleInputChange}
          />

          <button type="submit" className="common-btn" disabled={btnLoading}>
            {btnLoading ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
