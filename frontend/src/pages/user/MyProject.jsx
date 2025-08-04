/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import "../../styles/user/dashboard.css";
import "../../styles/user/my_project.css";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsis } from "@fortawesome/free-solid-svg-icons";

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getInitials = (name = "") => {
  if (!name || typeof name !== "string") return "";
  const names = name.split(" ").map((n) => n[0]);
  return names.length > 0 ? names.join("").toUpperCase() : "";
};

const mapStatusToFrontend = (backendStatus) => {
  const statusMap = {
    IN_PROGRESS: "Active",
    COMPLETED: "Completed",
    PLANNING: "Planning",
  };
  return statusMap[backendStatus] || "Planning";
};

const mapTypeToFrontend = (backendType) => {
  if (!backendType) return "Kanban";
  return (
    backendType.charAt(0).toUpperCase() + backendType.slice(1).toLowerCase()
  );
};

// SearchBar Component
const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="search-container">
      <i className="fas fa-search search-icon"></i>
      <input
        type="text"
        className="search-input"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        aria-label="Search projects"
      />
    </div>
  );
};

// Dropdown Component
const Dropdown = ({ label, options, selected, onSelect, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === selected);

  return (
    <div className={`dropdown ${className}`} ref={dropdownRef}>
      <button
        className={`dropdown-button ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={label}
      >
        <span>{selectedOption ? selectedOption.label : label}</span>
        <i className={`fas fa-chevron-${isOpen ? "up" : "down"}`}></i>
      </button>
      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              key={option.value}
              className={`dropdown-item ${
                selected === option.value ? "selected" : ""
              }`}
              onClick={() => {
                onSelect(option.value);
                setIsOpen(false);
              }}
            >
              {option.icon && <i className={option.icon}></i>}
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// StatsBar Component
const StatsBar = ({ projects }) => {
  const stats = {
    total: projects.length,
    active: projects.filter((p) => p.status === "Active").length,
    completed: projects.filter((p) => p.status === "Completed").length,
  };

  return (
    <div className="stats-bar">
      <div className="stat-item">
        <div className="stat-number">{stats.total}</div>
        <div className="stat-label">Total Projects</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">{stats.active}</div>
        <div className="stat-label">Active</div>
      </div>
      <div className="stat-item">
        <div className="stat-number">{stats.completed}</div>
        <div className="stat-label">Completed</div>
      </div>
    </div>
  );
};

// ProjectCard Component
const ProjectCard = ({
  project,
  onViewDetails,
  onActionClick,
  canManageMembers,
  currentUserEmail,
  onDeleteClick,
  currentUser,
}) => {
  const leadName = project.leader || "Unknown";
  const membersList = (project.members || "").split(", ").filter(Boolean);
  const memberColors = useRef({});

  const generateLightColor = () => {
    const r = Math.floor(Math.random() * 156) + 100; // 100–255
    const g = Math.floor(Math.random() * 156) + 100;
    const b = Math.floor(Math.random() * 156) + 100;
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="project-card" onClick={() => onViewDetails(project.id)}>
      <div className="name-button-change">
        <div className="project-card-title">
          <h3>{project.project_name || "Unnamed Project"}</h3>
        </div>
        <div className="project-type-badge">
          ({mapTypeToFrontend(project.project_type)})
        </div>
      </div>

      <p className="project-card-description">
        Description: {project.description || "No description"}
      </p>
      <div className="project-card-footer">
        <div className="project-card-date">
          Start: {formatDate(project.start_date)}
        </div>
        <div className="project-lead">
          <div className="lead-avatar">
            Leader: <span>{leadName}</span>
          </div>
        </div>
      </div>
      <div className="project-team">
        <div className="team-label">Members</div>
        <div className="team-avatars">
          {membersList.slice(0, 4).map((member, index) => {
            if (!memberColors.current[member]) {
              memberColors.current[member] = generateLightColor();
            }
            return (
              <div
                key={index}
                className="team-avatar"
                title={member}
                style={{
                  backgroundColor: memberColors.current[member],
                  color: "#000",
                }}
              >
                {getInitials(member)}
                {canManageMembers && member !== currentUserEmail && (
                  <div className="action-delete-change">
                    <FontAwesomeIcon
                      icon={faEllipsis}
                      onClick={(e) => {
                        e.stopPropagation();
                        onActionClick(project.id, member, e);
                      }}
                    />
                  </div>
                )}
              </div>
            );
          })}
          {membersList.length > 4 && (
            <div
              className="team-avatar team-more"
              title={`+${membersList.length - 4} more members`}
            >
              {`+${membersList.length - 4}`}
            </div>
          )}
        </div>
      </div>
      {currentUser === leadName && (
        <div className="btn-delete-card">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick(project.id);
            }}
          >
            Delete Project
          </button>
        </div>
      )}
    </div>
  );
};

// ProjectsList Component
const ProjectsList = ({
  projects,
  viewMode,
  loading,
  navigate,
  handleViewDetails,
  handleActionClick,
  canManageMembers,
  currentUserEmail,
  onDeleteClick,
  currentUser,
}) => {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        Loading projects...
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="empty-state">
        <i className="fas fa-folder-open" />
        <h3>No projects found</h3>
        <p>Try adjusting your search or filter criteria.</p>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/create-project")}
        >
          <i className="fas fa-plus" />
          Create New Project
        </button>
      </div>
    );
  }

  return (
    <div className={viewMode === "grid" ? "projects-grid" : "projects-list"}>
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onViewDetails={handleViewDetails}
          onActionClick={handleActionClick}
          canManageMembers={canManageMembers(project.id)}
          currentUserEmail={currentUserEmail}
          onDeleteClick={onDeleteClick}
          currentUser={currentUser}
        />
      ))}
    </div>
  );
};

// Main MyProjects Component
const MyProjects = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const navigate = useNavigate();
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState("grid");
  const [error, setError] = useState("");
  const [actionMenu, setActionMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [transferConfirm, setTransferConfirm] = useState(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState(null);
  const [members, setMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const actionRef = useRef(null);
  const currentUserEmail = localStorage.getItem("userEmail");
  const currentUser = localStorage.getItem("userName");

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

  const handleItemClick = (path) => {
    if (window.progressCallback) {
      window.progressCallback(() => navigate(path));
    } else {
      navigate(path);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken) {
          throw new Error("User not authenticated");
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );

        const data = await response.json();
        if (response.ok) {
          const mappedProjects = data.map((project) => ({
            ...project,
            status: mapStatusToFrontend(project.status || "PLANNING"),
            project_type: project.project_type || "kanban",
            progress: project.progress || 0,
          }));
          setProjects(mappedProjects);
          setFilteredProjects(mappedProjects);
          setProjectsSidebar(mappedProjects);
          localStorage.setItem("projects", JSON.stringify(mappedProjects));

          const membersData = {};
          for (const project of data) {
            const membersResponse = await fetch(
              `${process.env.REACT_APP_API_URL}/api/members/project/${project.id}`,
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${accessToken}`,
                  userId: userId,
                },
              }
            );
            const membersDataResponse = await membersResponse.json();
            if (membersResponse.ok) {
              membersData[project.id] = membersDataResponse;
            }
          }
          setMembers(membersData);
        } else {
          throw new Error(data.message || "Failed to fetch projects");
        }
      } catch (err) {
        setError(
          err.message || "An error occurred while fetching the project list"
        );
        console.error("Fetch projects error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [setProjectsSidebar]);

  useEffect(() => {
    const filterAndSortProjects = () => {
      let filtered = [...projects];

      if (searchQuery.trim()) {
        filtered = filtered.filter((project) =>
          project.project_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
        );
      }

      if (statusFilter !== "all") {
        filtered = filtered.filter(
          (project) => project.status === statusFilter
        );
      }

      if (typeFilter !== "all") {
        filtered = filtered.filter(
          (project) => mapTypeToFrontend(project.project_type) === typeFilter
        );
      }

      filtered.sort((a, b) => {
        switch (sortBy) {
          case "name":
            return (a.project_name || "").localeCompare(b.project_name || "");
          case "name-desc":
            return (b.project_name || "").localeCompare(a.project_name || "");
          case "progress":
            return (a.progress || 0) - (b.progress || 0);
          case "progress-desc":
            return (b.progress || 0) - (a.progress || 0);
          case "creation-date":
            return new Date(a.start_date || 0) - new Date(b.start_date || 0);
          case "creation-date-desc":
            return new Date(b.start_date || 0) - new Date(a.start_date || 0);
          default:
            return 0;
        }
      });

      setFilteredProjects(filtered);
    };

    filterAndSortProjects();
  }, [searchQuery, statusFilter, typeFilter, sortBy, projects]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionRef.current && !actionRef.current.contains(event.target)) {
        setActionMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (projectId, memberEmail, event) => {
    const rect = event.target.getBoundingClientRect();
    setActionMenu({
      projectId,
      memberEmail,
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX,
    });
  };

  const handleDeleteMember = async (projectId, email) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/members/project/${projectId}/email/${encodeURIComponent(email)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to remove member");
      }

      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        const mappedProjects = data.map((project) => ({
          ...project,
          status: mapStatusToFrontend(project.status || "PLANNING"),
          project_type: project.project_type || "kanban",
          progress: project.progress || 0,
        }));
        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
        setProjectsSidebar(mappedProjects);
        localStorage.setItem("projects", JSON.stringify(mappedProjects));

        const membersResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        const membersDataResponse = await membersResponse.json();
        if (membersResponse.ok) {
          setMembers((prev) => ({
            ...prev,
            [projectId]: membersDataResponse,
          }));
        }
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setDeleteConfirm(null);
      setActionMenu(null);
    } catch (err) {
      setError(err.message || "Error removing member");
      console.error("Delete member error:", err);
    }
  };

  const handleTransferLeader = async (projectId, email) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}/transfer-leader`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to transfer leader");
      }

      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        const mappedProjects = data.map((project) => ({
          ...project,
          status: mapStatusToFrontend(project.status || "PLANNING"),
          project_type: project.project_type || "kanban",
          progress: project.progress || 0,
        }));
        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
        setProjectsSidebar(mappedProjects);
        localStorage.setItem("projects", JSON.stringify(mappedProjects));

        const membersResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/members/project/${projectId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        const membersDataResponse = await membersResponse.json();
        if (membersResponse.ok) {
          setMembers((prev) => ({
            ...prev,
            [projectId]: membersDataResponse,
          }));
        }
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setTransferConfirm(null);
      setActionMenu(null);
    } catch (err) {
      setError(err.message || "Error transferring leader");
      console.error("Transfer leader error:", err);
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/${projectId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to delete project");
      }

      // Refresh project list
      const fetchResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/projects/my-projects`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      const data = await fetchResponse.json();
      if (fetchResponse.ok) {
        const mappedProjects = data.map((project) => ({
          ...project,
          status: mapStatusToFrontend(project.status || "PLANNING"),
          project_type: project.project_type || "kanban",
          progress: project.progress || 0,
        }));
        setProjects(mappedProjects);
        setFilteredProjects(mappedProjects);
        setProjectsSidebar(mappedProjects);
        localStorage.setItem("projects", JSON.stringify(mappedProjects));
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }

      setDeleteProjectConfirm(null);
    } catch (err) {
      setError(err.message || "Error deleting project");
      console.error("Delete project error:", err);
    }
  };

  const handleDeleteClick = (projectId) => {
    setDeleteProjectConfirm({ projectId });
  };

  const isLeader = (projectId, email) => {
    const projectMembers = members[projectId] || [];
    const member = projectMembers.find((m) => m.email === email);
    return member && member.role === "LEADER";
  };

  const canManageMembers = (projectId) => {
    return isLeader(projectId, currentUserEmail);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSortBy("name");
  };

  const handleViewDetails = (projectId) => {
    handleItemClick(`/project-task/${projectId}/backlog`);
  };

  const statusOptions = [
    { value: "all", label: "All Statuses", icon: "fas fa-list" },
    { value: "Active", label: "Active", icon: "fas fa-play-circle" },
    { value: "Completed", label: "Completed", icon: "fas fa-check-circle" },
    { value: "On Hold", label: "On Hold", icon: "fas fa-pause-circle" },
    { value: "Planning", label: "Planning", icon: "fas fa-clock" },
  ];

  const sortOptions = [
    { value: "name", label: "Name (A-Z)", icon: "fas fa-sort-alpha-down" },
    { value: "name-desc", label: "Name (Z-A)", icon: "fas fa-sort-alpha-up" },
    {
      value: "progress",
      label: "Progress (Low-High)",
      icon: "fas fa-sort-numeric-down",
    },
    {
      value: "progress-desc",
      label: "Progress (High-Low)",
      icon: "fas fa-sort-numeric-up",
    },
    {
      value: "creation-date",
      label: "Creation Date (Old-New)",
      icon: "fas fa-calendar-alt",
    },
    {
      value: "creation-date-desc",
      label: "Creation Date (New-Old)",
      icon: "fas fa-calendar-alt",
    },
  ];

  return (
    <div className="my-project-container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className="my-project-content">
          <div className="project-list-container">
            <div className="page-header">
              <div className="page-title-section">
                <h1 className="section-title">My Projects</h1>
                <p className="page-subtitle">
                  Manage and track all your projects in one place
                </p>
              </div>
              <div className="page-actions-container">
                <div className="page-actions">
                  <button
                    className="btn-create btn-primary-create"
                    onClick={() => navigate("/create-project")}
                    aria-label="Create New Project"
                  >
                    <i className="fas fa-plus"></i>Create New Project
                  </button>
                </div>
              </div>
            </div>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="summary-section">
              <StatsBar projects={filteredProjects} />
            </div>

            <div className="controls-section">
              <div className="controls-left">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
                <Dropdown
                  label="Filter by Status"
                  options={statusOptions}
                  selected={statusFilter}
                  onSelect={setStatusFilter}
                  className="filter-dropdown"
                />
                <Dropdown
                  label="Sort by"
                  options={sortOptions}
                  selected={sortBy}
                  onSelect={setSortBy}
                  className="sort-dropdown"
                />
              </div>
            </div>

            <div className="projects-container">
              <ProjectsList
                projects={filteredProjects}
                viewMode={viewMode}
                loading={loading}
                navigate={navigate}
                handleViewDetails={handleViewDetails}
                handleActionClick={handleActionClick}
                canManageMembers={canManageMembers}
                currentUserEmail={currentUserEmail}
                onDeleteClick={handleDeleteClick}
                currentUser={currentUser}
              />
            </div>

            {actionMenu && (
              <div
                className="action-menu"
                ref={actionRef}
                style={{
                  top: actionMenu.top,
                  left: actionMenu.left,
                }}
              >
                {actionMenu.memberEmail !== currentUserEmail && (
                  <button
                    onClick={() => setDeleteConfirm(actionMenu)}
                    className="action-button"
                  >
                    Remove Member
                  </button>
                )}
                {actionMenu.memberEmail !== currentUserEmail && (
                  <button
                    onClick={() => setTransferConfirm(actionMenu)}
                    className="action-button"
                  >
                    Transfer Leader
                  </button>
                )}
              </div>
            )}

            {deleteConfirm &&
              deleteConfirm.memberEmail !== currentUserEmail && (
                <div className="modal-overlay">
                  <div className="confirm-dialog">
                    <h3>Confirm Member Removal</h3>
                    <p>
                      Are you sure you want to remove{" "}
                      {deleteConfirm.memberEmail} from the project?
                    </p>
                    <div className="form-buttons">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleDeleteMember(
                            deleteConfirm.projectId,
                            deleteConfirm.memberEmail
                          )
                        }
                        className="confirm-button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {transferConfirm &&
              transferConfirm.memberEmail !== currentUserEmail && (
                <div className="modal-overlay">
                  <div className="confirm-dialog">
                    <h3>Confirm Leader Transfer</h3>
                    <p>
                      Are you sure you want to transfer the leader role to{" "}
                      {transferConfirm.memberEmail}?
                    </p>
                    <div className="form-buttons">
                      <button
                        onClick={() => setTransferConfirm(null)}
                        className="cancel-button"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() =>
                          handleTransferLeader(
                            transferConfirm.projectId,
                            transferConfirm.memberEmail
                          )
                        }
                        className="confirm-button"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

            {deleteProjectConfirm && (
              <div className="modal-overlay">
                <div className="confirm-dialog">
                  <h3>Confirm Project Deletion</h3>
                  <p>
                    Are you sure you want to delete this project? This action
                    cannot be undone.
                  </p>
                  <div className="form-buttons">
                    <button
                      onClick={() => setDeleteProjectConfirm(null)}
                      className="cancel-button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteProject(deleteProjectConfirm.projectId)
                      }
                      className="confirm-button"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MyProject = () => {
  return (
    <SidebarProvider>
      <MyProjects />
    </SidebarProvider>
  );
};

export default MyProject;
