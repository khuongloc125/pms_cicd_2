/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../context/authContext";
import logo from "../../assets/logo.png";
import googleIcon from "../../assets/google-icon.png";
import backgroundImage from "../../assets/du-an.webp";
import { NotificationContext } from "../../context/NotificationContext";
import "../../styles/user/login.css";
import { useUser } from "../../context/UserContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const progressRef = useRef(null);
  const { setUser } = useUser();
  const [error, setError] = useState({
    general: "",
    email: "",
    password: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { triggerSuccess } = useContext(NotificationContext);

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@gmail\.com$/;
    return value && !emailRegex.test(value)
      ? "Email must be a valid @gmail.com address"
      : "";
  };

  const validatePassword = (value) => {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{6,}$/;
    return value && !passwordRegex.test(value)
      ? "Password must contain at least 1 uppercase letter, 1 number, 1 special character, and be 6 characters long"
      : "";
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailError =
      value === "" ? "Please enter email" : validateEmail(value);
    setError((prev) => ({
      ...prev,
      email: emailError,
      general: "",
    }));
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    const passwordError =
      value === "" ? "Please enter password" : validatePassword(value);
    setError((prev) => ({
      ...prev,
      password: passwordError,
      general: "",
    }));
  };

  const shakeInputs = () => {
    const inputGroups = document.querySelectorAll(".input-group");
    inputGroups.forEach((group) => {
      const input = group.querySelector("input");
      const label = group.querySelector("label");
      const errDiv = group.querySelector(".err");
      if (input) input.classList.add("shake");
      if (label) label.classList.add("shake");
      if (errDiv) errDiv.classList.add("shake");
      setTimeout(() => {
        if (input) input.classList.remove("shake");
        if (label) label.classList.remove("shake");
        if (errDiv) errDiv.classList.remove("shake");
      }, 300);
    });
  };

  const handleLocalLogin = async (e) => {
    e.preventDefault();

    if (isLoggingIn) {
      return;
    }

    setError({ general: "", email: "", password: "" });

    const emailError = !email ? "Please enter email" : validateEmail(email);
    const passwordError = !password
      ? "Please enter password"
      : validatePassword(password);

    if (emailError || passwordError) {
      setError((prev) => ({
        ...prev,
        email: emailError,
        password: passwordError,
      }));
      shakeInputs();
      return;
    }

    setIsLoggingIn(true);
    try {
      const result = await login(email, password);
      setUser({
        avatarUrl: result.avatarUrl || null,
        userName: result.name || null,
        backgroundUrl: result.backgroundUrl || null,
        role: result.role || "USER",
      });

      localStorage.setItem("authProvider", result.authProvider || "email");
      triggerSuccess(`Welcome, you have logged in successfully`);
      navigate(result.role === "ADMIN" ? "/adminuser" : "/dashboard", {
        replace: true,
      });
    } catch (err) {
      setError((prev) => ({
        ...prev,
        general: "Incorrect email or password, please try again",
      }));
      shakeInputs();
    } finally {
      setIsLoggingIn(false);
    }
  };

  const googleLogin = () => {
    console.log("Logging in with Google");
    localStorage.setItem("authProvider", "google");

    window.location.href = `${process.env.REACT_APP_API_URL}/api/auth/login/google`;
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
          progress.style.transition = "width 0.3s linear";
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
          progress.style.transition = "width 0.3s linear";
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
          progress.style.transition = "width 0.3s linear";
        }
      }, 100);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoggingIn) {
      handleLocalLogin(e);
    }
  };

  const textRefs = [useRef(null), useRef(null), useRef(null)];

  useEffect(() => {
    const titleElement = textRefs[0].current;
    const support1Element = textRefs[1].current;
    const support2Element = textRefs[2].current;
    const texts = [
      "Connect every team, task, and project together with PMS!",
      "Create projects easily with just one click",
      "Add members to your project",
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
    <div className="login-page-container" onKeyPress={handleKeyPress}>
      <div className="progress-bar" ref={progressRef}></div>
      <div className="homepage-navbar-login">
        <div className="homepage-navbar-logo-login">
          <img src={logo} alt="Logo" className="logo-navbar" />
        </div>
        <div className="homepage-navbar-support-login">
          <ul className="homepage-navbar-support-list-login">
            <li className="homepage-navbar-support-item-login">
              <a href="#" className="home" onClick={handleHomePage}>
                HOME
              </a>
            </li>
            <li className="homepage-navbar-support-item-login">
              <a href="#" className="about_us" onClick={handleAboutUs}>
                ABOUT US
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="login-home">
        <div className="login-home-1">
          <div className="login-form-container">
            <div className="login-home-2-content">
              <div className="login-home-2-content-title">
                <p ref={textRefs[0]} className="typing-text"></p>
              </div>
            </div>
            <form className="login-form">
              <div className="login-input">
                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    placeholder=" "
                    value={email}
                    onChange={handleEmailChange}
                    required
                    autoComplete="off"
                  />
                  <label htmlFor="email">Email</label>
                  <div className="err">
                    {error.email && (
                      <p className="error-message">{error.email}</p>
                    )}
                  </div>
                </div>

                <div className="input-group">
                  <input
                    type="password"
                    id="password"
                    placeholder=" "
                    value={password}
                    onChange={handlePasswordChange}
                    required
                    autoComplete="password"
                  />
                  <label htmlFor="password">Password</label>
                  <div className="err">
                    {error.password && (
                      <p className="error-message">{error.password}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="btn-login-container">
                <div className="login-button">
                  <button
                    className={`btn-login ${isLoggingIn ? "loading" : ""}`}
                    type="submit"
                    onClick={handleLocalLogin}
                    disabled={isLoggingIn}
                  >
                    LOGIN
                  </button>
                </div>
                <div className="err-general">
                  {error.general && (
                    <div className="general-error">
                      <p className="error-message">{error.general}</p>
                    </div>
                  )}
                </div>
                <div className="divider">
                  <span>Or</span>
                </div>

                <div className="login-google">
                  <button
                    className="btn-google"
                    type="button"
                    onClick={googleLogin}
                    disabled={isLoggingIn}
                  >
                    <img
                      src={googleIcon}
                      alt="Google Logo"
                      className="google-logo"
                    />
                    Login with Google
                  </button>
                </div>
              </div>
              <div className="register">
                <p>Don't have an account?</p>
                <a href="#" onClick={handleRegisterClick}>
                  Register now!
                </a>
              </div>
            </form>
          </div>
        </div>

        <div className="login-home-2">
          <div className="login-home-2-content-example">
            <img
              src={backgroundImage}
              alt="Example Logo"
              className="example"
              id="example-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
