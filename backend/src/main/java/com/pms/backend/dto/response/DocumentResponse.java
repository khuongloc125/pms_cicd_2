package com.pms.backend.dto.response;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class DocumentResponse {
    private String id;
    private Integer projectId;
    private Integer taskId;
    private String name;
    private String uploaderId;
    private String uploaderName;
    private String uploaderAvatar;
    private LocalDateTime uploadDate;
    private Long size;
    private String type;
    private String filePath;
    private String taskTitle;
    private List<DocumentCommentResponse> comments;
    private List<DocumentAssignmentResponse> assignedUsers;
}