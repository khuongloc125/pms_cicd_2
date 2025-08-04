package com.pms.backend.service;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pms.backend.dto.TaskDTO;
import com.pms.backend.dto.request.SprintCreationRequest;
import com.pms.backend.dto.request.TaskCreationRequest;
import com.pms.backend.dto.request.TaskUpdateRequest;
import com.pms.backend.entity.Project;
import com.pms.backend.entity.Sprint;
import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import com.pms.backend.enums.SprintStatus;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.SprintMapper;
import com.pms.backend.mapper.TaskMapper;
import com.pms.backend.repository.ProjectRepository;
import com.pms.backend.repository.SprintRepository;
import com.pms.backend.repository.TaskRepository;
import com.pms.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SprintService {

    SprintRepository sprintRepository;
    ProjectRepository projectRepository;
    UserRepository userRepository;
    TaskRepository taskRepository;
    TaskMapper taskMapper;

    public Sprint createSprint(Integer projectId, SprintCreationRequest request, String userId, String userName) {
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Tên sprint không được để trống");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));
        if (sprintRepository.findByProjectIdAndName((long) projectId, request.getName()).isPresent()) {
            throw new AppException(ErrorStatus.SPRINT_ALREADY_EXISTS);
        }
        Sprint sprint = SprintMapper.INSTANCE.toSprint(request);
        sprint.setStatus(SprintStatus.PLANNED);
        sprint.setCreateById(userId);
        sprint.setCreateByName(userName);
        sprint.setProject(project);
        sprint.setWorkItems(0);
        Sprint savedSprint = sprintRepository.save(sprint);
        log.info("Sprint được tạo: {}", savedSprint);
        return savedSprint;
    }

    public Sprint startSprint(Integer sprintId, String userId) {
        log.info("Bắt đầu sprintId: {} bởi userId: {}", sprintId, userId);
        Sprint sprint = sprintRepository.findById((long) sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
        if (!sprint.getStatus().equals(SprintStatus.PLANNED)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }
        sprint.setStatus(SprintStatus.ACTIVE);
        sprint.setStartDate(LocalDate.now());
        Sprint updatedSprint = sprintRepository.save(sprint);
        log.info("Sprint đã bắt đầu: {}", updatedSprint);
        return updatedSprint;
    }

    public Sprint completeSprint(Integer sprintId, String userId) {
        log.info("Hoàn thành sprintId: {} bởi userId: {}", sprintId, userId);
        Sprint sprint = sprintRepository.findById((long) sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
        if (!sprint.getStatus().equals(SprintStatus.ACTIVE)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }
        sprint.setStatus(SprintStatus.COMPLETED);
        sprint.setEndDate(LocalDate.now());
        Sprint updatedSprint = sprintRepository.save(sprint);
        log.info("Sprint đã hoàn thành: {}", updatedSprint);
        return updatedSprint;
    }

    public void deleteSprint(Integer sprintId, String userId, Boolean moveTasksToBacklog) {
        log.info("Xóa sprintId: {} bởi userId: {}, moveTasksToBacklog: {}", sprintId, userId, moveTasksToBacklog);
        Sprint sprint = sprintRepository.findById((long) sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
        if (sprint.getStatus().equals(SprintStatus.ACTIVE)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS);
        }
        List<Task> tasks = taskRepository.findBySprintId(sprintId);
        if (moveTasksToBacklog != null && moveTasksToBacklog) {
            tasks.forEach(task -> {
                task.setSprint(null);
                taskRepository.save(task);
            });
        } else {
            taskRepository.deleteAll(tasks);
        }
        sprintRepository.delete(sprint);
        log.info("Sprint đã xóa: {}", sprintId);
    }

    public Task createTask(Integer sprintId, TaskCreationRequest request) {
        log.info("Tạo task cho sprintId: {} với request: {}", sprintId, request);
        Sprint sprint = sprintRepository.findById((long) sprintId)
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
        if (!sprint.getStatus().equals(SprintStatus.PLANNED) && !sprint.getStatus().equals(SprintStatus.ACTIVE)) {
            throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS, "Sprint phải ở trạng thái PLANNED hoặc ACTIVE");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Title cannot be null or empty");
        }
        if (request.getProjectId() == null) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Project ID cannot be null");
        }
        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));
        User assignee = null;
        if (request.getAssigneeEmail() != null && !request.getAssigneeEmail().isEmpty()) {
            assignee = userRepository.findByEmail(request.getAssigneeEmail())
                    .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        }
        Task task = taskMapper.toTask(request);
        task.setAssignee(assignee);
        task.setSprint(sprint);
        task.setProject(project);
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        // Gán task_number dựa trên số thứ tự lớn nhất trong project
        Integer maxTaskNumber = taskRepository.findMaxTaskNumberByProjectId(request.getProjectId());
        task.setTaskNumber(maxTaskNumber + 1);
        sprint.setWorkItems(sprint.getWorkItems() != null ? sprint.getWorkItems() + 1 : 1);
        sprintRepository.save(sprint);
        Task savedTask = taskRepository.save(task);
        log.info("Task được tạo: {}", savedTask);
        return savedTask;
    }

    public Task createBacklogTask(Integer projectId, TaskCreationRequest request) {
        log.info("Tạo task trong backlog cho projectId: {} với request: {}", projectId, request);
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Title cannot be null or empty");
        }
        if (request.getProjectId() == null) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Project ID cannot be null");
        }
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new AppException(ErrorStatus.PROJECT_NOT_FOUND));
        User assignee = null;
        if (request.getAssigneeEmail() != null && !request.getAssigneeEmail().isEmpty()) {
            assignee = userRepository.findByEmail(request.getAssigneeEmail())
                    .orElseThrow(() -> new AppException(ErrorStatus.USER_NOTFOUND));
        }
        Task task = taskMapper.toTask(request);
        task.setAssignee(assignee);
        task.setSprint(null);
        task.setProject(project);
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        // Gán task_number dựa trên số thứ tự lớn nhất trong project
        Integer maxTaskNumber = taskRepository.findMaxTaskNumberByProjectId(projectId);
        task.setTaskNumber(maxTaskNumber + 1);
        Task savedTask = taskRepository.save(task);
        log.info("Task được tạo trong backlog: {}", savedTask);
        return savedTask;
    }

    public Task updateTask(Integer taskId, TaskUpdateRequest request, String userId) {
        log.info("Cập nhật taskId: {} với request: {} bởi userId: {}", taskId, request, userId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorStatus.TASK_NOT_FOUND));
        if (request.getTitle() != null && request.getTitle().trim().isEmpty()) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Title cannot be empty");
        }
        taskMapper.updateTaskFromRequest(request, task);
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        Task updatedTask = taskRepository.save(task);
        log.info("Task đã cập nhật: {}", updatedTask);
        return updatedTask;
    }

    public void deleteTask(Integer taskId, String userId) {
        log.info("Xóa taskId: {} bởi userId: {}", taskId, userId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorStatus.TASK_NOT_FOUND));
        if (task.getSprint() != null) {
            Sprint sprint = task.getSprint();
            sprint.setWorkItems(Math.max(0, sprint.getWorkItems() != null ? sprint.getWorkItems() - 1 : 0));
            sprintRepository.save(sprint);
        }
        taskRepository.delete(task);
        log.info("Task đã xóa: {}", taskId);
    }

    public Task updateTaskStatus(Integer taskId, TaskUpdateRequest request, String userId) {
        log.info("Cập nhật trạng thái taskId: {} thành {} bởi userId: {}", taskId, request.getStatus(), userId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorStatus.TASK_NOT_FOUND));
        if (request.getStatus() == null) {
            throw new AppException(ErrorStatus.INVALID_INPUT, "Status cannot be null");
        }
        taskMapper.updateTaskFromRequest(request, task);
        task.setStartDate(request.getStartDate());
        task.setEndDate(request.getEndDate());
        Task updatedTask = taskRepository.save(task);
        log.info("Task đã cập nhật trạng thái: {}", updatedTask);
        return updatedTask;
    }

    public TaskDTO updateTaskAssignee(Integer taskId, String assigneeEmail, String userId, Integer projectId) {
        log.info("Cập nhật assignee cho taskId: {}, assigneeEmail: {}, userId: {}, projectId: {}", 
                taskId, assigneeEmail, userId, projectId);
        try {
            // Kiểm tra taskId và projectId
            Task task = taskRepository.findByIdAndProject_Id(taskId, projectId)
                    .orElseThrow(() -> {
                        log.error("Task không tồn tại hoặc không thuộc project: taskId={}, projectId={}", taskId, projectId);
                        return new AppException(ErrorStatus.TASK_NOT_FOUND, 
                                "Task không tồn tại hoặc không thuộc project: taskId=" + taskId + ", projectId=" + projectId);
                    });

            // Kiểm tra assigneeEmail
            User assignee = null;
            if (assigneeEmail != null && !assigneeEmail.isEmpty()) {
                assignee = userRepository.findByEmail(assigneeEmail)
                        .orElseThrow(() -> {
                            log.error("Không tìm thấy người dùng với email: {}", assigneeEmail);
                            return new AppException(ErrorStatus.USER_NOTFOUND, 
                                    "Không tìm thấy người dùng với email: " + assigneeEmail);
                        });
            } else {
                log.info("Gán assignee thành null (không gán) cho taskId: {}", taskId);
            }

            task.setAssignee(assignee);
            Task updatedTask = taskRepository.save(task);
            log.info("Task đã cập nhật assignee thành công: taskId={}, assigneeEmail={}", 
                    taskId, assignee != null ? assignee.getEmail() : "null");

            // Chuyển đổi Task thành TaskDTO để đảm bảo định dạng phản hồi
            TaskDTO taskDTO = new TaskDTO();
            taskDTO.setId(updatedTask.getId());
            taskDTO.setTitle(updatedTask.getTitle());
            taskDTO.setDescription(updatedTask.getDescription());
            taskDTO.setPriority(updatedTask.getPriority());
            taskDTO.setAssigneeId(assignee != null ? assignee.getId() : null);
            taskDTO.setAssigneeEmail(assignee != null ? assignee.getEmail() : null);
            taskDTO.setAssigneeName(assignee != null ? assignee.getName() : null);
            taskDTO.setAssigneeAvatarUrl(assignee != null ? assignee.getAvatar_url() : null);
            taskDTO.setStartDate(updatedTask.getStartDate());
            taskDTO.setEndDate(updatedTask.getEndDate());
            taskDTO.setStatus(updatedTask.getStatus());
            taskDTO.setCreatedAt(updatedTask.getCreatedAt());
            taskDTO.setSprintId(updatedTask.getSprint() != null ? updatedTask.getSprint().getId().intValue() : null);
            taskDTO.setProjectId(updatedTask.getProject() != null ? updatedTask.getProject().getId() : null);

            return taskDTO;
        } catch (AppException e) {
            log.error("Lỗi AppException khi cập nhật assignee: {}", e.getCustomMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật assignee cho taskId {}: {}", taskId, e.getMessage(), e);
            throw new AppException(ErrorStatus.INTERNAL_SERVER_ERROR, 
                    "Lỗi máy chủ khi cập nhật assignee: " + e.getMessage());
        }
    }

    public Task updateTaskSprint(Integer taskId, Integer sprintId, String userId) {
        log.info("Cập nhật sprintId: {} cho taskId: {} bởi userId: {}", sprintId, taskId, userId);
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new AppException(ErrorStatus.TASK_NOT_FOUND));
        if (sprintId != null) {
            Sprint sprint = sprintRepository.findById(sprintId.longValue())
                .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
            if (!sprint.getStatus().equals(SprintStatus.PLANNED) && !sprint.getStatus().equals(SprintStatus.ACTIVE)) {
                throw new AppException(ErrorStatus.INVALID_SPRINT_STATUS, "Sprint phải ở trạng thái PLANNED hoặc ACTIVE");
            }
            if (task.getSprint() != null) {
                Sprint oldSprint = task.getSprint();
                oldSprint.setWorkItems(Math.max(0, oldSprint.getWorkItems() != null ? oldSprint.getWorkItems() - 1 : 0));
                sprintRepository.save(oldSprint);
            }
            task.setSprint(sprint);
            task.setProject(sprint.getProject());
            sprint.setWorkItems(sprint.getWorkItems() != null ? sprint.getWorkItems() + 1 : 1);
            sprintRepository.save(sprint);
        } else {
            if (task.getSprint() != null) {
                Sprint oldSprint = task.getSprint();
                oldSprint.setWorkItems(Math.max(0, oldSprint.getWorkItems() != null ? oldSprint.getWorkItems() - 1 : 0));
                sprintRepository.save(oldSprint);
                task.setSprint(null);
            }
        }
        Task updatedTask = taskRepository.save(task);
        log.info("Task đã cập nhật sprint: {}", updatedTask);
        return updatedTask;
    }

    public List<Sprint> getSprintsByProject(Integer projectId) {
        log.info("Lấy danh sách sprint cho projectId: {}", projectId);
        try {
            List<Sprint> sprints = sprintRepository.findByProjectId((long) projectId);
            return sprints.isEmpty() ? Collections.emptyList() : sprints;
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách sprint cho projectId {}: {}", projectId, e.getMessage(), e);
            throw new AppException(ErrorStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách sprint: " + e.getMessage());
        }
    }

    public List<TaskDTO> getTasksBySprint(Integer sprintId) {
        log.info("Lấy danh sách task cho sprintId: {}", sprintId);
        try {
            Sprint sprint = sprintRepository.findById((long) sprintId)
                    .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
            List<Task> tasks = taskRepository.findBySprintId(sprintId);
            if (tasks == null) {
                log.warn("Không tìm thấy task nào cho sprintId: {}", sprintId);
                return Collections.emptyList();
            }
            log.info("Tìm thấy {} task cho sprintId: {}", tasks.size(), sprintId);
            return tasks.stream()
                    .map(task -> {
                        TaskDTO dto = new TaskDTO();
                        dto.setId(task.getId());
                        dto.setTaskNumber(task.getTaskNumber());
                        dto.setTitle(task.getTitle());
                        dto.setDescription(task.getDescription());
                        dto.setPriority(task.getPriority());
                        dto.setAssigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null);
                        dto.setAssigneeEmail(task.getAssignee() != null ? task.getAssignee().getEmail() : null);
                        dto.setAssigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null);
                        dto.setAssigneeAvatarUrl(task.getAssignee() != null ? task.getAssignee().getAvatar_url() : null);
                        dto.setStartDate(task.getStartDate());
                        dto.setEndDate(task.getEndDate());
                        dto.setStatus(task.getStatus());
                        dto.setCreatedAt(task.getCreatedAt());
                        dto.setSprintId(task.getSprint() != null ? task.getSprint().getId().intValue() : null);
                        dto.setProjectId(task.getProject() != null ? task.getProject().getId() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách task: {}", e.getCustomMessage());
            throw e;
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách task cho sprintId {}: {}", sprintId, e.getMessage(), e);
            throw new AppException(ErrorStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách task: " + e.getMessage());
        }
    }

    public List<TaskDTO> getTasksByBacklog(Integer projectId) {
        log.info("Lấy danh sách task backlog cho projectId: {}", projectId);
        try {
            List<Task> tasks = taskRepository.findBySprintIsNullAndProject_Id(projectId);
            if (tasks == null) {
                log.warn("Không tìm thấy task nào trong backlog cho projectId: {}", projectId);
                return Collections.emptyList();
            }
            log.info("Tìm thấy {} task trong backlog cho projectId: {}", tasks.size(), projectId);
            return tasks.stream()
                    .map(task -> {
                        TaskDTO dto = new TaskDTO();
                        dto.setId(task.getId());
                        dto.setTaskNumber(task.getTaskNumber());
                        dto.setTitle(task.getTitle());
                        dto.setDescription(task.getDescription());
                        dto.setPriority(task.getPriority());
                        dto.setAssigneeId(task.getAssignee() != null ? task.getAssignee().getId() : null);
                        dto.setAssigneeEmail(task.getAssignee() != null ? task.getAssignee().getEmail() : null);
                        dto.setAssigneeName(task.getAssignee() != null ? task.getAssignee().getName() : null);
                        dto.setAssigneeAvatarUrl(task.getAssignee() != null ? task.getAssignee().getAvatar_url() : null);
                        dto.setStartDate(task.getStartDate());
                        dto.setEndDate(task.getEndDate());
                        dto.setStatus(task.getStatus());
                        dto.setCreatedAt(task.getCreatedAt());
                        dto.setSprintId(null);
                        dto.setProjectId(task.getProject() != null ? task.getProject().getId() : null);
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách task backlog cho projectId {}: {}", projectId, e.getMessage(), e);
            throw new AppException(ErrorStatus.INTERNAL_SERVER_ERROR, "Không thể lấy danh sách task backlog: " + e.getMessage());
        }
    }

    public Optional<Sprint> getSprintById(Integer sprintId) {
        log.info("Lấy chi tiết sprint cho sprintId: {}", sprintId);
        return sprintRepository.findById((long) sprintId);
    }
    public int getTaskCount() {
        return (int) taskRepository.count();
    }
}