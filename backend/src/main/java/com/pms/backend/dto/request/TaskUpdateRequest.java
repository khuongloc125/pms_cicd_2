package com.pms.backend.dto.request;

import com.pms.backend.enums.TaskStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TaskUpdateRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private String priority;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}