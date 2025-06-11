import React, { useEffect, useState } from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import Loading from "../../components/loading/Loading";

const Courses = () => {
  const { courses, loading, fetchCourses, fetchMyCourse } = CourseData();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
    fetchMyCourse();
  }, []);

  // Filter courses by title based on search term (case insensitive)
  const filteredCourses = courses.filter((course) =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Explore Our Courses</h1>
        <p>Expand your knowledge with our expertly crafted curriculum</p>
      </div>

      {/* Search bar */}
      <div className="courses-search" style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search courses by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            fontSize: "16px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
        />
      </div>

      <div className="courses-container">
        {filteredCourses && filteredCourses.length > 0 ? (
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}
          </div>
        ) : (
          <div className="no-courses">
            <div className="no-courses-content">
              <i className="fas fa-book-open"></i>
              <h3>No Courses Available Yet</h3>
              <p>Check back later for new courses!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
