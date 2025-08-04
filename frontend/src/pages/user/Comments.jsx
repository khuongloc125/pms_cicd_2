import React, { useState, useEffect } from "react";
import { Search, MessageSquare, BarChart3, Folder, Circle, Calendar, Users, FileText } from "lucide-react";
import "../../styles/user/comments.css";
import { useParams, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Comments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("comments");
  const [searchQuery, setSearchQuery] = useState("");
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");
  const accessToken = localStorage.getItem("accessToken");

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
  }, [projects, id]);

  const fetchTasks = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const sprintResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/backlog/sprints/${selectedProject.id}`,
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
        throw new Error(errorData.message || `Lấy sprint thất bại: ${sprintResponse.status}`);
      }

      const sprints = await sprintResponse.json();
      const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");
      if (!activeSprint) {
        setTasks([]);
        setError("Không có sprint active để lấy bình luận!");
        return;
      }

      const taskResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/backlog/tasks/${activeSprint.id}`,
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
        throw new Error(errorData.message || `Lấy task thất bại: ${taskResponse.status}`);
      }

      const tasks = await taskResponse.json();
      setTasks(tasks);
      setError("");
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi lấy dữ liệu");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [selectedProject]);

  const handleAddComment = async (taskId) => {
    if (!newComment.trim()) {
      setError("Vui lòng nhập nội dung bình luận!");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/backlog/task/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({
            text: newComment,
            user: localStorage.getItem("userName"),
            timestamp: new Date().toISOString(),
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Thêm bình luận thất bại: ${response.status}`);
      }

      setNewComment("");
      fetchTasks();
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi thêm bình luận");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "TODO": return "text-gray-600 bg-gray-100";
      case "IN_PROGRESS": return "text-blue-600 bg-blue-100";
      case "IN_REVIEW": return "text-orange-600 bg-orange-100";
      case "DONE": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderComments = () => (
    <div className="space-y-6">
      {filteredTasks.map((task) => (
        <div key={task.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          <div className="space-y-4">
            {task.comments && task.comments.length > 0 ? (
              task.comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {comment.user.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{comment.user}</span>
                      <span className="text-xs text-gray-500">{new Date(comment.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">Chưa có bình luận nào.</p>
            )}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">CU</span>
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Thêm bình luận..."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => handleAddComment(task.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Thêm Bình luận
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {error && <p className="text-red-600 mt-4">{error}</p>}
    </div>
  );

  if (!selectedProject) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <main className="flex-1 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{selectedProject.project_name}</h1>
                <p className="text-gray-600 mt-1">{selectedProject.description || "Không có mô tả"}</p>
              </div>
            </div>
          </div>

          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm nhiệm vụ..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <nav className="flex space-x-8 border-b border-gray-200">
              {[
                { id: "summary", label: "Tổng quan", icon: BarChart3 },
                { id: "backlog", label: "Backlog", icon: Circle },
                { id: "board", label: "Bảng", icon: Folder },
                { id: "timeline", label: "Dòng thời gian", icon: Calendar },
                { id: "comments", label: "Bình luận", icon: MessageSquare },
                { id: "documents", label: "Tài liệu", icon: FileText },
                { id: "people", label: "Thành viên", icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(`/project-task/${id}/${tab.id}`);
                  }}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="mb-6">{renderComments()}</div>
        </main>
      </div>
    </div>
  );
};

export default Comments;
