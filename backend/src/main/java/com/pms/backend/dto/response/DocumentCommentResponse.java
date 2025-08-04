package com.pms.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class DocumentCommentResponse {
    private String id;
    private String documentId;
    private String userId;
    private String userName;
    private String avatar;
    private String text;
    private LocalDateTime timestamp;
}