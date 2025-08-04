package com.pms.backend.dto.request;
import lombok.Data;
@Data
public class SprintCreationRequest {
    private String name;
    private String startDate;
    private String endDate;
    private String sprintGoal;
    private String duration;
}