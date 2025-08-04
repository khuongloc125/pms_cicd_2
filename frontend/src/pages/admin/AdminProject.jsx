/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import "../../styles/admin/admin_user.css";
import logo from "../../assets/favicon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faFile } from "@fortawesome/free-regular-svg-icons";

const AdminProject = () => {
  const [projects, setProjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ message: "", type: "", show: false });
  const navigate = useNavigate();
  const { triggerSuccess, triggerError } = useContext(NotificationContext);

  // Hàm format created_at thành MMM dd, yyyy
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options).replace(/(\d+)/, (match) => match.padStart(2, '0')); // Đảm bảo định dạng "Jul 07, 2025"
  };

  useEffect(() => {
    const authProvider = localStorage.getItem("authProvider");
    const role = localStorage.getItem("role");

    if (!localStorage.getItem("accessToken")) {
      setNotification({ message: "No token found, please log in again", type: "error", show: true });
      navigate("/login");
      return;
    }

    if (authProvider !== "admin" || role !== "ADMIN") {
      setNotification({ message: "You do not have permission to access this page", type: "error", show: true });
      navigate("/dashboard");
      return;
    }

    fetchProjects();
  }, [navigate]);

  const fetchProjects = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/projects/find-all`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
          role: "ADMIN",
        },
      });
      setProjects(response.data);
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to fetch project list";
      setNotification({ message: errorMsg, type: "error", show: true });
      triggerError(errorMsg);
    }
  };

  const filteredProjects = projects.filter((project) =>
    project.project_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-users">
      <header className="admin-header">
        <div className="header-logo">
          <img src={logo} alt="PMS Logo" className="logo-img" />
          <div>
            <h1 className="logo-title">PMS</h1>
            <p className="logo-subtitle">Project Management System</p>
          </div>
        </div>
        <nav className="header-nav">
          <button className="nav-button" onClick={() => navigate("/adminuser")}>
            <FontAwesomeIcon icon={faUser} />
            <span>User Management</span>
          </button>
          <button className="nav-button active">
            <FontAwesomeIcon icon={faFile} />
            <span>Project Management</span>
          </button>
          <button className="nav-button" onClick={() => navigate("/homepage")}>
            <span>Logout</span>
          </button>
        </nav>
      </header>
      <main className="admin-main">
        <section className="search-section">
          <div>
            <h2 className="section-title">Project Management</h2>
            <p className="section-subtitle">Showing {filteredProjects.length} of {projects.length} projects</p>
          </div>
          <form className="search-form">
            <div className="search-input-container">
              <input
                id="search"
                type="search"
                placeholder="Search by project name or creator"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            <button type="button" className="filter-button">
              <i className="fas fa-filter"></i>
              <span>All Projects</span>
            </button>
          </form>
        </section>
        <section className="table-section">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Project Name</th>
                <th>Created By</th>
                <th>Project Type</th>
                <th>Created Date</th>
                <th>Leader</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project, index) => (
                <tr key={project.id} className="table-row">
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell">{project.project_name || "N/A"}</td>
                  <td className="table-cell">{project.created_by_name || "N/A"}</td>
                  <td className="table-cell">{project.project_type || "N/A"}</td>
                  <td className="table-cell created-cell">
                    <i className="far fa-calendar-alt"></i>
                    <span>{formatDate(project.created_at)}</span>
                  </td>
                  <td className="table-cell">{project.leader || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {notification.show && (
        <div className="notification">
          <div className={`notification-content ${notification.type}`}>
            <p>{notification.message}</p>
            <button
              className="notification-close"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProject;