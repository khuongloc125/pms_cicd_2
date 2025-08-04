import React, { useState, useEffect, useRef } from "react";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Plus,
  MessageSquare,
  Send,
  Users,
  X,
  Calendar,
  Eye,
} from "lucide-react";
import "../../styles/user/documents.css";
import { useParams } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

const Documents = () => {
  const { id } = useParams();
  const { projects } = useSidebar();
  const [selectedProject, setSelectedProject] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [showAssignDropdown, setShowAssignDropdown] = useState(null);
  const [taskSelectionModal, setTaskSelectionModal] = useState({
    isOpen: false,
    files: null,
  });
  const [tasks, setTasks] = useState([]);
  const [assigneeModal, setAssigneeModal] = useState({
    isOpen: false,
    documentId: null,
    suggestedMembers: [],
  });
  const dropdownRefs = useRef({});
  const taskModalRef = useRef(null);
  const assigneeDropdownRef = useRef(null);
  const documentModalRef = useRef(null);
  const accessToken = localStorage.getItem("accessToken");
  const avatar_url = localStorage.getItem("avatarUrl");

  useEffect(() => {
    const handleClickOutside = (event) => {
      const menuRef = dropdownRefs.current[showAssignDropdown];
      if (showAssignDropdown && menuRef && !menuRef.contains(event.target)) {
        setShowAssignDropdown(null);
      }
      if (
        taskSelectionModal.isOpen &&
        taskModalRef.current &&
        !taskModalRef.current.contains(event.target)
      ) {
        setTaskSelectionModal({ isOpen: false, files: null });
      }
      if (
        assigneeModal.isOpen &&
        assigneeDropdownRef.current &&
        !assigneeDropdownRef.current.contains(event.target)
      ) {
        setAssigneeModal({
          isOpen: false,
          documentId: null,
          suggestedMembers: [],
        });
      }
      if (
        selectedDocument &&
        documentModalRef.current &&
        !documentModalRef.current.contains(event.target)
      ) {
        setSelectedDocument(null);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [
    showAssignDropdown,
    taskSelectionModal.isOpen,
    assigneeModal.isOpen,
    selectedDocument,
  ]);

  useEffect(() => {
    const project = projects.find((p) => p.id === parseInt(id));
    setSelectedProject(project || null);
  }, [projects, id]);

  const fetchDocuments = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/${selectedProject.id}`,
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
          errorData.message || `Lấy tài liệu thất bại: ${response.status}`
        );
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      console.error("Fetch documents error:", err);
      alert(err.message || "Không thể tải tài liệu. Vui lòng thử lại.");
    }
  };

  const fetchTasks = async () => {
    if (!selectedProject) return;
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) {
        throw new Error("Vui lòng đăng nhập lại để tiếp tục");
      }

      const sprintsResponse = await fetch(
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

      if (!sprintsResponse.ok) {
        const errorData = await sprintsResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Lấy danh sách sprint thất bại: ${sprintsResponse.status}`
        );
      }

      const sprints = await sprintsResponse.json();
      const activeSprint = sprints.find((sprint) => sprint.status === "ACTIVE");

      let allTasks = [];

      if (activeSprint) {
        const tasksResponse = await fetch(
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

        if (!tasksResponse.ok) {
          const errorData = await tasksResponse.json().catch(() => ({}));
          throw new Error(
            errorData.message ||
              `Lấy danh sách task thất bại: ${tasksResponse.status}`
          );
        }

        const tasks = await tasksResponse.json();
        allTasks = [...tasks];
      } else {
        console.log(
          "No active sprint found for projectId:",
          selectedProject.id
        );
      }

      setTasks(allTasks);
      console.log("Fetched tasks from active sprint:", allTasks);
    } catch (err) {
      console.error("Fetch tasks error:", err);
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchDocuments();
    fetchTasks();
  }, [selectedProject]);

  const handleFileUpload = async (files, taskId) => {
    if (!files || !taskId || files.length === 0) {
      alert("Vui lòng chọn task và ít nhất một file trước khi tải lên.");
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      const formData = new FormData();
      for (let file of files) {
        console.log("Appending file:", file.name);
        formData.append("files", file);
      }
      console.log("Appending request with taskId:", taskId);
      formData.append(
        "request",
        new Blob([JSON.stringify({ taskId })], { type: "application/json" })
      );

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/${selectedProject.id}/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Upload failed: ${response.status}`
        );
      }

      const newDocuments = await response.json();
      console.log("Upload successful, received documents:", newDocuments);
      setDocuments([...documents, ...newDocuments]);
      setTaskSelectionModal({ isOpen: false, files: null });
    } catch (err) {
      console.error("Upload error:", err);
      alert(
        err.message ||
          "Không thể tải lên tài liệu. Vui lòng kiểm tra định dạng tệp và thử lại."
      );
    }
  };

  const handleOpenTaskModal = (files) => {
    console.log(
      "Opening TaskSelectionModal with files:",
      files ? Array.from(files).map((f) => f.name) : null
    );
    setTaskSelectionModal({ isOpen: true, files: files || null });
    fetchTasks();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleOpenTaskModal(e.dataTransfer.files);
  };

  const handleAddComment = async (documentId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/${documentId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ text: commentText }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Thêm bình luận thất bại: ${response.status}`
        );
      }

      const comment = await response.json();
      setDocuments(
        documents.map((doc) =>
          doc.id === documentId
            ? { ...doc, comments: [...doc.comments, comment] }
            : doc
        )
      );
    } catch (err) {
      console.error("Comment error:", err);
      alert(err.message || "Không thể thêm bình luận. Vui lòng thử lại.");
    }
  };

  const fetchProjectMembers = async (documentId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

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
        throw new Error("Lấy danh sách thành viên thất bại");
      }

      const members = await response.json();
      setAssigneeModal({ isOpen: true, documentId, suggestedMembers: members });
    } catch (err) {
      console.error("Lỗi khi lấy danh sách thành viên:", err);
      alert("Không thể lấy danh sách thành viên. Vui lòng thử lại.");
    }
  };

  const handleSearchAssignees = async (query, documentId) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId || !accessToken) throw new Error("Vui lòng đăng nhập lại");

      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/documents/search?query=${encodeURIComponent(query)}`,
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
        throw new Error("Tìm kiếm người dùng thất bại");
      }

      const users = await response.json();
      setAssigneeModal({ isOpen: true, documentId, suggestedMembers: users });
    } catch (err) {
      console.error("Lỗi khi tìm kiếm người dùng:", err);
      alert("Không thể tìm kiếm người dùng. Vui lòng thử lại.");
    }
  };

  const handleAssignUser = async (documentId, email, role) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/documents/${documentId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
          },
          body: JSON.stringify({ email, role }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to assign user");
      }

      const assignment = await response.json();
      setDocuments(
        documents.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                assignedUsers: [
                  ...doc.assignedUsers.filter(
                    (a) => a.userId !== assignment.userId
                  ),
                  assignment,
                ],
              }
            : doc
        )
      );
      setAssigneeModal({
        isOpen: false,
        documentId: null,
        suggestedMembers: [],
      });
    } catch (err) {
      console.error("Assign error:", err);
      alert("Không thể gán người dùng. Vui lòng thử lại.");
    }
  };

  const handleRemoveAssignment = async (documentId, email) => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL
        }/api/documents/${documentId}/assign/${encodeURIComponent(email)}`,
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
        throw new Error("Failed to remove assignment");
      }

      setDocuments(
        documents.map((doc) =>
          doc.id === documentId
            ? {
                ...doc,
                assignedUsers: doc.assignedUsers.filter(
                  (a) =>
                    a.userId !==
                    doc.assignedUsers.find((au) => au.userName === email)
                      ?.userId
                ),
              }
            : doc
        )
      );
    } catch (err) {
      console.error("Remove assignment error:", err);
      alert("Không thể xóa gán người dùng. Vui lòng thử lại.");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileType = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    return extension || "file";
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "doc":
      case "docx":
        return "📝";
      case "xls":
      case "xlsx":
        return "📊";
      case "ppt":
      case "pptx":
        return "📈";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return "🖼️";
      case "css":
        return "🎨";
      case "js":
        return "📜";
      case "sketch":
      case "xd":
        return "🎨";
      default:
        return "📎";
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "Owner":
        return "role-owner";
      case "Reviewer":
        return "role-reviewer";
      default:
        return "role-reviewer";
    }
  };

  const DocumentDetailModal = ({ document, onClose }) => {
    const [modalComment, setModalComment] = useState("");

    if (!document) return null;

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div
          className="document-modal"
          ref={documentModalRef}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-header">
            <div className="modal-title-section">
              <div className="file-icon-large">
                {getFileIcon(document.type)}
              </div>
              <div className="modal-title-info">
                <h3 className="modal-title">{document.name}</h3>
                <p className="modal-subtitle">
                  Tải lên bởi {document.uploader} vào{" "}
                  {new Date(document.uploadDate).toLocaleString()}
                </p>
              </div>
            </div>
            <button className="modal-close" onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="modal-content">
            <div className="document-preview">
              <div className="preview-placeholder">
                <div className="preview-icon">{getFileIcon(document.type)}</div>
                <p>File preview not available</p>
                <button className="btn-download">
                  <Download size={16} /> Download File
                </button>
              </div>
            </div>

            <div className="document-details">
              <div className="detail-item">
                <span className="detail-label">Uploaded by:</span>
                <span className="detail-value uploader-info">
                  <span className="uploader-avatar">
                    {document.uploaderAvatar ? (
                      <img
                        src={document.uploaderAvatar}
                        alt={document.uploader}
                      />
                    ) : (
                      document.uploader?.charAt(0).toUpperCase()
                    )}
                  </span>
                  {document.uploader}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Upload date:</span>
                <span className="detail-value">
                  {new Date(document.uploadDate).toLocaleString()}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">File size:</span>
                <span className="detail-value">
                  {formatFileSize(document.size)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">File type:</span>
                <span className="file-type-badge">
                  {document.type.toUpperCase()}
                </span>
              </div>
              {document.taskTitle && (
                <div className="detail-item">
                  <span className="detail-label">Related task:</span>
                  <span className="detail-value task-link">
                    {document.taskTitle}
                  </span>
                </div>
              )}
            </div>

            <div className="modal-comments-section">
              <div className="comments-header">
                <MessageSquare size={16} />
                <span>Comments ({document.comments.length})</span>
              </div>
              {document.comments.length > 0 ? (
                <div className="modal-comments-list">
                  {document.comments.map((comment) => (
                    <div key={comment.id} className="modal-comment-item">
                      <div className="comment-avatar">
                        {comment.avatar ? (
                          <img src={comment.avatar} alt={comment.user} />
                        ) : (
                          comment.user?.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="comment-content">
                        <div className="comment-header">
                          <span className="comment-author">{comment.user}</span>
                          <span className="comment-time">
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="comment-text">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-results">No comments yet.</p>
              )}
              <div className="modal-comment-form">
                <div className="comment-input-container">
                  <div className="current-user-avatar">CU</div>
                  <input
                    type="text"
                    value={modalComment}
                    onChange={(e) => setModalComment(e.target.value)}
                    placeholder="Thêm bình luận..."
                    className="comment-input"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && modalComment.trim()) {
                        handleAddComment(document.id, modalComment);
                        setModalComment("");
                      }
                    }}
                  />
                  <button
                    className="btn-send-comment"
                    onClick={() => {
                      if (modalComment.trim()) {
                        handleAddComment(document.id, modalComment);
                        setModalComment("");
                      }
                    }}
                    disabled={!modalComment.trim()}
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TaskSelectionModal = ({ isOpen, files, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState(files);

    const filteredTasks = tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleUpload = () => {
      if (!selectedTask) {
        alert("Vui lòng chọn một task trước.");
        return;
      }
      if (!selectedFiles || selectedFiles.length === 0) {
        alert("Vui lòng chọn ít nhất một file.");
        return;
      }
      handleFileUpload(selectedFiles, selectedTask.id);
    };

    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-container" ref={taskModalRef}>
          <div className="modal-header">
            <h2>Chọn task để tải tài liệu</h2>
            <button className="modal-close-btn" onClick={onClose}>
              <X />
            </button>
          </div>

          <div className="modal-body">
            <input
              type="text"
              placeholder="Tìm kiếm task..."
              className="task-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div
              className="task-dropdown"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span>
                {selectedTask
                  ? `${selectedTask.title} (${selectedTask.status})`
                  : "Vui lòng chọn task"}
              </span>
              <span className="arrow">▾</span>
            </div>

            {showDropdown && (
              <ul className="task-list-ui">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <li
                      key={task.id}
                      className={`task-item-ui ${
                        selectedTask && selectedTask.id === task.id
                          ? "selected"
                          : ""
                      }`}
                      onClick={() => {
                        setSelectedTask(task);
                        setShowDropdown(false);
                      }}
                    >
                      <div className="task-title">{task.title}</div>
                      <div className="task-status">{task.status}</div>
                    </li>
                  ))
                ) : (
                  <li className="no-results">
                    Không tìm thấy task trong sprint đang chạy
                  </li>
                )}
              </ul>
            )}

            <div className="file-picker">
              <label className="btn btn-upload">
                Chọn file
                <input
                  type="file"
                  multiple
                  className="file-input"
                  onChange={(e) => setSelectedFiles(e.target.files)}
                />
              </label>
              {selectedFiles && (
                <p style={{ marginTop: "8px" }}>
                  Đã chọn {selectedFiles.length} tệp
                </p>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button
              className="btn btn-primary"
              onClick={handleUpload}
              disabled={
                !selectedTask || !selectedFiles || selectedFiles.length === 0
              }
            >
              Upload
            </button>
          </div>
        </div>
      </div>
    );
  };

  const AssigneeModal = ({ isOpen, documentId, suggestedMembers, onClose }) => {
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          assigneeDropdownRef.current &&
          !assigneeDropdownRef.current.contains(event.target)
        ) {
          onClose();
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }, [onClose]);

    if (!isOpen || !documentId) return null;

    const filteredMembers = suggestedMembers.filter(
      (member) =>
        member.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
      <div className="assignee-modal-overlay">
        <div className="assignee-modal" ref={assigneeDropdownRef}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length > 2) {
                handleSearchAssignees(e.target.value, documentId);
              }
            }}
            placeholder="Tìm kiếm thành viên..."
            className="search-input"
          />
          {filteredMembers.length > 0 ? (
            <ul className="assignee-suggestion-list">
              {filteredMembers.slice(0, 8).map((member, index) => (
                <li key={index} className="assignee-suggestion-item">
                  <div className="assignee-info">
                    <span className="assignee-avatar">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} />
                      ) : (
                        member.name?.charAt(0).toUpperCase()
                      )}
                    </span>
                    <div>
                      <span className="assignee-name">{member.name}</span>
                      <span className="assignee-email">{member.email}</span>
                    </div>
                  </div>
                  <div className="role-buttons">
                    <button
                      className="role-btn role-owner"
                      onClick={() =>
                        handleAssignUser(documentId, member.email, "Owner")
                      }
                    >
                      Owner
                    </button>
                    <button
                      className="role-btn role-reviewer"
                      onClick={() =>
                        handleAssignUser(documentId, member.email, "Reviewer")
                      }
                    >
                      Reviewer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-results">Không tìm thấy thành viên phù hợp</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="tab-content">
      <div className="section-header-documents">
        <div className="section-title-documents">
          <h2>Documents</h2>
          <p>Manage project documents with comments and assignments</p>
        </div>
        <div className="upload-controls">
          <button
            className="btn-primary-documents upload-btn"
            onClick={() => setTaskSelectionModal({ isOpen: true, files: null })}
          >
            <Plus />
            <span>Upload document</span>
          </button>
        </div>
      </div>

      <div
        className={`upload-area ${dragOver ? "dragover" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Upload />
        <p className="upload-text">
          Drag and drop files here, or{" "}
          <label className="upload-link">
            Click here to select file
            <input
              type="file"
              multiple
              className="file-input"
              onChange={(e) => handleOpenTaskModal(e.target.files)}
            />
          </label>
        </p>
        <p className="upload-subtext">
          Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, GIF, CSS, JS,
          Sketch
        </p>
      </div>

      <div className="documents-container">
        <div className="documents-header">
          <div className="documents-title">
            <h3>All Documents ({documents.length})</h3>
            <div className="sort-controls">
              <button className="sort-btn">Sort by name</button>
              <button className="sort-btn">Sort by date</button>
            </div>
          </div>
        </div>

        {documents.length === 0 ? (
          <div className="empty-state">
            <FileText className="empty-state-icon" />
            <p className="empty-state-title">No documents yet</p>
            <p className="empty-state-description">
              Upload documents to get started
            </p>
          </div>
        ) : (
          <div className="file-list-document">
            {documents.map((document) => (
              <div key={document.id} className="document-item">
                <div className="document-header">
                  <div className="file-info">
                    <div className="file-icon">
                      {getFileIcon(document.type)}
                    </div>
                    <div className="file-details">
                      <p className="file-name">{document.name}</p>
                      <div className="file-meta">
                        <span className="file-uploader">
                          Uploader: {document.uploaderName}
                        </span>
                        <span className="file-date">
                          <Calendar size={12} />
                          {new Date(document.uploadDate).toLocaleDateString()}
                        </span>
                        <span className="file-size">
                          {formatFileSize(document.size)}
                        </span>
                        {document.taskTitle && (
                          <span className="file-task">
                            Task: {document.taskTitle}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button
                      className="file-action-btn"
                      title="Xem chi tiết"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <Eye />
                    </button>
                    <button className="file-action-btn" title="Tải xuống">
                      <Download />
                    </button>
                    <button className="file-action-btn file-remove" title="Xóa">
                      <Trash2 />
                    </button>
                  </div>
                </div>

                <div className="document-assignments">
                  <div className="assignment-header">
                    <Users size={16} />
                    <span>Assigned person</span>
                  </div>
                  <div className="assigned-users">
                    {document.assignedUsers.map((assignment) => (
                      <div key={assignment.id} className="assigned-user">
                        <div className="user-avatar">
                          {assignment.userAvatar ? (
                            <img
                              src={assignment.userAvatar}
                              alt={assignment.userName}
                            />
                          ) : (
                            assignment.userName?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="user-info">
                          <span className="user-name">
                            {assignment.userName}
                          </span>
                          <span
                            className={`user-role ${getRoleColor(
                              assignment.role
                            )}`}
                          >
                            {assignment.role}
                          </span>
                        </div>
                        <button
                          className="remove-assignment"
                          onClick={() =>
                            handleRemoveAssignment(
                              document.id,
                              assignment.userName
                            )
                          }
                          title="Xóa phân công"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <div
                      className="assign-user-dropdown"
                      ref={(el) => {
                        if (el) dropdownRefs.current[document.id] = el;
                      }}
                    >
                      <button
                        className="btn-assign-user"
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchProjectMembers(document.id);
                        }}
                      >
                        <Plus size={14} />
                        Assignment
                      </button>
                    </div>
                  </div>
                </div>

                <div className="document-comments">
                  <div className="comments-header">
                    <MessageSquare size={16} />
                    <span>Comments ({document.comments.length})</span>
                  </div>
                  {document.comments.length > 0 && (
                    <div className="comments-list">
                      {document.comments.map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            {comment.avatar ? (
                              <img src={comment.avatar} alt={comment.user} />
                            ) : (
                              comment.user?.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="comment-content">
                            <div className="comment-header">
                              <span className="comment-author">
                                {comment.user}
                              </span>
                              <span className="comment-time">
                                {new Date(comment.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="comment-text">{comment.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="comment-form">
                    <div className="comment-input-container">
                      <div className="current-user-avatar">
                        <img src={avatar_url}></img>
                      </div>
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Thêm bình luận..."
                        className="comment-input"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && newComment.trim()) {
                            handleAddComment(document.id, newComment);
                            setNewComment("");
                          }
                        }}
                      />
                      <button
                        className="btn-send-comment"
                        onClick={() => {
                          if (newComment.trim()) {
                            handleAddComment(document.id, newComment);
                            setNewComment("");
                          }
                        }}
                        disabled={!newComment.trim()}
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="documents-summary">
        <div className="summary-card">
          <h3>Loại tài liệu</h3>
          <div className="file-types">
            {[
              "PDF",
              "Images",
              "Documents",
              "Spreadsheets",
              "CSS",
              "JS",
              "Other",
            ].map((type) => {
              const count = documents.filter((doc) => {
                switch (type) {
                  case "PDF":
                    return doc.type === "pdf";
                  case "Images":
                    return ["jpg", "jpeg", "png", "gif"].includes(doc.type);
                  case "Documents":
                    return ["doc", "docx"].includes(doc.type);
                  case "Spreadsheets":
                    return ["xls", "xlsx"].includes(doc.type);
                  case "CSS":
                    return doc.type === "css";
                  case "JS":
                    return doc.type === "js";
                  default:
                    return ![
                      "pdf",
                      "jpg",
                      "jpeg",
                      "png",
                      "gif",
                      "doc",
                      "docx",
                      "xls",
                      "xlsx",
                      "css",
                      "js",
                    ].includes(doc.type);
                }
              }).length;

              return (
                <div key={type} className="file-type-item">
                  <span className="file-type-label">{type}</span>
                  <span className="file-type-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="summary-card">
          <h3>Hoạt động gần đây</h3>
          <div className="activity-list">
            {documents.slice(0, 3).map((doc) => (
              <div key={doc.id} className="activity-item">
                <div className="activity-icon activity-upload">
                  <Upload />
                </div>
                <div className="activity-details">
                  <p className="activity-title">{doc.name}</p>
                  <p className="activity-time">
                    Tải lên {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <TaskSelectionModal
        isOpen={taskSelectionModal.isOpen}
        files={taskSelectionModal.files}
        onClose={() => setTaskSelectionModal({ isOpen: false, files: null })}
      />
      <AssigneeModal
        isOpen={assigneeModal.isOpen}
        documentId={assigneeModal.documentId}
        suggestedMembers={assigneeModal.suggestedMembers}
        onClose={() =>
          setAssigneeModal({
            isOpen: false,
            documentId: null,
            suggestedMembers: [],
          })
        }
      />
      <DocumentDetailModal
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />
    </div>
  );
};

export default Documents;
