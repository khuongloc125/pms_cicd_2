import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import "../../styles/user/summary.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Summary = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
      setError(project ? "" : "Project not found");
    }
  }, [projects, id]);

  const fetchTasks = async () => {
    if (!selectedProject || !accessToken) {
      setError("Missing project information or authentication token");
      return;
    }
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Please log in again to continue");
      }

      // Fetch the list of sprints for the project
      const sprintResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/project/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!sprintResponse.ok) {
        const errorData = await sprintResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error fetching sprint list: ${sprintResponse.status}`
        );
      }

      const sprints = await sprintResponse.json();
      
      // Fetch all tasks from the sprints
      let allTasks = [];
      if (Array.isArray(sprints) && sprints.length > 0) {
        for (const sprint of sprints) {
          const taskResponse = await fetch(
            `${process.env.REACT_APP_API_URL}/api/sprints/tasks/${sprint.id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
                userId: userId,
              },
            }
          );

          if (!taskResponse.ok) {
            const errorData = await taskResponse.json().catch(() => ({}));
            throw new Error(
              errorData.message || `Error fetching task list: ${taskResponse.status}`
            );
          }

          const sprintTasks = await taskResponse.json();
          allTasks = allTasks.concat(Array.isArray(sprintTasks) ? sprintTasks : []);
        }
      }

      // Fetch tasks from the backlog
      const backlogResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/tasks/backlog/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!backlogResponse.ok) {
        const errorData = await backlogResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error fetching backlog task list: ${backlogResponse.status}`
        );
      }

      const backlogTasks = await backlogResponse.json();
      allTasks = allTasks.concat(Array.isArray(backlogTasks) ? backlogTasks : []);

      setTasks(allTasks);
      setError("");
    } catch (err) {
      setError(err.message || "An error occurred while fetching tasks");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    if (!selectedProject || !accessToken) {
      setError("Missing project information or authentication token");
      return;
    }
    setIsLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        throw new Error("Please log in again to continue");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Error fetching member list: ${response.status}`
        );
      }

      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "An error occurred while fetching members");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject) {
      fetchTasks();
      fetchMembers();
    }
  }, [selectedProject]);

  const taskStats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "COMPLETED").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inReview: tasks.filter((t) => t.status === "IN_REVIEW").length,
  };

  const priorityStats = {
    high: tasks.filter((t) => t.priority === "High").length,
    medium: tasks.filter((t) => t.priority === "Medium").length,
    low: tasks.filter((t) => t.priority === "Low").length,
  };

  const progressPercentage =
    taskStats.total > 0
      ? Math.round((taskStats.done / taskStats.total) * 100)
      : 0;

  // Pie chart data
  const pieChartData = {
    labels: ["To Do", "In Progress", "In Review", "Completed"],
    datasets: [
      {
        data: [taskStats.todo, taskStats.inProgress, taskStats.inReview, taskStats.done],
        backgroundColor: ["#ff0037ff", "#0096faff", "#ffb700ff", "#0df06cff"],
        borderColor: ["#FFFFFF", "#FFFFFF", "#FFFFFF", "#FFFFFF"],
        borderWidth: 1,
      },
    ],
  };

  // Pie chart options
  const pieChartOptions = {
    plugins: {
      legend: {
        position: "right",
        labels: {
          boxWidth: 20,
          padding: 20,
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
    maintainAspectRatio: false,
  };

  if (!selectedProject) {
    return <div>{error || "Project not found"}</div>;
  }

  return (
    <div className="summary-container">
      {isLoading && <div>Loading data...</div>}
      {error && <p className="error-message">{error}</p>}
      <div className="tab-content">
        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Tasks</h3>
            <p className="stat-value">{taskStats.total}</p>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <p className="stat-value text-green">{taskStats.done}</p>
          </div>
          <div className="summary-card">
            <h3>In Progress</h3>
            <p className="stat-value text-blue">{taskStats.inProgress}</p>
          </div>
          <div className="summary-card">
            <h3>Progress</h3>
            <p className="stat-value text-purple">{progressPercentage}%</p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="summary-details">
          <div className="detail-section">
            <h3>Project Information</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">Created Date</span>
                <span className="detail-value">
                  {selectedProject.created_at
                    ? new Date(selectedProject.created_at).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Project Leader</span>
                <span className="detail-value">
                  {selectedProject.leader || "Unknown"}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  {selectedProject.status || "Active"}
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Task Distribution</h3>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ height: "150px", width: "250px" }}>
                <Pie data={pieChartData} options={pieChartOptions} />
              </div>
            </div>
          </div>
        </div>

        <div className="summary-details">
          <div className="detail-section">
            <h3>Priority Breakdown</h3>
            <div className="detail-list">
              <div className="detail-item">
                <span className="detail-label">High Priority</span>
                <span className="detail-value">{priorityStats.high}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Medium Priority</span>
                <span className="detail-value">{priorityStats.medium}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Low Priority</span>
                <span className="detail-value">{priorityStats.low}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Team Members</h3>
            {members.length > 0 ? (
              <div className="team-members">
                {members.map((member, index) => (
                  <div key={index} className="team-member">
                    <div className="member-avatar">
                      <img
                        src={member.avatarUrl || "/default-avatar.png"}
                        alt={member.name || "Member"}
                        onError={(e) => {
                          e.target.src = "/default-avatar.png";
                        }}
                      />
                    </div>
                    <div>
                      <span className="member-name">{member.name || "Unknown"}</span>
                      <p className="member-role">{member.role || "Member"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No team members found</p>
            )}
          </div>
        </div>

        <div className="summary-card">
          <h3>Progress Overview</h3>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray">
            {taskStats.done} / {taskStats.total} tasks completed
          </p>
        </div>
      </div>
    </div>
  );
};

export default Summary;