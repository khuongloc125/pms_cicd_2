import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useContext,
} from "react";
import {
  Plus,
  Play,
  MoreVertical,
  User,
  ChevronDown,
  Trash2,
  X,
  Calendar,
  Edit2,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import CreateTaskModal from "../../components/CreateTaskModal";
import CreateSprintModal from "../../components/CreateSprintModal";
import "../../styles/user/backlog.css";
import TaskDetailModal from "../../components/TaskDetailModal"; // Điều chỉnh đường dẫn nếu cần
import { NotificationContext } from "../../context/NotificationContext";

const Backlog = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [showTaskForm, setShowTaskForm] = useState(null);
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [sprintMenuOpen, setSprintMenuOpen] = useState(null);
  const [taskMenuOpen, setTaskMenuOpen] = useState(null);
  const { triggerSuccess } = useContext(NotificationContext);
  const userName = localStorage.getItem("userName");
  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const accessToken = localStorage.getItem("accessToken");
  const [isLeader, setIsLeader] = useState(false); // State để kiểm tra vai trò LEADER

  const fetchMembers = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Please log in again to continue");
      }

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
          errorData.message || `Failed to fetch members: ${response.status}`
        );
      }

      const data = await response.json();
      setMembers(data);
      console.log("data: ", data);
      setError("");

      // Kiểm tra vai trò LEADER dựa trên userName
      const currentMember = data.find((member) => member.name === userName);
      if (currentMember && currentMember.role === "LEADER") {
        setIsLeader(true);
      } else {
        setIsLeader(false);
      }
    } catch (err) {
      setError(err.message || "An error occurred while fetching members");
      if (err.message.includes("401") || err.message.includes("403")) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      }
    }
  };

  useEffect(() => {
    if (selectedProject?.id) {
      fetchMembers();
    }
  }, [selectedProject?.id]);

  const [deleteSprintModal, setDeleteSprintModal] = useState({
    isOpen: false,
    sprint: null,
  });
  const [deleteTaskModal, setDeleteTaskModal] = useState({
    isOpen: false,
    task: null,
  });
  const [assigneeModal, setAssigneeModal] = useState({
    isOpen: false,
    taskId: null,
    suggestedMembers: [],
  });
  const [editSprintDates, setEditSprintDates] = useState({
    isOpen: false,
    sprint: null,
  });
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [suggestedMembers, setSuggestedMembers] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (projects.length > 0) {
      const project = projects.find((p) => p.id === parseInt(id));
      setSelectedProject(project || null);
    }
  }, [projects, id]);

  const fetchSprintsAndTasks = useCallback(async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      console.log("Fetching sprints for projectId:", selectedProject.id);
      const sprintResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/project/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (!sprintResponse.ok) {
        if (sprintResponse.status === 401 || sprintResponse.status === 403) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("userId");
          setTimeout(() => (window.location.href = "/login"), 2000);
          throw new Error("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
        }
        const errorData = await sprintResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Lấy sprint thất bại: ${sprintResponse.status}`
        );
      }

      const sprintsData = await sprintResponse.json();
      setSprints(Array.isArray(sprintsData) ? sprintsData : []);

      let allTasks = [];
      for (const sprint of sprintsData) {
        console.log("Fetching tasks for sprintId:", sprint.id);
        const taskResponse = await fetch(
          `${process.env.REACT_APP_API_URL}/api/sprints/tasks/${sprint.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
            credentials: "include",
          }
        );

        if (!taskResponse.ok) {
          if (taskResponse.status === 401 || taskResponse.status === 403) {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userId");
            setTimeout(() => (window.location.href = "/login"), 2000);
            throw new Error("Phiên đăng nhập hết hạn. Đang chuyển hướng...");
          }
          continue;
        }

        const tasksData = await taskResponse.json();
        allTasks = [
          ...allTasks,
          ...tasksData.map((t) => ({ ...t, sprintId: sprint.id })),
        ];
      }

      console.log("Fetching backlog tasks for projectId:", selectedProject.id);
      const backlogTasksResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/tasks/backlog/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (backlogTasksResponse.ok) {
        const backlogTasks = await backlogTasksResponse.json();
        allTasks = [
          ...allTasks,
          ...backlogTasks.map((t) => ({ ...t, sprintId: null })),
        ];
      }

      setTasks(allTasks);
      console.log("Tasks fetched:", allTasks);

      const membersResponse = await fetch(
        `${process.env.REACT_APP_API_URL}/api/members/project/${selectedProject.id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (membersResponse.ok) {
        const membersData = await membersResponse.json();
        setSuggestedMembers(membersData || []);
      }
    } catch (err) {
      console.error(err.message || "Đã có lỗi xảy ra khi lấy dữ liệu");
      alert(err.message || "Không thể tải dữ liệu. Vui lòng thử lại.");
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchSprintsAndTasks();
  }, [fetchSprintsAndTasks]);

  const handleAddSprint = async (newSprint) => {
    console.log("handleAddSprint called with:", newSprint);
    try {
      await fetchSprintsAndTasks();
    } catch (err) {
      console.error("Lỗi khi làm mới danh sách sprint:", err);
      alert(
        err.message || "Không thể làm mới danh sách sprint. Vui lòng thử lại."
      );
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");
      if (!newTask.projectId) throw new Error("Project ID không hợp lệ");

      console.log("Creating task:", newTask);
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
        projectId: newTask.projectId,
      };

      const endpoint = newTask.sprintId
        ? `${process.env.REACT_APP_API_URL}/api/sprints/task/${newTask.sprintId}`
        : `${process.env.REACT_APP_API_URL}/api/sprints/task/backlog/${newTask.projectId}`;

      if (newTask.sprintId) {
        const sprint = sprints.find((s) => s.id === newTask.sprintId);
        if (!sprint || !["PLANNED", "ACTIVE"].includes(sprint.status)) {
          throw new Error(
            "Sprint không hợp lệ hoặc không ở trạng thái PLANNED/ACTIVE"
          );
        }
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
          userId: userId,
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Tạo nhiệm vụ thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
      triggerSuccess(`You have successfully added the task.`);

      setShowTaskForm(null);
    } catch (err) {
      console.error("Lỗi khi tạo task:", err);
      alert(err.message || "Không thể tạo task. Vui lòng thử lại.");
    }
  };

  const handleUpdateTask = async (taskId, updatedTask) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

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
      triggerSuccess(`You have successfully updated the task.`);
      setEditingTask(null);
      setShowTaskForm(null);
    } catch (err) {
      console.error("Lỗi khi cập nhật task:", err);
      alert(err.message || "Không thể cập nhật task. Vui lòng thử lại.");
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      console.log("Starting sprintId:", sprintId);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/${sprintId}/start`,
        {
          method: "PUT",
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
          errorData.message || `Bắt đầu sprint thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
    } catch (err) {
      console.error("Lỗi khi bắt đầu sprint:", err);
      alert(
        err.message ||
          "Không thể bắt đầu sprint. Vui lòng hoàn thành sprint đang chạy hoặc thử lại."
      );
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      console.log("Completing sprintId:", sprintId);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/${sprintId}/complete`,
        {
          method: "PUT",
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
          errorData.message || `Hoàn thành sprint thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
    } catch (err) {
      console.error("Lỗi khi hoàn thành sprint:", err);
      alert(err.message || "Không thể hoàn thành sprint. Vui lòng thử lại.");
    }
  };

  const handleEditSprintDates = async (sprintId, startDate, endDate) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      console.log("Editing sprint dates for sprintId:", sprintId, {
        startDate,
        endDate,
      });
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/${sprintId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ startDate, endDate }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật ngày sprint thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
      setEditSprintDates({ isOpen: false, sprint: null });
    } catch (err) {
      console.error("Lỗi khi cập nhật ngày sprint:", err);
      alert(err.message || "Không thể cập nhật ngày sprint. Vui lòng thử lại.");
    }
  };

  const handleDeleteSprint = async (sprint, moveTasksToBacklog) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      console.log(
        "Deleting sprintId:",
        sprint.id,
        "moveTasksToBacklog:",
        moveTasksToBacklog
      );
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/${sprint.id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ moveTasksToBacklog }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Xóa sprint thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
      triggerSuccess(`You have successfully deleted the Sprint.`);
      setDeleteSprintModal({ isOpen: false, sprint: null });
    } catch (err) {
      console.error("Lỗi khi xóa sprint:", err);
      alert(err.message || "Không thể xóa sprint. Vui lòng thử lại.");
    }
  };

  const handleDeleteTask = async (task) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

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
      triggerSuccess(`You have successfully deleted the task`);

      setDeleteTaskModal({ isOpen: false, task: null });
      setSelectedTasks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(task.id);
        return newSet;
      });
    } catch (err) {
      console.error("Lỗi khi xóa task:", err);
      alert(err.message || "Không thể xóa task. Vui lòng thử lại.");
    }
  };

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      const validStatuses = ["TODO", "IN_PROGRESS", "IN_REVIEW", "COMPLETED"];
      const backendStatus = newStatus === "DONE" ? "COMPLETED" : newStatus;
      if (!validStatuses.includes(backendStatus)) {
        throw new Error("Trạng thái không hợp lệ");
      }

      const task = tasks.find((t) => t.id === taskId);
      if (!task) throw new Error("Task không tồn tại");

      console.log(
        "Updating task status for taskId:",
        taskId,
        "newStatus:",
        newStatus
      );
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${taskId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({
            status: backendStatus,
            title: task.title || "Untitled Task",
            description: task.description || "",
            priority: task.priority || "Medium",
            startDate: task.startDate,
            endDate: task.endDate,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Cập nhật trạng thái thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái:", err);
      alert(err.message || "Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const handleUpdateTaskAssignee = async (taskId, assigneeEmail) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

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
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

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
          credentials: "include",
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

  const fetchProjectMembers = async (taskId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

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
          credentials: "include",
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

  const handleSearchAssignees = async (query, taskId) => {
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      console.log("Searching assignees for query:", query, "taskId:", taskId);
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/members/search?query=${encodeURIComponent(query)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Tìm kiếm người dùng thất bại: ${response.status}`
        );
      }

      const users = await response.json();
      setAssigneeModal({ isOpen: true, taskId, suggestedMembers: users });
    } catch (err) {
      console.error("Lỗi khi tìm kiếm người dùng:", err);
      alert(err.message || "Không thể tìm kiếm người dùng. Vui lòng thử lại.");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceSprintId =
      source.droppableId === "backlog" ? null : parseInt(source.droppableId);
    const destSprintId =
      destination.droppableId === "backlog"
        ? null
        : parseInt(destination.droppableId);

    if (sourceSprintId === destSprintId && source.index === destination.index)
      return;

    const task = tasks.find((t) => t.id.toString() === result.draggableId);
    try {
      const userId = localStorage.getItem("userId");
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      console.log(
        "Moving task:",
        task.id,
        "from sprintId:",
        sourceSprintId,
        "to sprintId:",
        destSprintId
      );
      if (destSprintId) {
        const sprint = sprints.find((s) => s.id === destSprintId);
        if (!sprint || !["PLANNED", "ACTIVE"].includes(sprint.status)) {
          throw new Error("Không thể di chuyển task vào sprint không hợp lệ");
        }
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/task/${task.id}/sprint`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ sprintId: destSprintId }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Di chuyển task thất bại: ${response.status}`
        );
      }

      await fetchSprintsAndTasks();
    } catch (err) {
      console.error("Lỗi khi di chuyển task:", err);
      alert(err.message || "Không thể di chuyển task. Vui lòng thử lại.");
    }
  };

  const handleToggleTaskSelection = (taskId) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "text-red-600 bg-red-50";
      case "Medium":
        return "text-yellow-600 bg-yellow-50";
      case "Low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-100";
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

  const getSprintTasks = (sprintId) =>
    tasks.filter((task) => task.sprintId === sprintId);
  const getBacklogTasks = () => tasks.filter((task) => task.sprintId === null);
  const getTaskStatusCounts = (tasks) => ({
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    inReview: tasks.filter((t) => t.status === "IN_REVIEW").length,
    done: tasks.filter((t) => t.status === "COMPLETED").length,
  });
  const canStartSprint = (sprintId) => {
    return !sprints.some((s) => s.status === "ACTIVE" && s.id !== sprintId);
  };

  const AssigneeModal = ({
    isOpen,
    taskId,
    suggestedMembers: initialMembers,
    onClose,
  }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredMembers, setFilteredMembers] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
      setFilteredMembers([]); // Reset filteredMembers khi mở modal
    }, [isOpen]);

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    const handleSearchAssignees = async (query) => {
      try {
        const userId = localStorage.getItem("userId");
        const accessToken = localStorage.getItem("accessToken");
        if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

        const response = await fetch(
          `${
            process.env.REACT_APP_API_URL
          }/api/members/search?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
              userId: userId,
            },
            credentials: "include",
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Tìm kiếm người dùng thất bại: ${response.status}`
          );
        }

        const users = await response.json();
        setFilteredMembers(users || []);
      } catch (err) {
        console.error("Lỗi khi tìm kiếm người dùng:", err);
        alert(
          err.message || "Không thể tìm kiếm người dùng. Vui lòng thử lại."
        );
      }
    };

    const handleSelectAssignee = (email) => {
      handleUpdateTaskAssignee(taskId, email);
      onClose();
    };

    const handleInputChange = (e) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (value.length > 0) {
        handleSearchAssignees(value);
      } else {
        setFilteredMembers([]); // Reset khi không nhập
      }
    };

    if (!isOpen || !taskId) return null;

    return (
      <div className="assignee-modal-overlay-list">
        <div className="assignee-modal-list" ref={dropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder="Search users by name or email..."
            className="search-input-member"
          />
          {filteredMembers.length > 0 ? (
            <ul className="assignee-suggestion-list-member">
              {filteredMembers.slice(0, 8).map((member, index) => (
                <li
                  key={index}
                  onClick={() => handleSelectAssignee(member.email)}
                  className="assignee-suggestion-item-member"
                >
                  <div className="assignee-avatar-container">
                    <img
                      src={member.avatarUrl}
                      alt="Avatar"
                      className="assignee-avatar-member"
                    />
                  </div>
                  <div className="assignee-info-member">
                    <p className="assignee-name-member">{member.name}</p>
                    <p className="assignee-email-member">{member.email}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results-member">No matching members found</p>
          )}
          <div className="assignee-options-actions">
            <button
              onClick={() => handleSelectAssignee("")}
              className="unassign-btn-yet"
            >
              Not assigned
            </button>
            <button
              onClick={() => handleAutoAssign(taskId)}
              className="auto-assign-btn-auto"
            >
              Auto
            </button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteSprintModal = ({
    isOpen,
    sprint,
    taskCount,
    onClose,
    onConfirm,
  }) => {
    const [moveTasksToBacklog, setMoveTasksToBacklog] = useState(true);
    if (!isOpen || !sprint) return null;

    return (
      <div className="modal-overlay">
        <div className="delete-modal">
          <div className="delete-modal-header">
            <h3 className="delete-modal-title">Confirm Sprint Deletion</h3>
            <button onClick={onClose} className="modal-close-btn">
              <X />
            </button>
          </div>
          <div className="delete-modal-content">
            <div className="sprint-info">
              <p className="sprint-name-display">
                Sprint: <strong>{sprint.name}</strong>
              </p>
              <p className="task-count-display">
                Tasks in sprint: <strong>{taskCount}</strong>
              </p>
            </div>
            {taskCount > 0 && (
              <div className="checkbox-container">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={moveTasksToBacklog}
                    onChange={(e) => setMoveTasksToBacklog(e.target.checked)}
                    className="checkbox-input"
                  />
                  <span className="checkbox-text">Move tasks to backlog</span>
                </label>
              </div>
            )}
          </div>
          <div className="delete-modal-actions">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(moveTasksToBacklog)}
              className="btn-delete-sprint"
            >
              Delete Sprint
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

  const EditSprintDatesModal = ({ isOpen, sprint, onClose, onConfirm }) => {
    const [startDate, setStartDate] = useState(sprint?.startDate || "");
    const [endDate, setEndDate] = useState(sprint?.endDate || "");

    if (!isOpen || !sprint) return null;

    return (
      <div className="modal-overlay">
        <div className="edit-dates-modal">
          <div className="edit-dates-modal-header">
            <h3 className="edit-dates-modal-title">Edit Sprint Dates</h3>
            <button onClick={onClose} className="modal-close-btn">
              <X />
            </button>
          </div>
          <div className="edit-dates-modal-content">
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="create-sprint-form-input"
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">End Date</label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="create-sprint-form-input"
                min={startDate || new Date().toISOString().slice(0, 10)}
              />
            </div>
          </div>
          <div className="edit-dates-modal-actions">
            <button onClick={onClose} className="btn-cancel">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(sprint.id, startDate, endDate)}
              className="btn-save-dates"
            >
              Save Dates
            </button>
          </div>
        </div>
      </div>
    );
  };

  const TaskRow = ({ task, index }) => (
    <Draggable draggableId={task.id.toString()} index={index}>
      {(provided) => (
        <div
          className="task-row"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <div className="checkbox-task-id">
            <input
              type="checkbox"
              checked={selectedTasks.has(task.id)}
              onChange={() => handleToggleTaskSelection(task.id)}
              className="task-checkbox"
            />
            <div className="task-id" style={{ color: "#0052cc" }}>
              {selectedProject.shortName}Task {task.id}
            </div>
            <div className="task-title">{task.title}</div>
          </div>
          <div className="status-assignee-icon">
            <div className="task-status-dropdown">
              <select
                value={task.status}
                onChange={(e) =>
                  handleUpdateTaskStatus(task.id, e.target.value)
                }
                className="status-select"
              >
                <option value="TODO">TO DO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="IN_REVIEW">IN REVIEW</option>
                <option value="COMPLETED">DONE</option>
              </select>
              <ChevronDown className="status-dropdown-icon" />
            </div>

            <div className="task-assignee">
              {task.assigneeEmail ? (
                <button
                  className="assignee-avatar"
                  title={`Người thực hiện: ${task.assigneeName || "Unknown"}`}
                  onClick={() => fetchProjectMembers(task.id)}
                >
                  {task.assigneeAvatarUrl ? (
                    <img
                      src={task.assigneeAvatarUrl}
                      alt="Avatar"
                      className="assignee-avatar-img"
                    />
                  ) : (
                    <div
                      className="assignee-initials"
                      style={{
                        backgroundColor: getAvatarColor(task.assigneeName),
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
                  onClick={() => fetchProjectMembers(task.id)}
                >
                  <User className="unassigned-icon" style={{ opacity: 0.5 }} />
                </button>
              )}
            </div>
            <div className="task-menu-container">
              <button
                className="task-menu-button"
                onClick={() =>
                  setTaskMenuOpen(taskMenuOpen === task.id ? null : task.id)
                }
              >
                <MoreVertical />
              </button>
              {taskMenuOpen === task.id && (
                <div className="task-dropdown-menu">
                  <button
                    className="dropdown-item"
                    onClick={() => {
                      setEditingTask(task);
                      setShowTaskForm(task.sprintId);
                      setTaskMenuOpen(null);
                    }}
                  >
                    <Edit2 size={16} />
                    Edit Task
                  </button>
                  <button
                    className="dropdown-item delete-item"
                    onClick={() => {
                      setDeleteTaskModal({ isOpen: true, task });
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
        </div>
      )}
    </Draggable>
  );

  if (!selectedProject) return <div>Loading...</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="backlog-container">
        <div className="backlog-header">
          <div className="backlog-header-content-1">
            <h1 className="backlog-title">Backlog</h1>
            <p className="backlog-subtitle">Plan and manage your sprints</p>
          </div>
          {isLeader && (
            <div className="btn-create-sprint-1">
              <button
                className="btn-create-sprint"
                onClick={() => setShowSprintForm(true)}
              >
                <Plus />
                Create Sprint
              </button>
            </div>
          )}
        </div>

        <div className="sprints-section">
          {sprints.map((sprint) => {
            const sprintTasks = getSprintTasks(sprint.id);
            const statusCounts = getTaskStatusCounts(sprintTasks);

            return (
              <Droppable droppableId={sprint.id.toString()} key={sprint.id}>
                {(provided) => (
                  <div
                    className="sprint-block"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <div className="sprint-header">
                      <div className="sprint-info">
                        <h3 className="sprint-name">{sprint.name}</h3>
                        <span className="task-count">
                          {sprintTasks.length} work item
                          {sprintTasks.length !== 1 ? "s" : ""}
                        </span>
                        {isLeader && (
                          <button
                            className="add-dates-btn"
                            onClick={() =>
                              setEditSprintDates({ isOpen: true, sprint })
                            }
                          >
                            <Calendar size={16} />
                            Edit date
                          </button>
                        )}
                      </div>
                      {isLeader && (
                        <div className="sprint-active">
                          {sprint.status !== "ACTIVE" && (
                            <button
                              className={`btn-start-sprint ${
                                canStartSprint(sprint.id)
                                  ? "active"
                                  : "disabled"
                              }`}
                              onClick={() =>
                                canStartSprint(sprint.id) &&
                                handleStartSprint(sprint.id)
                              }
                              disabled={!canStartSprint(sprint.id)}
                            >
                              <Play />
                              Start Sprint
                            </button>
                          )}
                          {sprint.status === "ACTIVE" && (
                            <button
                              className="btn-complete-sprint"
                              onClick={() => handleCompleteSprint(sprint.id)}
                            >
                              Complete Sprint
                            </button>
                          )}
                          <div className="sprint-menu-container">
                            <button
                              className="sprint-menu-button"
                              onClick={() =>
                                setSprintMenuOpen(
                                  sprintMenuOpen === sprint.id
                                    ? null
                                    : sprint.id
                                )
                              }
                            >
                              <MoreVertical />
                            </button>
                            {sprintMenuOpen === sprint.id && (
                              <div className="sprint-dropdown-menu">
                                <button
                                  className="dropdown-item delete-item"
                                  onClick={() => {
                                    setDeleteSprintModal({
                                      isOpen: true,
                                      sprint,
                                    });
                                    setSprintMenuOpen(null);
                                  }}
                                >
                                  <Trash2 />
                                  Delete Sprint
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="sprint-tasks">
                      {sprintTasks.length > 0 ? (
                        sprintTasks.map((task, index) => (
                          <TaskRow key={task.id} task={task} index={index} />
                        ))
                      ) : (
                        <p className="empty-state">No tasks in this sprint</p>
                      )}
                      <button
                        className="btn-create-task-in-sprint"
                        onClick={() => setShowTaskForm(sprint.id)}
                      >
                        <Plus />
                        Create new task
                      </button>
                    </div>
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>

        <Droppable droppableId="backlog">
          {(provided) => (
            <div
              className="backlog-section"
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              <div className="backlog-section-header">
                <h3 className="backlog-section-title">Backlog</h3>
                <span className="backlog-count">
                  {getBacklogTasks().length} issues
                </span>
              </div>
              <div className="backlog-tasks">
                {getBacklogTasks().length > 0 ? (
                  getBacklogTasks().map((task, index) => (
                    <TaskRow key={task.id} task={task} index={index} />
                  ))
                ) : (
                  <p className="empty-state">No tasks in backlog</p>
                )}
                <button
                  className="btn-create-task-in-backlog"
                  onClick={() => setShowTaskForm(sprints.id)}
                >
                  <Plus />
                  Create new task
                </button>
                {provided.placeholder}
              </div>
            </div>
          )}
        </Droppable>

        {showTaskForm !== null && !editingTask?.isDetailView && (
          <CreateTaskModal
            isOpen={showTaskForm !== null}
            onClose={() => {
              setShowTaskForm(null);
              setEditingTask(null);
            }}
            onSubmit={(taskData) => {
              if (editingTask) {
                handleUpdateTask(editingTask.id, taskData);
              } else {
                handleAddTask(taskData);
              }
            }}
            selectedProject={selectedProject}
            editingTask={editingTask}
            activeSprintId={showTaskForm}
            sprints={sprints}
            suggestedMembers={suggestedMembers}
          />
        )}
        {editingTask && editingTask.isDetailView && (
          <TaskDetailModal
            task={editingTask}
            onClose={() => {
              setEditingTask(null);
              setShowTaskForm(null);
            }}
            onUpdateTask={handleUpdateTask}
            selectedProject={selectedProject}
          />
        )}
        <CreateSprintModal
          isOpen={showSprintForm}
          onClose={() => setShowSprintForm(false)}
          onSubmit={handleAddSprint}
          selectedProject={selectedProject}
        />
        <DeleteSprintModal
          isOpen={deleteSprintModal.isOpen}
          sprint={deleteSprintModal.sprint}
          taskCount={
            deleteSprintModal.sprint
              ? getSprintTasks(deleteSprintModal.sprint.id).length
              : 0
          }
          onClose={() => setDeleteSprintModal({ isOpen: false, sprint: null })}
          onConfirm={(moveTasksToBacklog) =>
            handleDeleteSprint(deleteSprintModal.sprint, moveTasksToBacklog)
          }
        />
        <DeleteTaskModal
          isOpen={deleteTaskModal.isOpen}
          task={deleteTaskModal.task}
          onClose={() => setDeleteTaskModal({ isOpen: false, task: null })}
          onConfirm={() => handleDeleteTask(deleteTaskModal.task)}
        />
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
        <EditSprintDatesModal
          isOpen={editSprintDates.isOpen}
          sprint={editSprintDates.sprint}
          onClose={() => setEditSprintDates({ isOpen: false, sprint: null })}
          onConfirm={handleEditSprintDates}
        />
      </div>
    </DragDropContext>
  );
};

export default Backlog;
