import React, { useState, useEffect, useRef, useContext } from "react";
import { X } from "lucide-react";
import "../styles/user/create-sprint-modal.css";
import { NotificationContext } from "../context/NotificationContext";

const CreateSprintModal = ({ isOpen, onClose, onSubmit, selectedProject }) => {
  const [sprintFormData, setSprintFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    sprintGoal: "",
    duration: "", // Lưu giá trị duration (số tuần hoặc "Custom")
  });
  const [isLoading, setIsLoading] = useState(false);
  const hasSubmitted = useRef(false);
  const { triggerSuccess } = useContext(NotificationContext);

  // Lấy ngày hiện tại (07:11 PM +07, 20/07/2025)
  const getCurrentDate = () => {
    const now = new Date();
    now.setHours(19, 11, 0, 0); // 07:11 PM +07
    return now.toISOString().slice(0, 10); // Định dạng YYYY-MM-DD
  };

  useEffect(() => {
    const today = getCurrentDate();
    setSprintFormData((prev) => ({
      ...prev,
      startDate: today,
    }));
  }, []);

  // Tính endDate dựa trên startDate và số tuần
  const calculateEndDate = (weeks) => {
    const start = new Date(sprintFormData.startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + weeks * 7);
    return end.toISOString().slice(0, 10);
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setSprintFormData((prev) => {
      if (value === "Custom") {
        return { ...prev, duration: value, endDate: "" }; // Kích hoạt chỉnh sửa thủ công
      } else if (value) {
        const weeks = parseInt(value);
        return { ...prev, duration: value, endDate: calculateEndDate(weeks) };
      }
      return { ...prev, duration: value, endDate: "" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading || hasSubmitted.current) {
      console.log("Request đang xử lý hoặc đã submit, bỏ qua submit lặp");
      return;
    }
    hasSubmitted.current = true;
    setIsLoading(true);
    console.log("Gửi request tạo sprint:", sprintFormData);
    try {
      const userId = localStorage.getItem("userId");
      const userName = localStorage.getItem("userName") || "Anonymous";
      const accessToken = localStorage.getItem("accessToken");
      if (!userId || !accessToken || !selectedProject?.id) {
        throw new Error("Vui lòng đăng nhập và chọn dự án hợp lệ");
      }

      const sprintData = {
        name: sprintFormData.name,
        startDate: sprintFormData.startDate,
        endDate: sprintFormData.endDate,
        sprintGoal: sprintFormData.sprintGoal,
        duration: sprintFormData.duration, // Gửi duration dưới dạng chuỗi
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/sprints/project/${selectedProject.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId,
            userName: encodeURIComponent(userName), // Mã hóa userName
          },
          body: JSON.stringify(sprintData),
        }
      );

      console.log("Phản hồi từ server:", response.status);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Tạo sprint thất bại: ${response.status}`
        );
      }

      const newSprint = await response.json();
      console.log("Sprint mới được tạo:", newSprint);
      onSubmit(newSprint);
      setSprintFormData({
        name: "",
        startDate: getCurrentDate(),
        endDate: "",
        sprintGoal: "",
        duration: "",
      });
      onClose();
    } catch (err) {
      console.error("Lỗi khi tạo sprint:", err.message);
      if (err.message.includes("401") || err.message.includes("403")) {
        window.location.href = "/login";
      }
      alert(err.message || "Không thể tạo sprint. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
      triggerSuccess(`You have successfully added the sprint.`);
      hasSubmitted.current = false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-sprint-modal-overlay">
      <div className="create-sprint-modal">
        <div className="create-sprint-modal-header">
          <h2 className="create-sprint-modal-title">Create New Sprint</h2>
          <button
            type="button"
            onClick={onClose}
            className="create-sprint-modal-close"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="create-sprint-modal-content">
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">
              Sprint Name <span style={{ color: "red" }}>*</span>
            </label>
            <input
              type="text"
              required
              value={sprintFormData.name}
              onChange={(e) =>
                setSprintFormData({
                  ...sprintFormData,
                  name: e.target.value,
                })
              }
              className="create-sprint-form-input"
              placeholder="Enter sprint name"
            />
          </div>
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">
              Duration <span style={{ color: "red" }}>*</span>
            </label>
            <select
              value={sprintFormData.duration}
              onChange={handleDurationChange}
              className="create-sprint-form-select"
              required
            >
              <option value="">Select duration</option>
              <option value="Custom">Custom</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
              <option value="3 weeks">3 weeks</option>
              <option value="4 weeks">4 weeks</option>
            </select>
          </div>
          <div className="create-sprint-form-grid">
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">
                Start Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                required
                value={sprintFormData.startDate}
                onChange={(e) =>
                  setSprintFormData({
                    ...sprintFormData,
                    startDate: e.target.value,
                  })
                }
                className="create-sprint-form-input"
                min={getCurrentDate()} // Giới hạn ngày trong quá khứ
                disabled={sprintFormData.duration !== "Custom"} // Vô hiệu hóa khi không chọn Custom
              />
            </div>
            <div className="create-sprint-form-group">
              <label className="create-sprint-form-label">
                End Date <span style={{ color: "red" }}>*</span>
              </label>
              <input
                type="date"
                required
                value={sprintFormData.endDate}
                onChange={(e) =>
                  setSprintFormData({
                    ...sprintFormData,
                    endDate: e.target.value,
                  })
                }
                className="create-sprint-form-input"
                min={sprintFormData.startDate || getCurrentDate()} // Giới hạn ngày nhỏ hơn startDate
                disabled={sprintFormData.duration !== "Custom"} // Vô hiệu hóa khi không chọn Custom
              />
            </div>
          </div>
          <div className="create-sprint-form-group">
            <label className="create-sprint-form-label">Sprint Goal</label>
            <textarea
              value={sprintFormData.sprintGoal}
              onChange={(e) =>
                setSprintFormData({
                  ...sprintFormData,
                  sprintGoal: e.target.value,
                })
              }
              className="create-sprint-form-input"
              placeholder="Enter sprint goal"
              rows="3"
            />
          </div>

          <div className="create-sprint-form-actions">
            <button
              type="button"
              onClick={onClose}
              className="create-sprint-btn create-sprint-btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="create-sprint-btn create-sprint-btn-primary"
              disabled={isLoading || hasSubmitted.current}
            >
              {isLoading ? "Creating..." : "Create Sprint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSprintModal;
