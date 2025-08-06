import React, { useState, useEffect } from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();
  const [progress, setProgress] = useState(0);
  const [certificateUrl, setCertificateUrl] = useState(null);

  useEffect(() => {
    if (isAuth && user?.subscription.includes(course._id)) {
      const fetchProgressAndCertificate = async () => {
        try {
          const { data } = await axios.get(
            `${server}/api/user/progress?course=${course._id}`,
            {
              headers: {
                token: localStorage.getItem("token"),
              },
            }
          );

          if (data.success) {
            const totalLectures = data.allLectures?.length || 0;
            const totalQuizzes = data.allQuizzes?.length || 0;
            const totalItems = totalLectures + totalQuizzes;

            const completedLectures = data.completedLectures?.length || 0;
            const completedQuizzes = data.completedQuizzes?.length || 0;
            const completedItems = completedLectures + completedQuizzes;

            const percentage =
              totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

            setProgress(percentage);

            const certRes = await axios.get(`${server}/api/user/certificates`, {
              headers: { token: localStorage.getItem("token") },
            });

            if (certRes.data.success) {
              const courseCerts = certRes.data.certificates.filter(
                (c) => c.courseId._id === course._id
              );

              if (courseCerts.length > 0) {
                courseCerts.sort(
                  (a, b) => new Date(b.issuedAt) - new Date(a.issuedAt)
                );
                setCertificateUrl(courseCerts[0].certificateUrl);
              } else {
                setCertificateUrl(null);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching progress or certificates:", error);
        }
      };

      fetchProgressAndCertificate();
    }
  }, [isAuth, user, course._id]);

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: {
            token: localStorage.getItem("token"),
          },
        });

        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response?.data?.message || "Delete failed");
      }
    }
  };

  return (
    <div className="course-card" style={{ position: "relative" }}>
      {course.comingSoon && user?.role === "admin" && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "#d43f8d",
            color: "white",
            padding: "4px 8px",
            borderRadius: "4px",
            fontWeight: "700",
            fontSize: "0.8rem",
            zIndex: 10,
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          COMING SOON
        </div>
      )}

      <img src={`${server}/${course.image}`} alt="" className="course-image" />
      <h3>{course.title}</h3>
      <p>Instructor - {course.createdBy}</p>
      <p>Duration - {course.duration} weeks</p>
      <p>Price - {course.price} MAD</p>

      {isAuth ? (
        <>
          {user && user.role !== "admin" ? (
            <>
              {user.subscription.includes(course._id) ? (
                <>
                  <button
                    onClick={() => navigate(`/course/study/${course._id}`)}
                    className="common-btn"
                  >
                    Study
                  </button>

                  {progress === 100 && certificateUrl ? (
                    <button
                      onClick={() => window.open(`${server}${certificateUrl}`, "_blank")}
                      className="common-btn"
                      style={{ backgroundColor: "#28a745", marginTop: "8px" }}
                    >
                      View Certificate Again
                    </button>
                  ) : progress < 50 ? (
                    <button
                      onClick={() => navigate(`/refund/${course._id}`)}
                      className="common-btn"
                      style={{ backgroundColor: "#ff4d4f", marginTop: "8px" }}
                    >
                      Request Refund
                    </button>
                  ) : null}
                </>
              ) : (
                <button
                  onClick={() => navigate(`/course/${course._id}`)}
                  className="common-btn"
                >
                  Get Started
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate(`/course/study/${course._id}`)}
              className="common-btn"
            >
              Study
            </button>
          )}
        </>
      ) : (
        <button onClick={() => navigate("/login")} className="common-btn">
          Get Started
        </button>
      )}

      <br />

      {user && user.role === "admin" && (
        <button
          onClick={() => deleteHandler(course._id)}
          className="common-btn"
          style={{ background: "red", marginTop: "8px" }}
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default CourseCard;
