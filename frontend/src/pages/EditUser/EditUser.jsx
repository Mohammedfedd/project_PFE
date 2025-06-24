import React, { useState, useEffect, useRef } from "react";
import { UserData } from "../../context/UserContext";

const defaultPfp = "https://www.gravatar.com/avatar/?d=mp&s=200";

const EditUser = () => {
  const { user, editUserProfile, btnLoading } = UserData();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [preview, setPreview] = useState(defaultPfp);
  const [pfpFile, setPfpFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user && user.profilePicture) {
      setPreview(user.profilePicture);
    } else {
      setPreview(defaultPfp);
    }
  }, [user]);

  const triggerFileInput = () => fileInputRef.current.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPfpFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
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

    const { currentPassword, newPassword, confirmNewPassword } = formData;

    if (!currentPassword) {
      return setStatus({ type: "error", message: "Current password is required." });
    }

    if (newPassword && newPassword !== confirmNewPassword) {
      return setStatus({ type: "error", message: "New passwords do not match." });
    }

    const form = new FormData();
    form.append("password", currentPassword);
    if (newPassword) form.append("newPassword", newPassword);
    if (pfpFile) form.append("profilePicture", pfpFile);

    try {
      await editUserProfile(form);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      });
      setPfpFile(null);
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

        <form onSubmit={handleSubmit} encType="multipart/form-data">
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

          <label>Current Password (required)</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            required
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
