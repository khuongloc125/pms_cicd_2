package com.pms.backend.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.request.ApiResponsive;
import com.pms.backend.dto.request.ProjectCreationRequest;
import com.pms.backend.dto.request.ProjectUpdateRequest;
import com.pms.backend.dto.response.ProjectResponse;
import com.pms.backend.entity.Project;
import com.pms.backend.service.ProjectService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/projects")
public class ProjectController {

    ProjectService projectService;

    @PostMapping("/create-project")
    public ApiResponsive<ProjectResponse> createProject(
            @RequestBody ProjectCreationRequest request,
            @RequestHeader("userId") String userId
    ) {
        String userName = request.getUserName();
        if (userName == null || userName.trim().isEmpty()) {
            throw new IllegalArgumentException("userName is required");
        }
        ProjectResponse projectResponse = projectService.createProject(request, userId, userName);
        return ApiResponsive.<ProjectResponse>builder()
                .result(projectResponse)
                .build();
    }

    @GetMapping("/my-projects")
    public ResponseEntity<List<ProjectResponse>> getMyProjects(@RequestHeader("userId") String userId) {
        List<ProjectResponse> projects = projectService.getProjectsByUser(userId);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/find-all")
    public ResponseEntity<List<Project>> findAllProjects(
            @RequestHeader("userId") String userId,
            @RequestHeader(value = "role", required = false) String role) {
        List<Project> projects = projectService.findAll(userId, role);
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(
            @PathVariable("projectId") int projectId,
            @RequestHeader("userId") String userId) {
        ProjectResponse projectResponse = projectService.getProjectById(projectId, userId);
        return ResponseEntity.ok(projectResponse);
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable("projectId") int projectId,
            @RequestBody ProjectUpdateRequest request,
            @RequestHeader("userId") String userId) {
        ProjectResponse projectResponse = projectService.updateProject(projectId, request, userId);
        return ResponseEntity.ok(projectResponse);
    }

    @DeleteMapping("/delete/{projectId}")
    public ResponseEntity<String> deleteProject(
            @PathVariable("projectId") int projectId,
            @RequestHeader("userId") String userId) {
        projectService.deleteProject(projectId, userId);
        return ResponseEntity.ok("Project deleted successfully");
    }
    @GetMapping("/count")
    public ResponseEntity<Integer> getProjectCount() {
        return ResponseEntity.ok(projectService.getProjectCount());
    }
    @GetMapping("/daily-count")
    public ResponseEntity<Map<String, Integer>> getDailyProjectCount() {
        Map<String, Integer> dailyCount = new HashMap<>();
        LocalDate today = LocalDate.now(); // 11/07/2025
        for (int i = 5; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            dailyCount.put(date.toString(), projectService.countProjectsByDate(date));
        }
        return ResponseEntity.ok(dailyCount);
    }
    @GetMapping("/count/active")
    public ResponseEntity<Integer> countActiveProjects() {
        return ResponseEntity.ok(projectService.countProjectsByStatus("ACTIVE"));
    }

    @GetMapping("/count/completed")
    public ResponseEntity<Integer> countCompletedProjects() {
        return ResponseEntity.ok(projectService.countProjectsByStatus("COMPLETED"));
    }
}

