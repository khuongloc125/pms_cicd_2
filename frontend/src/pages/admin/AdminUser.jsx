/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { NotificationContext } from "../../context/NotificationContext";
import "../../styles/admin/admin_user.css";
import logo from "../../assets/favicon.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {} from "@fortawesome/free-solid-svg-icons";
import { faUser, faFile } from "@fortawesome/free-regular-svg-icons";
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    show: false,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    auth_provider: "EMAIL",
    created_at: "",
  });
  const navigate = useNavigate();
  const { triggerSuccess, triggerError } = useContext(NotificationContext);
  const defaultAvatar = `${process.env.REACT_APP_API_URL}/uploads/avatars/default-avatar.png`;

  // Hàm format created_at thành MMM DD, YYYY
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    const authProvider = localStorage.getItem("authProvider");

    if (!localStorage.getItem("accessToken")) {
      setNotification({
        message: "No token found, please log in again",
        type: "error",
        show: true,
      });
      navigate("/login");
      return;
    }

    if (authProvider !== "admin") {
      setNotification({
        message: "You do not have permission to access this page",
        type: "error",
        show: true,
      });
      navigate("/dashboard");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/auth/get-users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to fetch user list",
        type: "error",
        show: true,
      });
      triggerError(
        error.response?.data?.message || "Failed to fetch user list"
      );
    }
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      auth_provider: "EMAIL",
      created_at: new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      auth_provider: user.authProvider,
      created_at: user.createdAt || new Date().toISOString().split("T")[0],
    });
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const accessToken = localStorage.getItem("accessToken");
        await axios.delete(
          `${process.env.REACT_APP_API_URL}/api/auth/delete-user/${id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setUsers(users.filter((user) => user.id !== id));
        setNotification({
          message: "User deleted successfully",
          type: "success",
          show: true,
        });
        triggerSuccess("User deleted successfully");
      } catch (error) {
        setNotification({
          message: error.response?.data?.message || "Failed to delete user",
          type: "error",
          show: true,
        });
        triggerError(error.response?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (currentUser) {
        // Update user
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/auth/update-user-by-email/${currentUser.email}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setNotification({
          message: "User updated successfully",
          type: "success",
          show: true,
        });
        triggerSuccess("User updated successfully");
      } else {
        // Create user
        await axios.post(
          "${process.env.REACT_APP_API_URL}/api/auth/register",
          formData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setNotification({
          message: "User added successfully",
          type: "success",
          show: true,
        });
        triggerSuccess("User added successfully");
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      setNotification({
        message: error.response?.data?.message || "Failed to save user",
        type: "error",
        show: true,
      });
      triggerError(error.response?.data?.message || "Failed to save user");
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
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
          <button className="nav-button active">
            <FontAwesomeIcon icon={faUser} />
            <span>User Management</span>
          </button>
          <button
            className="nav-button"
            onClick={() => navigate("/adminprojects")}
          >
            <FontAwesomeIcon icon={faFile} />
            <span>Projects Management</span>
          </button>
          <button className="nav-button" onClick={() => navigate("/hompage")}>
            <span>Logout</span>
          </button>
        </nav>
      </header>
      <main className="admin-main">
        <section className="search-section">
          <div>
            <h2 className="section-title">User Management</h2>
            <p className="section-subtitle">
              Showing {filteredUsers.length} of {users.length} users
            </p>
          </div>
          <form className="search-form">
            <div className="search-input-container">
              <input
                id="search"
                type="search"
                placeholder="Search by username or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <i className="fas fa-search search-icon"></i>
            </div>
            <button type="button" className="filter-button">
              <i className="fas fa-filter"></i>
              <span>All Accounts</span>
            </button>
          </form>
        </section>
        <section className="table-section">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Account Type</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user.id} className="table-row">
                  <td className="table-cell">{index + 1}</td>
                  <td className="table-cell user-cell">
                    <img
                      src={user.avatarUrl || defaultAvatar}
                      alt={user.name || "User"}
                      className="user-avatar"
                      onError={(e) => (e.target.src = defaultAvatar)}
                    />
                    <span>{user.name || "N/A"}</span>
                  </td>
                  <td className="table-cell ">
                    <i className="far fa-envelope"></i>
                    <span>{user.email}</span>
                  </td>
                  <td className="table-cell">
                    <span
                      className={`account-type-badge ${
                        user.authProvider === "GOOGLE"
                          ? "badge-google"
                          : "badge-email"
                      }`}
                    >
                      {user.authProvider === "GOOGLE"
                        ? "Google"
                        : "Self-Created"}
                    </span>
                  </td>
                  <td className="table-cell created-cell">
                    <i className="far fa-calendar-alt"></i>
                    <span>{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="table-cell">
                    <button
                      className="action-button edit-button"
                      onClick={() => handleEditUser(user)}
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                    <button
                      className="action-button delete-button"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3 className="modal-title">
              {currentUser ? "Edit User" : "Add User"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">
                  Password {currentUser && "(leave blank if unchanged)"}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="form-input"
                  required={!currentUser}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Auth Provider</label>
                <select
                  value={formData.auth_provider}
                  onChange={(e) =>
                    setFormData({ ...formData, auth_provider: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="EMAIL">Self-Created</option>
                  <option value="GOOGLE">Google</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Created At</label>
                <input
                  type="date"
                  value={formData.created_at}
                  onChange={(e) =>
                    setFormData({ ...formData, created_at: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="modal-button save-button">
                  Save
                </button>
                <button
                  type="button"
                  className="modal-button cancel-button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default AdminUsers;
