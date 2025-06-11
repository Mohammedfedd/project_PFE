import React, { useState, useMemo, useEffect } from "react";
import "./dashboard.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";

const Dashboard = () => {
  const { mycourse, fetchMyCourse } = CourseData();
  const [activeFilter, setActiveFilter] = useState('all');

  // Fetch enrolled courses when Dashboard mounts
  useEffect(() => {
    fetchMyCourse();
  }, [fetchMyCourse]);

  // Filter courses based on active filter
  const filteredCourses = useMemo(() => {
    if (!mycourse || mycourse.length === 0) return [];
    
    switch (activeFilter) {
      case 'completed':
        return mycourse.filter(course => course.completed || course.progress === 100);
      case 'inProgress':
        return mycourse.filter(course => !course.completed && course.progress !== 100 && (course.progress > 0 || course.started));
      case 'all':
      default:
        return mycourse;
    }
  }, [mycourse, activeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!mycourse || mycourse.length === 0) {
      return { total: 0, completed: 0, inProgress: 0 };
    }
    
    const completed = mycourse.filter(course => course.completed || course.progress === 100).length;
    const inProgress = mycourse.filter(course => !course.completed && course.progress !== 100 && (course.progress > 0 || course.started)).length;
    
    return {
      total: mycourse.length,
      completed,
      inProgress
    };
  }, [mycourse]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">My Learning Journey</h1>
          <p className="dashboard-subtitle">
            Track your progress and continue learning
          </p>
          <div className="stats-container">
            <div className="stat-item">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Enrolled Courses</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.inProgress}</span>
              <span className="stat-label">In Progress</span>
            </div>
          </div>
        </div>
        <div className="header-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>
      </div>

      <div className="dashboard-main">
        <div className="section-header">
          <h2 className="section-title">
            Your Courses 
            {activeFilter !== 'all' && (
              <span className="filter-count">({filteredCourses.length})</span>
            )}
          </h2>
          <div className="section-actions">
            <button 
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              All Courses
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'inProgress' ? 'active' : ''}`}
              onClick={() => handleFilterChange('inProgress')}
            >
              In Progress
            </button>
            <button 
              className={`filter-btn ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => handleFilterChange('completed')}
            >
              Completed
            </button>
          </div>
        </div>

        <div className="dashboard-content">
          {filteredCourses && filteredCourses.length > 0 ? (
            <>
              <div className="courses-grid">
                {filteredCourses.map((course) => (
                  <div key={course._id} className="course-wrapper">
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19Z"
                    fill="currentColor"
                    opacity="0.3"
                  />
                  <path
                    d="M7 9H17V11H7V9ZM7 13H14V15H7V13Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h3 className="empty-title">
                {activeFilter === 'all' 
                  ? 'No courses enrolled yet'
                  : activeFilter === 'completed'
                  ? 'No completed courses yet'
                  : 'No courses in progress'
                }
              </h3>
              <p className="empty-description">
                {activeFilter === 'all' 
                  ? 'Start your learning journey by exploring our course catalog'
                  : activeFilter === 'completed'
                  ? 'Complete some courses to see them here'
                  : 'Start learning to see your progress here'
                }
              </p>
              {activeFilter === 'all' && (
                <button className="cta-button">
                  <span>Browse Courses</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12H19M19 12L12 5M19 12L12 19"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
