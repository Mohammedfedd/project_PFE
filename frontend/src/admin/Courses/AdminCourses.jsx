import React, { useState, useEffect } from "react";
import Layout from "../Utils/Layout";
import { useNavigate } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import "./admincourses.css";
import toast from "react-hot-toast";
import axios from "axios";
import { server } from "../../main";

const AdminCourses = ({ user }) => {
  const navigate = useNavigate();

  if (user && user.role !== "admin") return navigate("/");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [createdBy, setCreatedBy] = useState("");
  const [duration, setDuration] = useState("");
  const [image, setImage] = useState("");
  const [imagePrev, setImagePrev] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { courses, fetchCourses } = CourseData();

  // New state for categories fetched from backend
  const [categories, setCategories] = useState([]);

  // Fetch categories from backend
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
    fetchCourses();
    fetchCategories();  // fetch categories on mount
  }, []);

  const changeImageHandler = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setImagePrev(reader.result);
      setImage(file);
    };
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    const myForm = new FormData();
    myForm.append("title", title);
    myForm.append("description", description);
    myForm.append("category", category);
    myForm.append("price", price);
    myForm.append("createdBy", createdBy);
    myForm.append("duration", duration);
    myForm.append("file", image);

    try {
      const { data } = await axios.post(`${server}/api/course/new`, myForm, {
        headers: { token: localStorage.getItem("token") },
      });
      toast.success(data.message);
      setBtnLoading(false);
      await fetchCourses();
      setImage("");
      setTitle("");
      setDescription("");
      setDuration("");
      setImagePrev("");
      setCreatedBy("");
      setPrice("");
      setCategory("");
      setSearchTerm("");
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
      setBtnLoading(false);
    }
  };

  const toggleComingSoon = async (id) => {
    try {
      await axios.put(
        `${server}/api/course/${id}/toggle-coming-soon`,
        {},
        { headers: { token: localStorage.getItem("token") } }
      );
      await fetchCourses();
    } catch {
      toast.error("Failed to toggle coming soon");
    }
  };

  const deleteHandler = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const { data } = await axios.delete(`${server}/api/course/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      toast.success(data.message);
      await fetchCourses();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filteredCourses = courses
    .filter((course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <Layout>
      <div className="admin-courses">
        <div className="left">
          <h1>All Courses</h1>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              marginBottom: 12,
              padding: 6,
              width: "100%",
              boxSizing: "border-box",
              borderRadius: 4,
              border: "1px solid #ccc",
            }}
          />
          {filteredCourses.length > 0 ? (
            <table className="courses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Created By</th>
                  <th>Duration (weeks)</th>
                  <th>Coming Soon</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course._id}>
                    <td>{course.title}</td>
                    <td>{course.description}</td>
                    <td>{course.category}</td>
                    <td>{course.price}</td>
                    <td>{course.createdBy}</td>
                    <td>{course.duration}</td>
                    <td>
                      <button
                        style={{
                          backgroundColor: course.comingSoon ? "#d43f8d" : "#7e3ff2",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                        onClick={() => toggleComingSoon(course._id)}
                      >
                        {course.comingSoon ? "Yes" : "No"}
                      </button>
                    </td>
                    <td>
                      <button
                        onClick={() => deleteHandler(course._id)}
                        style={{
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          cursor: "pointer",
                          marginRight: 6,
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => navigate(`/lectures/${course._id}`)}
                        style={{
                          backgroundColor: "#7e3ff2",
                          color: "white",
                          border: "none",
                          borderRadius: 6,
                          padding: "6px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Add Lectures
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No Courses Yet</p>
          )}
        </div>

        <div className="right">
          <div className="add-course">
            <h2>Add Course</h2>
            <form onSubmit={submitHandler} className="add-course-form">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
              <label htmlFor="createdBy">Created By</label>
              <input
                type="text"
                id="createdBy"
                value={createdBy}
                onChange={(e) => setCreatedBy(e.target.value)}
                required
              />
              <label htmlFor="duration">Duration (weeks)</label>
              <input
                type="number"
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                required
              />
              <label htmlFor="file">Course Image</label>
              <input
                type="file"
                id="file"
                required
                onChange={(e) => changeImageHandler(e)}
              />
              {imagePrev && (
                <img src={imagePrev} alt="Preview" className="image-preview" />
              )}
              <button type="submit" disabled={btnLoading} className="common-btn">
                {btnLoading ? "Please Wait..." : "Add Course"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminCourses;
