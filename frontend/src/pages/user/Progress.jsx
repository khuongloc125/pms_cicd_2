import React, { useState, useEffect, useCallback, useRef } from "react";
import { Search, Plus, MoreHorizontal, User, Trash2, X } from "lucide-react";
import "../../styles/user/progress.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import CreateTaskModal from "../../components/CreateTaskModal";
import TaskDetailModal from "../../components/TaskDetailModal"; // Điều chỉnh đường dẫn nếu cần
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Progress = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [activeSprint, setActiveSprint] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [groupBy, setGroupBy] = useState("status");
  const [members, setMembers] = useState([]);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const [deleteTaskModal, setDeleteTaskModal] = useState({
    isOpen: false,
    task: null,
  });
  const [assigneeModal, setAssigneeModal] = useState({
    isOpen: false,
    taskId: null,
    suggestedMembers: [],
  });
  const dropdownRefs = useRef({});

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuRef = dropdownRefs.current[taskMenuOpen];
      if (taskMenuOpen && menuRef && !menuRef.contains(event.target)) {
        console.log("Closing dropdown for task:", taskMenuOpen);
        setTaskMenuOpen(null);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [taskMenuOpen]);

  const fetchMembers = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
    if (id) fetchMembers();
  }, [projects, id, fetchMembers]);

  const fetchSprintsAndTasks = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

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
          errorData.message || `Lấy sprint thất bại: ${sprintResponse.status}`
        );
      }

      const sprintsData = await sprintResponse.json();
      setSprints(sprintsData);
      const activeSprint = sprintsData.find(
        (sprint) => sprint.status === "ACTIVE"
      );
      setActiveSprint(activeSprint);

      if (!activeSprint) {
        setTasks([]);
        return;
      }

      const taskResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/tasks/${activeSprint.id}`,
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
          errorData.message || `Lấy task thất bại: ${taskResponse.status}`
        );
      }

      const tasks = await taskResponse.json();
      const mappedTasks = tasks.map((task) => ({
        ...task,
        status: task.status === "COMPLETED" ? "DONE" : task.status,
      }));
      setTasks(mappedTasks);
      console.log("Fetched tasks:", mappedTasks);
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi lấy dữ liệu");
      if (err.message.includes("401") || err.message.includes("403")) {
        setTimeout(() => (window.location.href = "/login"), 2000);
      }
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchSprintsAndTasks();
  }, [fetchSprintsAndTasks]);

  const handleAddTask = async (newTask) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !activeSprint) {
        throw new Error("Vui lòng đăng nhập lại hoặc bắt đầu một sprint");
      }

      const taskData = {
        title: newTask.title || "Untitled Task",
        description: newTask.description || "",
        assigneeEmail: newTask.assigneeEmail || null,
        startDate: newTask.startDate
          ? new Date(newTask.startDate).toISOString()
          : null,
        endDate: newTask.endDate
          ? new Date(newTask.endDate).toISOString()
          : null,
        priority: newTask.priority || "Medium",
        projectId: selectedProject.id,
      };

      console.log("Creating task with data:", taskData);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${activeSprint.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Tạo nhiệm vụ thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error("Lỗi khi tạo task:", err);
      alert(err.message || "Không thể tạo nhiệm vụ. Vui lòng thử lại.");
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const currentTask = tasks.find((t) => t.id === taskId);
      if (!currentTask) throw new Error("Task không tồn tại");

      const taskData = {
        title: updatedTask.title || currentTask.title || "Untitled Task",
        description: updatedTask.description || currentTask.description || "",
        status:
          updatedTask.status === "DONE"
            ? "COMPLETED"
            : updatedTask.status || currentTask.status || "TODO",
        priority: updatedTask.priority || currentTask.priority || "Medium",
        startDate: updatedTask.startDate
          ? new Date(updatedTask.startDate).toISOString()
          : currentTask.startDate,
        endDate: updatedTask.endDate
          ? new Date(updatedTask.endDate).toISOString()
          : currentTask.endDate,
      };

      console.log("Updating task with data:", taskData);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${taskId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Cập nhật task thất bại: ${response.status}`
        );
      }

      if (updatedTask.assigneeEmail !== undefined) {
        await handleUpdateTaskAssignee(taskId, updatedTask.assigneeEmail);
      }

      await fetchSprintsAndTasks();
      setSelectedTask(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật task:", err);
      alert(err.message || "Không thể cập nhật task. Vui lòng thử lại.");
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];
      const backendStatus = newStatus === "DONE" ? "COMPLETED" : newStatus;
      if (!validStatuses.includes(backendStatus)) {
        throw new Error("Trạng thái không hợp lệ");
      }

      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task không tồn tại");

      const taskData = {
        status: backendStatus,
        title: task.title || "Untitled Task",
        description: task.description || "",
        priority: task.priority || "Medium",
        startDate: task.startDate,
        endDate: task.endDate,
      };

      console.log("Updating task status with data:", taskData);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify(taskData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật trạng thái thất bại: ${response.status}`
        );
      }

      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t.id === taskId ? { ...t, status: newStatus } : t
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert(err.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const handleUpdateTaskAssignee = async (taskId, assigneeEmail) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      console.log(
        "Updating assignee for taskId:",
        taskId,
        "assigneeEmail:",
        assigneeEmail
      );

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${taskId}/assignee?projectId=${selectedProject.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ assigneeEmail }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Cập nhật assignee thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
      setAssigneeModal({ isOpen: false, taskId: null, suggestedMembers: [] });
    } catch (err) {
      console.error("Lỗi khi cập nhật assignee:", err);
      alert(err.message || "Không thể cập nhật assignee. Vui lòng thử lại.");
    }
  };

  const handleAutoAssign = async (taskId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      console.log("Auto assigning taskId:", taskId);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
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
          errorData.message ||
            `Lấy danh sách thành viên thất bại: ${response.status}`
        );
      }

      const members = await response.json();
      if (members.length === 0) {
        throw new Error("Không có thành viên nào trong dự án để tự động gán");
      }

      const randomMember = members[Math.floor(Math.random() * members.length)];
      await handleUpdateTaskAssignee(taskId, randomMember.email);
    } catch (err) {
      console.error("Lỗi khi tự động gán:", err);
      alert(err.message || "Không thể tự động gán. Vui lòng thử lại.");
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      console.log("Deleting taskId:", task.id);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${task.id}`,
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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Xóa task thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
      setDeleteTaskModal({ isOpen: false, task: null });
    } catch (err) {
      console.error("Lỗi khi xóa task:", err);
      alert(err.message || "Không thể xóa task. Vui lòng thử lại.");
    }
  };

  const fetchProjectMembers = async (taskId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      console.log("Fetching members for projectId:", selectedProject.id);

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
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
          errorData.message ||
            `Lấy danh sách thành viên thất bại: ${response.status}`
        );
      }

      const members = await response.json();
      setAssigneeModal({ isOpen: true, taskId, suggestedMembers: members });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thành viên:", err);
      alert(
        err.message || "Không thể lấy danh sách thành viên. Vui lòng thử lại."
      );
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "priority-high";
      case "Medium":
        return "priority-medium";
      case "Low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "Story":
        return "type-story";
      case "Bug":
        return "type-bug";
      case "Task":
        return "type-task";
      default:
        return "type-default";
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const names = name.split(" ");
    return names
      .map((n) => n.charAt(0))
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "#cccccc";
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEEAD",
      "#D4A5A5",
      "#9B59B6",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const filteredTasks = tasks
    .filter(
      (task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description &&
          task.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((task) => filterStatus === "all" || task.status === filterStatus)
    .filter(
      (task) => filterPriority === "all" || task.priority === filterPriority
    );

  const handleTaskCardClick = (e, task) => {
    if (
      !e.target.closest(".task-more-btn") &&
      !e.target.closest(".task-dropdown-menu") &&
      !e.target.closest(".assignee-avatar") &&
      !e.target.closest(".assign-user-button")
    ) {
      console.log("Task card clicked, opening modal for task:", task.id);
      setSelectedTask({ ...task, isDetailView: true });
    }
  };

  const groupTasks = () => {
    if (groupBy === "status") {
      return [
        {
          id: "TODO",
          title: "TO DO",
          tasks: filteredTasks.filter((t) => t.status === "TODO"),
        },
        {
          id: "IN_PROGRESS",
          title: "IN PROGRESS",
          tasks: filteredTasks.filter((t) => t.status === "IN_PROGRESS"),
        },
        {
          id: "IN_REVIEW",
          title: "IN REVIEW",
          tasks: filteredTasks.filter((t) => t.status === "IN_REVIEW"),
        },
        {
          id: "DONE",
          title: "DONE",
          tasks: filteredTasks.filter((t) => t.status === "DONE"),
        },
      ];
    } else if (groupBy === "assignee") {
      const grouped = {};
      filteredTasks.forEach((task) => {
        const key = task.assigneeEmail || "Unassigned";
        if (!grouped[key]) grouped[key] = { id: key, title: key, tasks: [] };
        grouped[key].tasks.push(task);
      });
      return Object.values(grouped);
    } else if (groupBy === "priority") {
      const grouped = {};
      filteredTasks.forEach((task) => {
        const key = task.priority || "No Priority";
        if (!grouped[key]) grouped[key] = { id: key, title: key, tasks: [] };
        grouped[key].tasks.push(task);
      });
      return Object.values(grouped);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceColumn = source.droppableId;
    const destColumn = destination.droppableId;
    if (sourceColumn === destColumn && source.index === destination.index)
      return;

    const updatedTasks = Array.from(tasks);
    const [movedTask] = updatedTasks.splice(source.index, 1);
    if (groupBy === "status") {
      movedTask.status = destColumn === "DONE" ? "DONE" : destColumn;
    }
    updatedTasks.splice(destination.index, 0, movedTask);

    setTasks(updatedTasks);
    if (groupBy === "status") {
      const backendStatus = destColumn === "DONE" ? "COMPLETED" : destColumn;
      await handleUpdateTaskStatus(movedTask.id, backendStatus);
    }
  };

  const AssigneeModal = ({ isOpen, taskId, suggestedMembers, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          console.log("Closing assignee modal for taskId:", taskId);
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose, taskId]);

    if (!isOpen || !taskId) return null;

    const filteredMembers = suggestedMembers.filter(
      (member) =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelectAssignee = (email) => {
      console.log("Selecting assignee for taskId:", taskId, "email:", email);
      handleUpdateTaskAssignee(taskId, email);
    };

    return (
      <div className="assignee-modal-overlay">
        <div className="assignee-modal" ref={dropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users by name or email..."
            className="search-input"
          />
          {filteredMembers.length > 0 ? (
            <ul className="assignee-suggestion-list">
              {filteredMembers.slice(0, 8).map((member, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectAssignee(member.email)}
                  className="assignee-suggestion-item"
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt="Avatar"
                      className="assignee-avatar"
                    />
                  ) : (
                    <div
                      className="assignee-initials"
                      style={{
                        backgroundColor: getAvatarColor(member.name),
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {getInitials(member.name)}
                    </div>
                  )}
                  <div className="assignee-info">
                    <span className="assignee-name">{member.name}</span>
                    <span className="assignee-email">{member.email}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">No matching members found</p>
          )}
          <div className="assignee-options">
            <button
              onClick={() => handleSelectAssignee("")}
              className="unassign-btn"
            >
              Chưa gán
            </button>
            <button
              onClick={() => handleAutoAssign(taskId)}
              className="auto-assign-btn"
            >
              Tự động
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteTaskModal = ({ isOpen, task, onClose, onConfirm }) => {
    if (!isOpen || !task) return null;

    return (
      <div className="modal-overlay">
        <div className="delete-modal">
          <div className="delete-modal-header">
            <h3 className="delete-modal-title">
              Are you sure you want to delete this task?
            </h3>
            <button onClick={onClose} className="modal-close-btn">
              <X />
            </button>
          </div>
          <div className="delete-modal-content">
            <div className="task-info">
              <p className="task-title-display">
                Task: <strong>{task.title}</strong>
              </p>
              <p className="task-status-display">
                Status: <strong>{task.status}</strong>
              </p>
            </div>
          </div>
          <div className="delete-modal-actions">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button onClick={onConfirm} className="btn-delete-task">
              Delete Task
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderBoard = () => {
    const columns =
      groupBy === "status"
        ? [
            { id: "TODO", title: "TO DO", color: "bg-gray" },
            { id: "IN_PROGRESS", title: "IN PROGRESS", color: "bg-blue" },
            { id: "IN_REVIEW", title: "IN REVIEW", color: "bg-yellow" },
            { id: "DONE", title: "DONE", color: "bg-green" },
          ]
        : groupTasks();

    return (
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          <div className="kanban-header">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search board..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {members.map((member, index) => (
                <div
                  key={index}
                  className="member-avatar-progress"
                  title={member.name}
                >
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="member-avatar-img-progress"
                    />
                  ) : (
                    <div
                      className="assignee-initials"
                      style={{ backgroundColor: getAvatarColor(member.name) }}
                    >
                      {getInitials(member.name)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="dropdown-filters">
              <div className="grouping-dropdown">
                <select
                  className="filter-select"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                >
                  <option value="status">Group by Status</option>
                  <option value="assignee">Group by Assignee</option>
                  <option value="priority">Group by Priority</option>
                </select>
              </div>
              <div className="progress-filters">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Status</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Priority</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>
          <div className="kanban-columns">
            {columns.map((column) => (
              <Droppable droppableId={column.id} key={column.id}>
                {(provided, snapshot) => (
                  <div
                    className="kanban-column"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="column-header">
                      <h3 className="column-title">
                        {column.title}
                        <span className="ml-2 text-gray-500">
                          (
                          {
                            (groupBy === "status"
                              ? filteredTasks.filter(
                                  (t) => t.status === column.id
                                )
                              : column.tasks || []
                            ).length
                          }
                          )
                        </span>
                      </h3>
                      <button
                        className="add-task-btn"
                        onClick={() => setSelectedTask({ status: column.id })}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="column-tasks">
                      {(groupBy === "status"
                        ? filteredTasks.filter((t) => t.status === column.id)
                        : column.tasks || []
                      ).map((task, index) => (
                        <Draggable
                          key={task.id}
                          draggableId={task.id.toString()}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              className={`board-task-card ${
                                task.status === "DONE" ? "bg-green-100" : ""
                              }`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={(e) => handleTaskCardClick(e, task)}
                            >
                              <div className="board-task-meta">
                                <h4
                                  className={`board-task-title ${
                                    task.status === "DONE"
                                      ? "line-through text-gray-500"
                                      : ""
                                  }`}
                                >
                                  {task.title}
                                </h4>
                                <div
                                  className="task-menu-container"
                                  ref={(el) => {
                                    if (el) dropdownRefs.current[task.id] = el;
                                  }}
                                >
                                  <button
                                    className="task-more-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log(
                                        "Opening dropdown for task:",
                                        task.id,
                                        "status:",
                                        task.status
                                      );
                                      setTaskMenuOpen(
                                        taskMenuOpen === task.id
                                          ? null
                                          : task.id
                                      );
                                    }}
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  {taskMenuOpen === task.id && (
                                    <div className="task-dropdown-menu">
                                      <button
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "View Details clicked for task:",
                                            task.id
                                          );
                                          setSelectedTask({
                                            ...task,
                                            isDetailView: true,
                                          }); // Mở TaskDetailModal
                                          setTaskMenuOpen(null);
                                        }}
                                      >
                                        View Details
                                      </button>
                                      <button
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Edit Task clicked for task:",
                                            task.id
                                          );
                                          setSelectedTask(task); // Mở CreateTaskModal
                                          setTaskMenuOpen(null);
                                        }}
                                      >
                                        Edit Task
                                      </button>
                                      <button
                                        className="dropdown-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Assign Member clicked for task:",
                                            task.id
                                          );
                                          fetchProjectMembers(task.id);
                                          setTaskMenuOpen(null);
                                        }}
                                      >
                                        Assign Member
                                      </button>
                                      <button
                                        className="dropdown-item delete-item"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log(
                                            "Delete Task clicked for task:",
                                            task.id
                                          );
                                          setDeleteTaskModal({
                                            isOpen: true,
                                            task,
                                          });
                                          setTaskMenuOpen(null);
                                        }}
                                      >
                                        <Trash2 size={16} />
                                        Delete Task
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <p className="board-task-desc">
                                {task.description || "No description available"}
                              </p>
                              <div className="board-task-meta">
                                <div className="task-type-priority">
                                  <span
                                    className={`task-type ${getTypeColor(
                                      task.type
                                    )}`}
                                  >
                                    {task.type || (
                                      <div className="task-name-name">
                                        {selectedProject.shortName}Task{" "}
                                        {task.id}{" "}
                                      </div>
                                    )}
                                  </span>
                                  <span
                                    className={`task-priority ${getPriorityColor(
                                      task.priority
                                    )}`}
                                    style={{ color: "white" }}
                                  >
                                    {task.priority}
                                  </span>
                                </div>
                                <div className="task-assignee">
                                  {task.assigneeEmail ? (
                                    <button
                                      className="assignee-avatar"
                                      title={`Người thực hiện: ${
                                        task.assigneeName || "Unknown"
                                      }`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(
                                          "Assignee avatar clicked for task:",
                                          task.id
                                        );
                                        fetchProjectMembers(task.id);
                                      }}
                                    >
                                      {task.assigneeAvatarUrl ? (
                                        <img
                                          src={task.assigneeAvatarUrl}
                                          alt="Assignee"
                                          className="assignee-avatar-img"
                                        />
                                      ) : (
                                        <div
                                          className="assignee-initials"
                                          style={{
                                            backgroundColor: getAvatarColor(
                                              task.assigneeName
                                            ),
                                            color: "#fff",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "24px",
                                            height: "24px",
                                            borderRadius: "50%",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                          }}
                                        >
                                          {getInitials(task.assigneeName)}
                                        </div>
                                      )}
                                    </button>
                                  ) : (
                                    <button
                                      className="assign-user-button"
                                      title="Chưa gán"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log(
                                          "Unassigned button clicked for task:",
                                          task.id
                                        );
                                        fetchProjectMembers(task.id);
                                      }}
                                    >
                                      <User
                                        className="unassigned-icon"
                                        style={{ opacity: 0.5 }}
                                      />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>
      </DragDropContext>
    );
  };

  if (!selectedProject) return <div>Loading...</div>;

  return (
    <div className="progress-container">
      <div className="progress-content">
        {activeSprint ? (
          renderBoard()
        ) : (
          <div className="no-active-sprint">
            Không có sprint active. Vui lòng bắt đầu một sprint trong phần
            Backlog.
          </div>
        )}
      </div>
      {selectedTask && !selectedTask.isDetailView && (
        <CreateTaskModal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          onSubmit={(updatedTask) => {
            if (selectedTask.id) {
              handleUpdateTask(selectedTask.id, updatedTask);
            } else {
              handleAddTask(updatedTask);
            }
          }}
          selectedProject={selectedProject}
          editingTask={selectedTask.id ? selectedTask : null}
          activeSprintId={activeSprint?.id}
          sprints={sprints}
          suggestedMembers={assigneeModal.suggestedMembers}
        />
      )}
      {selectedTask && selectedTask.isDetailView && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
          selectedProject={selectedProject}
        />
      )}
      <AssigneeModal
        isOpen={assigneeModal.isOpen}
        taskId={assigneeModal.taskId}
        suggestedMembers={assigneeModal.suggestedMembers}
        onClose={() =>
          setAssigneeModal({
            isOpen: false,
            taskId: null,
            suggestedMembers: [],
          })
        }
      />
      <DeleteTaskModal
        isOpen={deleteTaskModal.isOpen}
        task={deleteTaskModal.task}
        onClose={() => setDeleteTaskModal({ isOpen: false, task: null })}
        onConfirm={() => handleDeleteTask(deleteTaskModal.task)}
      />
    </div>
  );
};

export default Progress;
