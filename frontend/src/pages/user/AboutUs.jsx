import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";
import illustration from "../../assets/illustration.jpg";
import feature1 from "../../assets/board.png";
import feature2 from "../../assets/team.png";
import bg from "../../assets/image.png";
import "../../styles/user/aboutus.css";

const AboutUs = () => {
  const navigate = useNavigate();
  const progressRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  const handleLoginClick = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/login");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.1s linear";
        }
      }, 100);
    }
  };

  const handleRegisterClick = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/register");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.1s linear";
        }
      }, 100);
    }
  };
  const handleHomePage = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/homepage");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.1s linear";
        }
      }, 100);
    }
  };
  return (
    <div className="register-page-container" onKeyPress={handleKeyPress}>
      <div className="progress-bar" ref={progressRef}></div>
      <div className="homepage-container">
        <div className="homepage-navbar">
          <div className="homepage-navbar-logo">
            <img src={logo} alt="Logo" className="logo" />
          </div>
          <div className="homepage-navbar-support">
            <ul className="homepage-navbar-support-list">
              <li className="homepage-navbar-support-item">
                <a href="#" className="home" onClick={handleHomePage}>
                  HOME
                </a>
              </li>
              <li className="homepage-navbar-support-item">
                <a href="/aboutus" className="about_us">
                  ABOUT US
                </a>
              </li>
            </ul>
          </div>
          <div className="homepage-navbar-login-btn">
            <button
              type="submit"
              className="homepage-btn-login"
              onClick={handleLoginClick}
            >
              LOGIN
            </button>
          </div>
          <div className="homepage-navbar-register-btn">
            <button
              type="submit"
              className="homepage-btn-register"
              onClick={handleRegisterClick}
            >
              SIGN UP
            </button>
          </div>
        </div>

        <div className="aboutus-container">
          <section className="aboutus-header">
            <h1>About Us</h1>
            <p className="aboutus-subtitle">
              Empowering Project Management with Student Innovation
            </p>
          </section>

          <section className="aboutus-content">
            <div className="aboutus-mission">
              <h2>Our Mission</h2>
              <p>
                We are a dedicated team of four university students passionate
                about revolutionizing project management through technology. Our
                mission is to create practical, innovative tools that enhance
                collaboration and streamline workflows, reflecting our learning
                and creativity in the digital space.
              </p>
            </div>

            <div className="aboutus-vision">
              <h2>Our Vision</h2>
              <p>
                We aspire to bridge academic knowledge with real-world
                applications, envisioning a future where our project management
                solutions inspire other students and professionals. Through
                hands-on experience and modern design, we aim to contribute to
                the tech community with efficient and accessible tools.
              </p>
            </div>

            <div className="aboutus-features">
              <h2>What We Offer</h2>
              <div className="feature-cards">
                <div className="feature-card">
                  <img
                    src={feature1}
                    alt="Agile Planning"
                    className="feature-image"
                  />
                  <h3>Agile Planning</h3>
                  <p>
                    Develop sprints with agile boards and adaptive tools,
                    crafted by students for practical project management.
                  </p>
                </div>
                <div className="feature-card">
                  <img
                    src={feature2}
                    alt="Team Collaboration"
                    className="feature-image"
                  />
                  <h3>Team Collaboration</h3>
                  <p>
                    Foster teamwork with integrated features for task assignment
                    and communication, designed for student projects.
                  </p>
                </div>
              </div>
            </div>

            <div className="aboutus-team">
              <h2>Our Team</h2>
              <p>
                Our team consists of four passionate students from CMC
                University, each bringing unique skills to develop a project
                management solution. Together, we combine our expertise to
                deliver a functional and innovative product.
              </p>
              <div className="team-members">
                <div className="team-member">
                  <h4>Khương Đình Lộc</h4>
                  <p>Leader</p>
                </div>
                <div className="team-member">
                  <h4>Phạm Minh Đàn</h4>
                  <p>Backend</p>
                </div>
                <div className="team-member">
                  <h4>Đặng Trọng Lương</h4>
                  <p>Frontend</p>
                </div>
                <div className="team-member">
                  <h4>Vũ Hà Kiên</h4>
                  <p>Tester</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <footer className="footer">
          <div className="footer-container">
            <div className="footer-column">
              <img src={logo} alt="Company Logo" className="footer-logo" />
              <p>© 2025 Your Company. All rights reserved.</p>
            </div>
            <div className="footer-column">
              <h3>Contact Us</h3>
              <p>Email: kienlocdanluong@gmail.com</p>
              <p>Phone: +84 974541156</p>
              <p>Address: Hà Đông District, Hanoi</p>
            </div>
            <div className="footer-column">
              <h3>Quick Links</h3>
              <ul>
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/services">Services</a>
                </li>
                <li>
                  <a href="/privacy">Privacy Policy</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Follow Us</h3>
              <ul>
                <li>
                  <a href="https://facebook.com">Facebook</a>
                </li>
                <li>
                  <a href="https://twitter.com">Twitter</a>
                </li>
                <li>
                  <a href="https://linkedin.com">LinkedIn</a>
                </li>
              </ul>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
export default AboutUs;
