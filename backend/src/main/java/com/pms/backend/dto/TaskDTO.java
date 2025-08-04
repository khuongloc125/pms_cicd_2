package com.pms.backend.dto;

import java.time.LocalDateTime;

import com.pms.backend.enums.TaskStatus;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskDTO {
    private Integer id;
    private Integer taskNumber;
    private String title;
    private String description;
    private String priority;
    private String assigneeId;
    private String assigneeEmail;
    private String assigneeName;
    private String assigneeAvatarUrl;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private Integer sprintId;
    private Integer projectId;
}