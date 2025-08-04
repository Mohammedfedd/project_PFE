import React from "react";
import "./header.css";
import { Link } from "react-router-dom";

const Header = ({ isAuth }) => {
  const handleCoursesClick = (e) => {
    e.preventDefault();
    window.location.href = "/courses";  // force full reload when clicking Courses
  };

  return (
    <header>
      <div className="logo">E-Learning</div>

      <div className="link">
        <Link to={"/"}>Home</Link>

        {/* Replace Courses Link with anchor + onClick */}
        <a href="/courses" onClick={handleCoursesClick}>
          Courses
        </a>

        <Link to={"/educators"}>Educators</Link>  {/* New Educators tab */}

        <Link to={"/about"}>About</Link>
        {isAuth ? (
          <Link to={"/account"}>Account</Link>
        ) : (
          <Link to={"/Login"}>Login</Link>
        )}
      </div>
    </header>
  );
};

export default Header;
