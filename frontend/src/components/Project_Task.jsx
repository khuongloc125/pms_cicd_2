import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../context/SidebarContext";
import { useParams, useLocation } from "react-router-dom";
import "../styles/user/dashboard.css";
import "../styles/user/project_task.css";
import "../styles/user/tabs.css";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { Search } from "lucide-react";
import Backlog from "../pages/user/Backlog";
import Progress from "../pages/user/Progress";
import Summary from "../pages/user/Summary";
import Timeline from "../pages/user/Timeline";
import Comments from "../pages/user/Comments";
import Documents from "../pages/user/Documents";
import People from "../pages/user/People";
import ProjectTabs from "./ProjectTabs";

const ProjectTaskContent = () => {
  const { isSidebarOpen, setProjectsSidebar } = useSidebar();
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [members, setMembers] = useState([]);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("summary");

  const fetchMembers = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");

      if (!userId || !accessToken) {
        throw new Error("User not authenticated");
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

      const data = await response.json();
      if (response.ok) {
        setMembers(data);
      } else {
        throw new Error(data.message || "Failed to fetch members");
      }
    } catch (err) {
      console.error("Fetch members error:", err);
    }
  };

  const fetchProjects = async () => {
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
        setProjects(data);
        setProjectsSidebar(data);
        localStorage.setItem("projects", JSON.stringify(data));
      } else {
        throw new Error(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi lấy danh sách dự án");
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (id) fetchMembers();
  }, [id]);

  useEffect(() => {
    const updateMembersOnAvatarChange = () => {
      const currentAvatarUrl = localStorage.getItem("avatarUrl");
      if (currentAvatarUrl) {
        fetchMembers();
      }
    };
    window.addEventListener("storage", updateMembersOnAvatarChange);

    return () => {
      window.removeEventListener("storage", updateMembersOnAvatarChange);
    };
  }, []);

  useEffect(() => {
    const tab = location.pathname.split("/").pop() || "summary";
    setActiveTab(tab);
  }, [location.pathname]);

  const selectedProject = projects.find(
    (project) => project.id === parseInt(id)
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "summary":
        return <Summary project={selectedProject} />;
      case "backlog":
        return <Backlog project={selectedProject} />;
      case "board":
        return <Progress project={selectedProject} />;
      case "timeline":
        return <Timeline project={selectedProject} />;
      case "documents":
        return <Documents project={selectedProject} />;
      case "people":
        return <People project={selectedProject} />;
      default:
        return <Summary project={selectedProject} />;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!selectedProject) return <p>Không tìm thấy dự án.</p>;

  return (
    <div className="container">
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div className="content-container">
        <div className={`sidebar ${!isSidebarOpen ? "hidden" : ""}`}>
          <Sidebar />
        </div>
        <div className={`main-container ${!isSidebarOpen ? "full" : ""}`}>
          <div className="project-detail">
            <div className="project-header">
              <div
                className="project-title-section"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <div className="flex items-center space-x-4"></div>
                <div className="project-header-name">
                  <div
                    className="project-header-bg"
                    style={{ backgroundColor: selectedProject.color }}
                  >
                    <h3>{selectedProject.short_name}</h3>
                  </div>
                  <div>
                    <h1 className="project-title">
                      {selectedProject.project_name}
                    </h1>
                  </div>
                </div>
                <div>
                  <ProjectTabs
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />
                </div>
              </div>
            </div>
            <div className="project-content">
              <div className="tab-content">{renderTabContent()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectTask = () => {
  return (
    <SidebarProvider>
      <ProjectTaskContent />
    </SidebarProvider>
  );
};

export default ProjectTask;
