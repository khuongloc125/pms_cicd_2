package com.pms.backend.dto.response;

import lombok.Data;

@Data
public class SprintResponse {
    private Long id;
    private String name;
    private String createById;
    private String createByName;
    private String duration;
    private String endDate;
    private String sprintGoal;
    private String startDate;
    private String status;
    private Integer workItems;
    private Long projectId;
}