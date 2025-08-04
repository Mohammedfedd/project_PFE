import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../Utils/Layout";
import { server } from "../../main";
import "./admineducators.css";

const AdminEducator = () => {
  const [educators, setEducators] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- New state for search input
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState(""); // base64 string or URL
  const [profilePreview, setProfilePreview] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    profilePicture: "",
  });
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchEducators = async () => {
    try {
      const { data } = await axios.get(`${server}/api/educators`, {
        headers: { token: localStorage.getItem("token") },
      });
      setEducators(data.educators || []);
    } catch (error) {
      toast.error("Failed to load educators");
    }
  };

  useEffect(() => {
    fetchEducators();
  }, []);

  const handleProfileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result);
      setProfilePreview(reader.result);
      setEditingData((prev) => ({
        ...prev,
        profilePicture: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setEmail("");
    setPhone("");
    setProfilePicture("");
    setProfilePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const addEducator = async (e) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim()) {
      return toast.error("First name and email are required");
    }
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/educator`,
        {
          firstName,
          lastName,
          email,
          phone,
          profilePicture,
        },
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      toast.success(data.message || "Educator added");
      resetForm();
      await fetchEducators();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add educator");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (educator) => {
    setEditingId(educator._id);
    setEditingData({
      firstName: educator.firstName || "",
      lastName: educator.lastName || "",
      email: educator.email || "",
      phone: educator.phone || "",
      profilePicture: educator.profilePicture || "",
    });
    setProfilePreview(educator.profilePicture || "");
    setProfilePicture("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      profilePicture: "",
    });
    setProfilePicture("");
    setProfilePreview("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const saveEdit = async () => {
    if (!editingData.firstName.trim() || !editingData.email.trim()) {
      return toast.error("First name and email are required");
    }
    setLoading(true);
    try {
      const { data } = await axios.put(
        `${server}/api/educator/${editingId}`,
        {
          firstName: editingData.firstName,
          lastName: editingData.lastName,
          email: editingData.email,
          phone: editingData.phone,
          profilePicture: profilePicture || editingData.profilePicture,
        },
        {
          headers: { token: localStorage.getItem("token") },
        }
      );
      toast.success(data.message || "Educator updated");
      cancelEdit();
      await fetchEducators();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update educator");
    } finally {
      setLoading(false);
    }
  };

  const deleteEducator = async (id) => {
    if (!window.confirm("Are you sure you want to delete this educator?")) return;
    try {
      const { data } = await axios.delete(`${server}/api/educator/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      toast.success(data.message || "Educator deleted");
      await fetchEducators();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete educator");
    }
  };

  // Filter educators based on search term (case-insensitive)
  const filteredEducators = educators.filter((educator) => {
    const search = searchTerm.toLowerCase();
    return (
      educator.firstName.toLowerCase().includes(search) ||
      educator.lastName.toLowerCase().includes(search) ||
      educator.email.toLowerCase().includes(search)
    );
  });

  return (
    <Layout>
      <div className="admin-educator-container">
        <h2>Manage Educators</h2>

        <form onSubmit={addEducator} className="educator-form">
          <input
            type="text"
            placeholder="First Name *"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="tel"
            placeholder="Phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={handleProfileChange}
            ref={fileInputRef}
          />
          {profilePreview && (
            <img
              src={profilePreview}
              alt="Profile Preview"
              className="profile-preview"
              style={{ maxWidth: 100, marginTop: 10, borderRadius: "50%" }}
            />
          )}
          <button type="submit" disabled={loading} className="btn btn-add">
            {loading ? "Adding..." : "Add Educator"}
          </button>
        </form>

        {/* Search bar */}
        <div style={{ margin: "20px 0" }}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "8px 12px",
              width: "100%",
              maxWidth: 400,
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
        </div>

        {/* Scrollable wrapper */}
        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
          <table className="educator-table" style={{ minWidth: "700px" }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Profile</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEducators.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: "center" }}>
                    No educators found.
                  </td>
                </tr>
              ) : (
                filteredEducators.map((educator, i) => (
                  <tr key={educator._id}>
                    <td>{i + 1}</td>

                    <td>
                      {editingId === educator._id ? (
                        <>
                          <img
                            src={profilePreview || "/default-profile.png"}
                            alt="Profile Preview"
                            onClick={() =>
                              fileInputRef.current && fileInputRef.current.click()
                            }
                            style={{
                              width: 50,
                              height: 50,
                              borderRadius: "50%",
                              cursor: "pointer",
                              objectFit: "cover",
                              border: "2px solid #ccc",
                            }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileChange}
                            ref={fileInputRef}
                            style={{ display: "none" }}
                          />
                        </>
                      ) : (
                        <img
                          src={educator.profilePicture || "/default-profile.png"}
                          alt="Profile"
                          style={{ width: 50, height: 50, borderRadius: "50%" }}
                        />
                      )}
                    </td>

                    <td>
                      {editingId === educator._id ? (
                        <input
                          type="text"
                          value={editingData.firstName}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              firstName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        educator.firstName
                      )}
                    </td>

                    <td>
                      {editingId === educator._id ? (
                        <input
                          type="text"
                          value={editingData.lastName}
                          onChange={(e) =>
                            setEditingData({
                              ...editingData,
                              lastName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        educator.lastName
                      )}
                    </td>

                    <td>
                      {editingId === educator._id ? (
                        <input
                          type="email"
                          value={editingData.email}
                          onChange={(e) =>
                            setEditingData({ ...editingData, email: e.target.value })
                          }
                        />
                      ) : (
                        educator.email
                      )}
                    </td>

                    <td>
                      {editingId === educator._id ? (
                        <input
                          type="tel"
                          value={editingData.phone}
                          onChange={(e) =>
                            setEditingData({ ...editingData, phone: e.target.value })
                          }
                        />
                      ) : (
                        educator.phone
                      )}
                    </td>

                    <td>
                      {editingId === educator._id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            disabled={loading}
                            className="btn btn-save"
                          >
                            Save
                          </button>
                          <button onClick={cancelEdit} className="btn btn-cancel">
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(educator)}
                            className="btn btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteEducator(educator._id)}
                            className="btn btn-delete"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default AdminEducator;
