package com.pms.backend.dto.response;

import java.time.LocalDateTime;

import com.pms.backend.enums.TaskStatus;

import lombok.Data;

@Data
public class TaskResponse {
    private Integer id;
    private Integer taskNumber;
    private String title;
    private String description;
    private TaskStatus status;
    private String priority;
    private String assigneeId;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private Integer sprintId;
    private Integer projectId;
}