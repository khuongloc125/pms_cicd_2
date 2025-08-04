package com.pms.backend.dto;

import java.time.LocalDate;

import com.pms.backend.enums.SprintStatus;

import lombok.Data;

@Data
public class SprintResponseDTO {
    private Long id;
    private String name;
    private String createById;
    private String createByName;
    private String duration;
    private LocalDate endDate;
    private String sprintGoal;
    private LocalDate startDate;
    private SprintStatus status;
    private Integer workItems;
    private Integer projectId;  // Chỉ include ID thay vì full Project
} 
