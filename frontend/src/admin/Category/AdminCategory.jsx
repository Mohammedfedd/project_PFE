import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { server } from "../../main"; // adjust if needed
import Layout from "../Utils/Layout";
import "./category.css";

const AdminCategory = () => {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(`${server}/api/categories`, {
        headers: { token: localStorage.getItem("token") },
      });
      setCategories(Array.isArray(data.categories) ? data.categories : []);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const addCategory = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Category name is required");

    try {
      await axios.post(
        `${server}/api/category`,
        { name },
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success("Category added");
      setName("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding category");
    }
  };

  const startEdit = (id, currentName) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const saveEdit = async (id) => {
    if (!editingName.trim()) return toast.error("Category name is required");

    try {
      await axios.put(
        `${server}/api/category/${id}`,
        { name: editingName },
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success("Category updated");
      setEditingId(null);
      setEditingName("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "Error updating category");
    }
  };

  return (
    <Layout>
      <div className="category-container">
        <h2>Manage Categories</h2>

        <form onSubmit={addCategory} className="category-form">
          <input
            type="text"
            placeholder="New category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="category-input"
          />
          <button type="submit" className="btn btn-add">
            Add
          </button>
        </form>

        <table className="category-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Category Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((cat, i) => (
                <tr key={cat._id}>
                  <td>{i + 1}</td>
                  <td>
                    {editingId === cat._id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="category-edit-input"
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td>
                    {editingId === cat._id ? (
                      <>
                        <button
                          onClick={() => saveEdit(cat._id)}
                          className="btn btn-save"
                        >
                          Save
                        </button>
                        <button onClick={cancelEdit} className="btn btn-cancel">
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(cat._id, cat.name)}
                        className="btn btn-edit"
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default AdminCategory;
