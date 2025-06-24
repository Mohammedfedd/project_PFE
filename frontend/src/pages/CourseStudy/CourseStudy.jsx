import React, { useEffect } from "react";
import "./coursestudy.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";

const CourseStudy = ({ user }) => {
  const params = useParams();
  const { fetchCourse, course } = CourseData();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== "admin" && !user.subscription.includes(params.id)) {
      navigate("/");
    } else {
      fetchCourse(params.id);
    }
  }, [params.id, user]);

  if (!course) {
    return <div className="course-loading">Loading...</div>;
  }

  return (
    <section className="study-hero">
      <div className="study-glass">
        <div className="study-banner">
          <img src={`${server}/${course.image}`} alt={course.title} className="study-img" />
          <span className="study-badge">Course</span>
        </div>

        <div className="study-content">
          <h1 className="study-title">{course.title}</h1>
          <p className="study-description">{course.description}</p>

          <div className="study-meta">
            <p><strong>Instructor:</strong> {course.createdBy}</p>
            <p><strong>Duration:</strong> {course.duration} weeks</p>
          </div>

          <Link to={`/lectures/${course._id}`} className="study-btn">
            <span>▶</span>
            <div>
              <strong>Start Learning</strong>
              <p className="btn-subtext">Access all lectures</p>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CourseStudy;
