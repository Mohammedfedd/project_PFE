import React, { useEffect } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { UserData } from "../../context/UserContext";
import { server } from "../../main";

const CourseDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = UserData();
  const { fetchCourse, course } = CourseData();

  useEffect(() => {
    fetchCourse(id);
  }, [id]);

  return (
    <div className="course-description-wrapper">
      {course && (
        <div className="course-description">
          {/* Hero Section */}
          <div className="course-hero">
            <div className="course-image-container">
              <img
                src={`${server}/${course.image}`}
                alt={course.title}
                className="course-image"
              />
            </div>

            <div className="course-header">
              <h1>{course.title}</h1>

              <div className="course-meta">
                <span className="instructor">
                  <i className="fas fa-user-tie"></i> {course.createdBy}
                </span>
                <span className="duration">
                  <i className="far fa-clock"></i> {course.duration} weeks
                </span>

              </div>

              <div className="price-badge">{course.price} MAD</div>
            </div>
          </div>

          {/* Content Section */}
          <div className="course-content">
            <h2>Course Description</h2>
            <p className="description">{course.description}</p>

            <div className="action-container">
              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="study-btn"
                >
                  <i className="fas fa-play-circle"></i> Continue Learning
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="enroll-btn"
                >
                  <i className="fas fa-graduation-cap"></i> Enroll Now
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDescription;
