import React from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Courses = () => {
  const { courses } = CourseData();

  return (
    <div className="courses-page">
      <div className="courses-header">
        <h1>Explore Our Courses</h1>
        <p>Expand your knowledge with our expertly crafted curriculum</p>
      </div>

      <div className="courses-container">
        {courses && courses.length > 0 ? (
          <div className="course-grid">
            {courses.map((course) => (
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