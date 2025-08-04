import React, { useEffect, useState } from "react";
import "./users.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Layout from "../Utils/Layout";
import toast from "react-hot-toast";

const AdminUsers = ({ user }) => {
  const navigate = useNavigate();

  // Restrict access: only allow users with role "admin" or "superadmin" to access this page
  if (user && user.role !== "admin" && user.role !== "superadmin") {
    navigate("/");
    return null; // prevent rendering while redirecting
  }

  const [users, setUsers] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedRole, setSelectedRole] = useState("");

  async function fetchUsers() {
    try {
      const { data } = await axios.get(`${server}/api/users`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      setUsers(data.users);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const startEdit = (id, currentRole) => {
    setEditingId(id);
    setSelectedRole(currentRole);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedRole("");
  };

  const updateRole = async (id) => {
    if (!selectedRole) {
      toast.error("Please select a role");
      return;
    }

    try {
      const { data } = await axios.put(
        `${server}/api/user/${id}`,
        { role: selectedRole },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      toast.success(data.message);
      setEditingId(null);
      setSelectedRole("");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (id) => {
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      const { data } = await axios.delete(`${server}/api/user/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });

      toast.success(data.message);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete user");
    }
  };

  return (
    <Layout>
      <div className="users">
        <h1>All Users</h1>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users &&
              users
                .filter((u) => u.role !== "superadmin") // Exclude superadmin users here
                .map((e, i) => (
                  <tr key={e._id}>
                    <td>{i + 1}</td>
                    <td>{e.firstName}</td>
                    <td>{e.lastName}</td>
                    <td>{e.email}</td>
                    <td>
                      {editingId === e._id ? (
                        <select
                          value={selectedRole}
                          onChange={(e) => setSelectedRole(e.target.value)}
                          className="role-select"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        e.role
                      )}
                    </td>
                    <td>
                      {editingId === e._id ? (
                        <>
                          <button
                            onClick={() => updateRole(e._id)}
                            className="common-btn save-btn"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="common-btn cancel-btn"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(e._id, e.role)}
                            className="common-btn edit-btn"
                          >
                            Edit Role
                          </button>
                          <button
                            onClick={() => deleteUser(e._id)}
                            className="common-btn delete-btn"
                            style={{ marginLeft: "8px", backgroundColor: "#e74c3c", color: "#fff" }}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminUsers;
