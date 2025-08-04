// Dashboard.jsx
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLayerGroup,
  faTasks,
  faUsers,
  faExclamationTriangle,
  faClock,
  faChartBar,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState, useRef, useContext } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import "../../styles/user/dashboard.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import Chart from "../../components/Chart";
import axios from "axios";
import { NotificationContext } from "../../context/NotificationContext";

const DashboardContent = () => {
  const { isSidebarOpen } = useSidebar();
  const [projectCount, setProjectCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [totalTasks, setTotalTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const userId = localStorage.getItem("userId");
  const accessToken = localStorage.getItem("accessToken");
  const projectChartRef = useRef(null);
  const memberChartRef = useRef(null);
  const { triggerSuccess } = useContext(NotificationContext);

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

    const fetchData = async () => {
      try {
        const projectResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/projects/count`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        setProjectCount(projectResponse.data);

        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/auth/count`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        setUserCount(userResponse.data);

        const taskResponse = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/sprints/count`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
          }
        );
        setTaskCount(taskResponse.data);

        setTotalTasks(100);
        setOverdueTasks(15);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
    return () => {
      delete window.progressCallback;
    };
  }, [accessToken, userId]);

  const handleProjectExport = () => {
    if (projectChartRef.current) {
      projectChartRef.current.handleExport();
    }
  };

  const handleMemberExport = () => {
    if (memberChartRef.current) {
      memberChartRef.current.handleExport();
    }
  };

  useEffect(() => {
    const authProvider = localStorage.getItem("authProvider");
    if (authProvider === "google") {
      triggerSuccess("Welcome, you have logged in successfully");
      localStorage.removeItem("authProvider");
    }
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
          <div className="dashboard-overview">
            <div className="overview-card">
              <div className="total-projects">
                <h2>Total Projects</h2>
                <div className="color-block-projects"></div>
              </div>
              <p className="count">{projectCount}</p>
              <p className="des-card">Currently in system</p>
            </div>
            <div className="overview-card">
              <div className="total-members">
                <h2>Total Members</h2>
                <div className="color-block-members"></div>
              </div>
              <p className="count">{userCount}</p>
              <p className="des-card">Currently in system</p>
            </div>
            <div className="overview-card">
              <div className="total-tasks">
                <h2>Total Tasks</h2>
                <div className="color-block-task"></div>
              </div>
              <p className="count">{taskCount}</p>
              <p className="des-card">Across all projects</p>
            </div>
            <div className="overview-card">
              <div className="overdue-task">
                <h2>Overdue Tasks</h2>
                <div className="color-block-overdue"></div>
              </div>
              <p className="count">{overdueTasks}</p>
              <p className="des-card">Require immediate attention</p>
            </div>
          </div>
          <div className="chart-progress">
            <div className="progress-overview">
              <div className="project-export">
                <h2>Project Overview</h2>
                <div className="export-project">
                  <button
                    className="export-button"
                    onClick={handleProjectExport}
                  >
                    Export
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <Chart type="projects" ref={projectChartRef} />
              </div>
            </div>
            <div className="progress-overview">
              <div className="project-export">
                <h2>Members Overview</h2>
                <div className="export-member">
                  <button
                    className="export-button"
                    onClick={handleMemberExport}
                  >
                    Export
                  </button>
                </div>
              </div>
              <div className="chart-container">
                <Chart type="members" ref={memberChartRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
};

export default Dashboard;
