package com.pms.backend.dto.request;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskCreationRequest {
    private String title;
    private String description;
    private String priority;
    private String assigneeEmail;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer projectId;
}