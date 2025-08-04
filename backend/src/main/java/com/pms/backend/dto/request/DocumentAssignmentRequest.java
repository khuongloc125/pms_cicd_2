package com.pms.backend.dto.request;

import lombok.Data;

@Data
public class DocumentAssignmentRequest {
    private String email;
    private String role;
}