import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";

const Home = () => {
  const navigate = useNavigate();

  const heroImages = [
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1600&q=80",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80"
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "10K+", label: "Students Enrolled" },
    { number: "200+", label: "Courses Available" },
    { number: "50+", label: "Expert Instructors" },
    { number: "24/7", label: "Support Available" }
  ];

  const featuredCourses = [
    { title: "Web Dev", icon: "💻", desc: "Build modern websites" },
    { title: "Data Science", icon: "📊", desc: "Master data analysis" },
    { title: "Marketing", icon: "📈", desc: "Grow businesses" },
    { title: "Design", icon: "🎨", desc: "Create visuals" }
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
      >
        <div className="hero-overlay">
          <div className="hero-content centered">
            <h1 className="hero-title">
              <span className="title-highlight">Level Up</span> Your Skills
            </h1>
            <p className="hero-subtitle">
              Learn from industry experts at your own pace
            </p>
            <div className="hero-buttons">
              <button onClick={() => navigate("/courses")} className="btn-primary">
                Browse Courses
              </button>
              <button onClick={() => navigate("/login")} className="btn-secondary">
          Join Now
        </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <h3>{stat.number}</h3>
              <p>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <h2 className="section-title">Why Learn With Us</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Certified Courses</h3>
            <p>Get recognized certificates upon completion.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👨‍🏫</div>
            <h3>Expert Teachers</h3>
            <p>Learn from professionals with real experience.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📅</div>
            <h3>Flexible Schedule</h3>
            <p>Learn anytime that works for you.</p>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="courses-section">
        <h2 className="section-title">Popular Categories</h2>
        <div className="courses-grid">
          {featuredCourses.map((course, index) => (
            <div key={index} className="course-card" onClick={() => navigate("/courses")}>
              <div className="course-icon">{course.icon}</div>
              <h3>{course.title}</h3>
              <p>{course.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <Testimonials />
    </div>
  );
};

export default Home;
