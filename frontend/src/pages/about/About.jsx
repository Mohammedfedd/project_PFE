import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./about.css";
import { FaGraduationCap, FaUsers, FaChalkboardTeacher } from "react-icons/fa";

const About = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const animateCounters = () => {
      const counters = document.querySelectorAll(".stat-number");
      const speed = 200;

      counters.forEach(counter => {
        const target = +counter.getAttribute("data-count");
        const count = +counter.innerText.replace('+', '');
        const increment = target / speed;

        if (count < target) {
          counter.innerText = Math.ceil(count + increment) + "+";
          setTimeout(animateCounters, 1);
        } else {
          counter.innerText = target + "+";
        }
      });
    };

    animateCounters();
  }, []);

  return (
    <div className="about-section">
      <div className="about-container">
        <div className="about-header">
          <h2 className="about-title">About Our Learning Platform</h2>
          <div className="title-underline"></div>
          <p className="about-subtitle">Transforming lives through innovative education</p>
        </div>

        <div className="about-content">
          <div className="about-main">
            <div className="about-text-block">
              <p className="about-text">
                We are <span className="highlight">passionate</span> about empowering individuals through 
                <span className="highlight"> high-quality online education</span>. Our platform brings together 
                world-class instructors and cutting-edge technology to create transformative 
                learning experiences.
              </p>

              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Interactive learning modules</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Personalized learning paths</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Real-world projects</span>
                </div>
              </div>
            </div>

            <div className="about-image">
              <img
                src="https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg"
                alt="People learning together"
                className="about-img"
              />
            </div>
          </div>

          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-icon"><FaGraduationCap /></div>
              <span className="stat-number" data-count="500">0+</span>
              <span className="stat-label">Courses</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><FaUsers /></div>
              <span className="stat-number" data-count="1000">0+</span>
              <span className="stat-label">Students</span>
            </div>
            <div className="stat-item">
              <div className="stat-icon"><FaChalkboardTeacher /></div>
              <span className="stat-number" data-count="200">0+</span>
              <span className="stat-label">Experts</span>
            </div>
          </div>

        <div className="mission-statement">
  <div className="mission-content">
    <h3>Our Mission</h3>
    <p>
      To make <span className="accent">quality education accessible</span> to everyone, everywhere, 
      breaking down barriers and creating opportunities for growth, 
      career advancement, and personal fulfillment.
    </p>
  </div>
  <div className="mission-image">
    <img
      src="https://images.pexels.com/photos/5212325/pexels-photo-5212325.jpeg"
      alt="Mentorship and guidance"
      className="mission-img"
    />
  </div>
</div>

          <div className="testimonial">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">
              This platform completely transformed my career. The courses are engaging, 
              practical, and taught by industry leaders who genuinely care about student success.
            </p>
            <div className="testimonial-author">
              <img
                src="https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg"
                alt="Sarah Johnson"
                className="author-avatar"
              />
              <div className="author-info">
                <span className="author-name">Sarah Johnson</span>
                <span className="author-title">Full Stack Developer</span>
              </div>
            </div>
          </div>

          <button className="cta-button" onClick={() => navigate("/courses")}>
            Explore Our Courses
            <span className="cta-arrow" >→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default About;
