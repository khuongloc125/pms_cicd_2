package com.pms.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.TaskDTO;
import com.pms.backend.dto.request.SprintCreationRequest;
import com.pms.backend.dto.request.TaskCreationRequest;
import com.pms.backend.dto.request.TaskUpdateRequest;
import com.pms.backend.entity.Sprint;
import com.pms.backend.entity.Task;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.service.SprintService;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
@RequestMapping("/api/sprints")
@Validated
public class SprintController {

    SprintService sprintService;

    @PostMapping("/project/{projectId}")
    public ResponseEntity<?> createSprint(
            @PathVariable @NotNull(message = "Project ID cannot be null") Integer projectId,
            @RequestBody SprintCreationRequest request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId,
            @RequestHeader @NotEmpty(message = "User name cannot be empty") String userName) {
        try {
            log.info("Tạo sprint cho projectId: {}, userId: {}, userName: {}", projectId, userId, userName);
            Sprint sprint = sprintService.createSprint(projectId, request, userId, userName);
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi tạo sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/{sprintId}/start")
    public ResponseEntity<?> startSprint(
            @PathVariable @NotNull(message = "Sprint ID cannot be null") Integer sprintId,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Bắt đầu sprintId: {}, userId: {}", sprintId, userId);
            Sprint sprint = sprintService.startSprint(sprintId, userId);
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi bắt đầu sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi bắt đầu sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/{sprintId}/complete")
    public ResponseEntity<?> completeSprint(
            @PathVariable @NotNull(message = "Sprint ID cannot be null") Integer sprintId,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Hoàn thành sprintId: {}, userId: {}", sprintId, userId);
            Sprint sprint = sprintService.completeSprint(sprintId, userId);
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi hoàn thành sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi hoàn thành sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @DeleteMapping("/{sprintId}")
    public ResponseEntity<?> deleteSprint(
            @PathVariable @NotNull(message = "Sprint ID cannot be null") Integer sprintId,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId,
            @RequestBody Map<String, Boolean> request) {
        try {
            log.info("Xóa sprintId: {}, userId: {}, moveTasksToBacklog: {}", sprintId, userId, request.get("moveTasksToBacklog"));
            sprintService.deleteSprint(sprintId, userId, request.get("moveTasksToBacklog"));
            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            log.error("Lỗi khi xóa sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi xóa sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PostMapping("/task/{sprintId}")
    public ResponseEntity<?> createTask(
            @PathVariable @NotNull(message = "Sprint ID cannot be null") Integer sprintId,
            @RequestBody TaskCreationRequest request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Tạo task cho sprintId: {} với request: {}", sprintId, request);
            Task task = sprintService.createTask(sprintId, request);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi tạo task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PostMapping("/task/backlog/{projectId}")
    public ResponseEntity<?> createBacklogTask(
            @PathVariable @NotNull(message = "Project ID cannot be null") Integer projectId,
            @RequestBody TaskCreationRequest request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Tạo task trong backlog cho projectId: {} với request: {}", projectId, request);
            Task task = sprintService.createBacklogTask(projectId, request);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi tạo task trong backlog: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi tạo task trong backlog: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/task/{taskId}")
    public ResponseEntity<?> updateTask(
            @PathVariable @NotNull(message = "Task ID cannot be null") Integer taskId,
            @RequestBody TaskUpdateRequest request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Cập nhật taskId: {}, request: {}, userId: {}", taskId, request, userId);
            Task task = sprintService.updateTask(taskId, request, userId);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi cập nhật task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @DeleteMapping("/task/{taskId}")
    public ResponseEntity<?> deleteTask(
            @PathVariable @NotNull(message = "Task ID cannot be null") Integer taskId,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Xóa taskId: {} bởi userId: {}", taskId, userId);
            sprintService.deleteTask(taskId, userId);
            return ResponseEntity.noContent().build();
        } catch (AppException e) {
            log.error("Lỗi khi xóa task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi xóa task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/task/{taskId}/status")
    public ResponseEntity<?> updateTaskStatus(
            @PathVariable @NotNull(message = "Task ID cannot be null") Integer taskId,
            @RequestBody TaskUpdateRequest request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Cập nhật trạng thái taskId: {}, status: {}, userId: {}", taskId, request.getStatus(), userId);
            Task task = sprintService.updateTaskStatus(taskId, request, userId);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi cập nhật trạng thái task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật trạng thái task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/task/{taskId}/assignee")
    public ResponseEntity<?> updateTaskAssignee(
            @PathVariable @NotNull(message = "Task ID cannot be null") Integer taskId,
            @RequestBody Map<String, String> request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId,
            @RequestParam @NotNull(message = "Project ID cannot be null") Integer projectId) {
        try {
            log.info("Cập nhật assignee cho taskId: {}, userId: {}, projectId: {}", taskId, userId, projectId);
            String assigneeEmail = request.get("assigneeEmail");
            TaskDTO taskDTO = sprintService.updateTaskAssignee(taskId, assigneeEmail, userId, projectId);
            return ResponseEntity.ok(taskDTO);
        } catch (AppException e) {
            log.error("Lỗi khi cập nhật assignee: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật assignee: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @PutMapping("/task/{taskId}/sprint")
    public ResponseEntity<?> updateTaskSprint(
            @PathVariable @NotNull(message = "Task ID cannot be null") Integer taskId,
            @RequestBody Map<String, Integer> request,
            @RequestHeader @NotEmpty(message = "User ID cannot be empty") String userId) {
        try {
            log.info("Cập nhật sprint cho taskId: {}, userId: {}", taskId, userId);
            Task task = sprintService.updateTaskSprint(taskId, request.get("sprintId"), userId);
            return ResponseEntity.ok(task);
        } catch (AppException e) {
            log.error("Lỗi khi cập nhật sprint cho task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi cập nhật sprint cho task: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @GetMapping("/project/{projectId}")
    public ResponseEntity<?> getSprintsByProject(
            @PathVariable @NotNull(message = "Project ID cannot be null") Integer projectId) {
        try {
            log.info("Lấy danh sách sprint cho projectId: {}", projectId);
            List<Sprint> sprints = sprintService.getSprintsByProject(projectId);
            return ResponseEntity.ok(sprints);
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @GetMapping("/tasks/{sprintId}")
    public ResponseEntity<?> getTasksBySprint(
            @PathVariable @NotNull(message = "Sprint ID cannot be null") Integer sprintId) {
        try {
            log.info("Lấy danh sách task cho sprintId: {}", sprintId);
            List<TaskDTO> tasks = sprintService.getTasksBySprint(sprintId);
            return ResponseEntity.ok(tasks);
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách task: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách task cho sprintId {}: {}", sprintId, e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @GetMapping("/tasks/backlog/{projectId}")
    public ResponseEntity<?> getTasksByBacklog(
            @PathVariable @NotNull(message = "Project ID cannot be null") Integer projectId) {
        try {
            log.info("Lấy danh sách task backlog cho projectId: {}", projectId);
            List<TaskDTO> tasks = sprintService.getTasksByBacklog(projectId);
            return ResponseEntity.ok(tasks);
        } catch (AppException e) {
            log.error("Lỗi khi lấy danh sách task backlog: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy danh sách task backlog: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }

    @GetMapping("/{sprintId}")
    public ResponseEntity<?> getSprintById(
            @PathVariable @NotNull(message = "Sprint ID cannot be null") Integer sprintId) {
        try {
            log.info("Lấy chi tiết sprint cho sprintId: {}", sprintId);
            Sprint sprint = sprintService.getSprintById(sprintId)
                    .orElseThrow(() -> new AppException(ErrorStatus.SPRINT_NOT_FOUND));
            return ResponseEntity.ok(sprint);
        } catch (AppException e) {
            log.error("Lỗi khi lấy chi tiết sprint: {}", e.getCustomMessage());
            return ResponseEntity.status(e.getErrorStatus().getStatus()).body(
                Map.of("status", e.getErrorStatus().getStatus(), "message", e.getCustomMessage())
            );
        } catch (Exception e) {
            log.error("Lỗi không xác định khi lấy chi tiết sprint: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body(
                Map.of("status", 500, "message", "Lỗi máy chủ nội bộ: " + e.getMessage())
            );
        }
    }
     @GetMapping("/count")
    public ResponseEntity<Integer> getTaskCount() {
        return ResponseEntity.ok(sprintService.getTaskCount());
    }

}