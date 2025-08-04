package com.pms.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentAssignmentResponse {
    private String id;
    private String documentId;
    private String userId;
    private String userName;
    private String userAvatar;
    private String role;
    private LocalDateTime assignedDate;
}