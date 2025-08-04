import React, { useEffect, useState } from "react";
import { SidebarProvider, useSidebar } from "../../context/SidebarContext";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/user/dashboard.css";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/Navbar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

const TaskDetailsContent = () => {
  const { isSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { id } = useParams();
  const [task, setTask] = useState(null);

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

  useEffect(() => {
    // Giả định fetch chi tiết task từ API (cần endpoint backend)
    const fetchTask = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");

        if (!userId || !accessToken || !id) {
          throw new Error("User or task not authenticated");
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/backlog/task/${id}`, // Cần endpoint thực tế
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
          throw new Error("Failed to fetch task details");
        }

        const data = await response.json();
        setTask(data);
      } catch (err) {
        console.error("Fetch task details error:", err);
      }
    };

    fetchTask();
  }, [id]);

  if (!task) return <div>Loading...</div>;

  return (
    <div>
      <Navbar />
      <div id="global-progress-bar" className="progress-bar"></div>
      <div
        className={`main-content ${!isSidebarOpen ? "sidebar-collapsed" : ""}`}
      >
        <main className="content">
          <div className="project-detail-header">
            <button className="back-button" onClick={() => navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} /> Quay lại
            </button>
            <div className="project-info">
              <h2>Chi tiết nhiệm vụ: {task.title}</h2>
            </div>
          </div>
          <div className="tab-content">
            <div>
              <p>
                <strong>Mô tả:</strong> {task.description || "Chưa có mô tả"}
              </p>
              <p>
                <strong>Ưu tiên:</strong> {task.priority || "Chưa đặt"}
              </p>
              <p>
                <strong>Ngày hoàn thành:</strong>{" "}
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleString()
                  : "Chưa đặt"}
              </p>
              <p>
                <strong>Trạng thái:</strong> {task.status}
              </p>
              <p>
                <strong>Người phụ trách:</strong>{" "}
                {task.assignee?.name || "Chưa phân công"}
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const TaskDetails = () => {
  return (
    <SidebarProvider>
      <TaskDetailsContent />
    </SidebarProvider>
  );
};

export default TaskDetails;
