/* eslint-disable react/jsx-pascal-case */
import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useNavigate } from "react-router-dom";
import "../../styles/user/dashboard.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import "../../styles/user/create-project.css";
import newProject from "../../assets/new_project.jpg";

const Create_Project_Content = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    project_name: "",
    description: "",
    project_type: "Scrum",
    start_date: "",
    end_date: "",
    userName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    project_name: "",
    project_type: "",
    start_date: "",
    end_date: "",
  });
  const [minDate, setMinDate] = useState(""); // State để lưu ngày hiện tại cho min

  // Lấy ngày hiện tại (10:25 PM +07, 20/07/2025)
  const getCurrentDate = () => {
    const now = new Date();
    now.setHours(12, 0, 0, 0); // Đặt giờ về 00:00:00 để lấy ngày
    return now.toISOString().split("T")[0]; // Trả về định dạng YYYY-MM-DD
  };

  useEffect(() => {
    // Cập nhật minDate khi component mount
    setMinDate(getCurrentDate());
  }, []);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id === "project-name"
        ? "project_name"
        : id === "project-description"
        ? "description"
        : id]: value,
    }));
    // Validation for project_name
    if (id === "project-name" && !value.trim()) {
      setErrors((prev) => ({
        ...prev,
        project_name: "Project name is required",
      }));
    } else if (id === "project-name") {
      setErrors((prev) => ({ ...prev, project_name: "" }));
    }
  };

  const handleDateChange = (e) => {
    const { id, value } = e.target;
    const currentDate = getCurrentDate();
    let errorMsg = "";

    // Kiểm tra ngày trong quá khứ
    if (value && new Date(value) < new Date(currentDate)) {
      errorMsg = "Date cannot be in the past.";
    } else {
      // Validation ngày hợp lệ (năm, tháng, ngày)
      const [year, month, day] = value ? value.split("-").map(Number) : [];
      if (value) {
        if (year < 1900 || year > 2100) {
          errorMsg = "Invalid year.";
        } else if (month < 1 || month > 12) {
          errorMsg = "Month must be between 1 and 12.";
        } else {
          const daysInMonth = new Date(year, month, 0).getDate();
          if (day < 1 || day > daysInMonth) {
            errorMsg = "Invalid day for this month.";
          }
        }
      }
    }

    setErrors((prev) => ({ ...prev, [id]: errorMsg }));
    if (!errorMsg) {
      setFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const handleCheckboxChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      project_type: e.target.checked ? "Scrum" : "",
    }));
    // Validation for project_type
    if (!e.target.checked) {
      setErrors((prev) => ({
        ...prev,
        project_type: "Please select a project type",
      }));
    } else {
      setErrors((prev) => ({ ...prev, project_type: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check for errors before submitting
    const newErrors = {
      project_name: !formData.project_name.trim()
        ? "Project name is required"
        : "",
      project_type: !formData.project_type
        ? "Please select a project type"
        : "",
      start_date: formData.start_date
        ? validateDate(formData.start_date)
          ? ""
          : "Invalid start date."
        : "",
      end_date: formData.end_date
        ? validateDate(formData.end_date)
          ? ""
          : "Invalid end date."
        : "",
    };
    setErrors(newErrors);

    if (Object.values(newErrors).some((error) => error)) return;

    // Check date order
    if (
      formData.start_date &&
      formData.end_date &&
      new Date(formData.end_date) < new Date(formData.start_date)
    ) {
      setErrors((prev) => ({
        ...prev,
        end_date: "End date must be after start date.",
      }));
      return;
    }

    setIsLoading(true);

    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !userName || !accessToken) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/create-project`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ ...formData, userName }),
        }
      );

      const data = await response.json();
      if (response.ok && data.result) {
        const project = data.result;
        console.log("Project created:", project);

        const projects = JSON.parse(localStorage.getItem("projects") || "[]");
        projects.push(project);
        localStorage.setItem("projects", JSON.stringify(projects));

        setProjectsSidebar(projects);

        if (window.progressCallback) {
          window.progressCallback(() => navigate("/dashboard"));
        } else {
          navigate("/dashboard");
        }
      } else {
        throw new Error(data.message || "Failed to create project");
      }
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err.message || "An error occurred while creating the project",
      }));
      console.error("Create project error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const validateDate = (dateStr) => {
    if (!dateStr) return true; // Allow empty
    const [year, month, day] = dateStr.split("-").map(Number);
    return (
      year >= 1900 &&
      year <= 2100 &&
      month >= 1 &&
      month <= 12 &&
      day >= 1 &&
      day <= new Date(year, month, 0).getDate()
    );
  };

  useEffect(() => {
    window.progressCallback = (navigateCallback) => {
      const progress = document.getElementById("global-progress-bar");
      if (progress) {
        progress.style.width = "0%";
        progress.style.display = "block";
        let width = 0;
        const interval = setInterval(() => {
          if (width >= 100) {
            clearInterval(interval);
            progress.style.display = "none";
            if (navigateCallback) navigateCallback();
          } else {
            width += 15;
            progress.style.width = width + "%";
            progress.style.transition = "width 0.3s linear";
          }
        }, 100);
      }
    };
    return () => {
      delete window.progressCallback;
    };
  }, []);

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <div className="create-project-container">
            <div className="create-project-header">
              <div className="create-project-header-title">
                <div className="create-project-title">
                  <h2>Create New Project</h2>
                  <p>
                    Fill in the project details next to complete the project
                    creation
                  </p>
                </div>
                <div className="create-project-header-image">
                  <img src={newProject} />
                </div>
              </div>
              {errors.general && (
                <p style={{ color: "red" }}>{errors.general}</p>
              )}
              <form onSubmit={handleSubmit} className="create-project-form">
                <div className="create-project-input">
                  <label htmlFor="project-name">
                    Project Name <span style={{ color: "red" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="project-name"
                    placeholder="Project Name"
                    value={formData.project_name}
                    onChange={handleInputChange}
                  />
                  {errors.project_name && (
                    <p
                      style={{
                        color: "red",
                        marginTop: -12,
                        marginBottom: 6,
                        fontSize: 15,
                      }}
                    >
                      {errors.project_name}
                    </p>
                  )}
                </div>
                <div className="create-project-input-time">
                  <div className="pro-des">
                    <label htmlFor="project-description">
                      Project Description
                    </label>
                    <textarea
                      id="project-description"
                      placeholder="Project Description"
                      rows="3"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="date">
                    <div className="create-project-input-time start-date">
                      <label htmlFor="start_date">
                        Start Date <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="date"
                        id="start_date"
                        required
                        value={formData.start_date}
                        onChange={handleDateChange}
                        min={minDate} // Sử dụng state minDate
                      />
                      {errors.start_date && (
                        <p
                          style={{
                            color: "red",
                            marginTop: -12,
                            marginBottom: 6,
                            fontSize: 15,
                          }}
                        >
                          {errors.start_date}
                        </p>
                      )}
                    </div>
                    <div className="create-project-input-time end-date">
                      <label htmlFor="end_date">
                        End Date <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        type="date"
                        id="end_date"
                        required
                        value={formData.end_date}
                        onChange={handleDateChange}
                        min={minDate} // Sử dụng state minDate
                      />
                      {errors.end_date && (
                        <p
                          style={{
                            color: "red",
                            marginTop: -12,
                            marginBottom: 6,
                            fontSize: 15,
                          }}
                        >
                          {errors.end_date}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="create-project-input-type">
                  <label htmlFor="project-type">
                    Project Type <span style={{ color: "red" }}>*</span>
                  </label>
                  <div className="project-type-group">
                    <input
                      type="checkbox"
                      id="project-type"
                      checked={formData.project_type === "Scrum"}
                      onChange={handleCheckboxChange}
                    />
                    <div className="type">
                      <h3>Scrum</h3>
                      <p style={{ fontSize: "15px" }}>
                        Move quickly toward your project goals with boards,
                        backlogs, and timelines
                      </p>
                    </div>
                  </div>
                  {errors.project_type && (
                    <p style={{ color: "red" }}>{errors.project_type}</p>
                  )}
                </div>

                <div className="project-button">
                  <div className="create-button">
                    <button
                      className="btn-add"
                      type="submit"
                      disabled={
                        isLoading ||
                        Object.values(errors).some((error) => error)
                      }
                    >
                      {isLoading ? (
                        <span
                          className="spinner"
                          style={{
                            display: "inline-block",
                            width: "20px",
                            height: "20px",
                            border: "2px solid white",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                          }}
                        ></span>
                      ) : (
                        "Create"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Create_Project = () => {
  return (
    <SidebarProvider>
      <Create_Project_Content />
    </SidebarProvider>
  );
};

export default Create_Project;
