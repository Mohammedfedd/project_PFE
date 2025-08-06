import React, { useState, useMemo, useEffect, useCallback } from "react";
import "./dashboard.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import Loading from "../../components/loading/Loading";
import axios from "axios";
import { server } from "../../main";

const Dashboard = () => {
  const { mycourse, fetchMyCourse } = CourseData();
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [coursesWithProgress, setCoursesWithProgress] = useState([]);

  // Memoized progress calculation
  const calculateCourseProgress = useCallback(async (course) => {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${course._id}`,
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      const totalLectures = data.allLectures?.length || 0;
      const totalQuizzes = data.allQuizzes?.length || 0;
      const totalItems = totalLectures + totalQuizzes;

      const completedLectures = data.completedLectures?.length || 0;
      const completedQuizzes = data.completedQuizzes?.length || 0;
      const completedItems = completedLectures + completedQuizzes;

      const progress = totalItems > 0 
        ? Math.round((completedItems / totalItems) * 100) 
        : 0;

      return {
        ...course,
        progress,
        isCompleted: progress === 100,
        inProgress: progress > 0 && progress < 100
      };
    } catch (error) {
      console.error(`Progress error for course ${course._id}:`, error);
      return {
        ...course,
        progress: 0,
        isCompleted: false,
        inProgress: false
      };
    }
  }, []);

  // Fetch data only when needed
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!mycourse || mycourse.length === 0) {
        await fetchMyCourse();
      }

      if (isMounted && mycourse && mycourse.length > 0) {
        setLoading(true);
        try {
          const progressPromises = mycourse.map(course => 
            calculateCourseProgress(course)
          );
          const updatedCourses = await Promise.all(progressPromises);
          if (isMounted) {
            setCoursesWithProgress(updatedCourses);
          }
        } catch (error) {
          console.error("Failed to load progress:", error);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [fetchMyCourse, mycourse?.length, calculateCourseProgress]);

  // Memoized filtered courses
  const filteredCourses = useMemo(() => {
    if (!coursesWithProgress || coursesWithProgress.length === 0) return [];

    return coursesWithProgress.filter(course => {
      switch (activeFilter) {
        case 'completed':
          return course.isCompleted;
        case 'inProgress':
          return course.inProgress;
        default:
          return true;
      }
    });
  }, [coursesWithProgress, activeFilter]);

  // Memoized stats
  const stats = useMemo(() => {
    if (!coursesWithProgress || coursesWithProgress.length === 0) {
      return { total: 0, completed: 0, inProgress: 0 };
    }

    return {
      total: coursesWithProgress.length,
      completed: coursesWithProgress.filter(c => c.isCompleted).length,
      inProgress: coursesWithProgress.filter(c => c.inProgress).length,
    };
  }, [coursesWithProgress]);

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  if (loading) {
    return <Loading />;
  }

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
          {filteredCourses.length > 0 ? (
            <div className="courses-grid">
              {filteredCourses.map((course) => (
                <CourseCard 
                  key={course._id} 
                  course={course} 
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <h3 className="empty-title">
                {activeFilter === 'all'
                  ? 'No courses enrolled yet'
                  : activeFilter === 'completed'
                  ? 'No completed courses yet'
                  : 'No courses in progress'}
              </h3>
              <p className="empty-description">
                {activeFilter === 'all'
                  ? 'Get started by exploring our course catalog'
                  : activeFilter === 'completed'
                  ? 'Keep learning to complete your courses'
                  : 'Start a course to see it here'}
              </p>
              {activeFilter === 'all' && (
                <button 
                  className="cta-button"
                  onClick={() => {/* Add navigation to courses */}}
                >
                  Browse Courses
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