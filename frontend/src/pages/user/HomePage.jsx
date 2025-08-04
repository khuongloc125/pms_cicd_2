/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/logo.png";
import illustration from "../../assets/illustration.jpg";
import feature1 from "../../assets/feature1.jpg";
import feature2 from "../../assets/feature2.jpg";
import bg from "../../assets/image.png";
import "../../styles/user/homepage.css";

const HomePage = () => {
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
  const handleAboutUs = () => {
    const progress = progressRef.current;
    if (progress) {
      progress.style.width = "0%";
      progress.style.display = "block";
      let width = 0;
      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          progress.style.display = "none";
          navigate("/aboutus");
        } else {
          width += 10;
          progress.style.width = width + "%";
          progress.style.transition = "width 0.1s linear";
        }
      }, 100);
    }
  };

  const titleRef = useRef(null);
  const support1Ref = useRef(null);
  const support2Ref = useRef(null);
  const textRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const titleElement = textRefs[0].current;
    const support1Element = textRefs[1].current;
    const support2Element = textRefs[2].current;
    const texts = [
      "Welcome to PMS! Create an account to start your project management journey!",
      "Customize your team's workflow.",
      "Set up, streamline, and automate even the most complex project workflows.",
    ];
    let indices = [0, 0, 0];
    let isPaused = [false, false, false];
    let blinkIntervals = [null, null, null];

    const type = (element, text, index, pausedIndex) => {
      if (isPaused[pausedIndex]) return;

      if (indices[pausedIndex] < text.length) {
        element.textContent = text.slice(0, indices[pausedIndex] + 1) + "|";
        indices[pausedIndex]++;
        setTimeout(() => type(element, text, index, pausedIndex), 150);
      } else if (indices[pausedIndex] === text.length) {
        isPaused[pausedIndex] = true;
        element.textContent = text + "|";
        setTimeout(() => {
          blinkCursor(element, text, pausedIndex);
          setTimeout(() => {
            isPaused[pausedIndex] = false;
            indices[pausedIndex] = 0;
            element.textContent = "|";
            type(element, text, index, pausedIndex);
          }, 3000);
        }, 500);
      }
    };

    const blinkCursor = (element, text, pausedIndex) => {
      let blinkCount = 0;
      const maxBlinks = 6;
      blinkIntervals[pausedIndex] = setInterval(() => {
        element.textContent = element.textContent.includes("|")
          ? text + " "
          : text + "|";
        blinkCount++;
        if (blinkCount >= maxBlinks) clearInterval(blinkIntervals[pausedIndex]);
      }, 500);
    };

    if (titleElement) type(titleElement, texts[0], 0, 0);
    if (support1Element) type(support1Element, texts[1], 1, 1);
    if (support2Element) type(support2Element, texts[2], 2, 2);

    return () => {
      blinkIntervals.forEach((interval) => interval && clearInterval(interval));
    };
  }, []);

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
                <a href="#" className="home">
                  HOME
                </a>
              </li>
              <li className="homepage-navbar-support-item">
                <a href="#" className="about_us" onClick={handleAboutUs}>
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
        <div className="homepage-illustration">
          <div className="bg">
            <img src={bg} alt="Illustration" className="illustration" />
          </div>
          <div className="bg-overlay">
            <div className="bg-overlay-content">
              <div className="bg-overlay-content-title">
                <h1>Track, organize, and resolve tasks from anywhere.</h1>
                <p>
                  Break free from clutter and chaos – unleash your productivity
                  with PMS.
                </p>
              </div>
              <div className="bg-overlay-content-buttons">
                <button
                  type="submit"
                  className="homepage-btn-login"
                  onClick={handleLoginClick}
                >
                  EXPLORE NOW
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="register-suport">
        <div className="register-suport-overlay">
          <div ref={support2Ref} className="register-suport-1">
            <div className="register-suport-1-img">
              <img src={feature1} alt="feature1" className="feature1" />
            </div>
            <div className="register-suport-1-context">
              <p ref={textRefs[1]} className="typing-text"></p>
            </div>
          </div>

          <div ref={support1Ref} className="register-suport-2">
            <div className="register-suport-2-context">
              <p ref={textRefs[2]} className="typing-text"></p>
            </div>
            <div className="register-suport-2-img">
              <img src={feature2} alt="feature2" className="feature2" />
            </div>
          </div>
        </div>
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
  );
};

export default HomePage;
