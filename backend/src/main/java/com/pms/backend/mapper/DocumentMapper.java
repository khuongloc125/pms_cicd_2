package com.pms.backend.mapper;

import com.pms.backend.dto.response.DocumentAssignmentResponse;
import com.pms.backend.dto.response.DocumentCommentResponse;
import com.pms.backend.dto.response.DocumentResponse;
import com.pms.backend.entity.Document;
import com.pms.backend.entity.DocumentAssignment;
import com.pms.backend.entity.DocumentComment;
import com.pms.backend.entity.Task;
import com.pms.backend.entity.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DocumentMapper {
    public DocumentResponse toDocumentResponse(Document document, User uploader, Task task, List<DocumentCommentResponse> comments, List<DocumentAssignmentResponse> assignments) {
        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId().toString());
        response.setProjectId(document.getProjectId());
        response.setTaskId(document.getTaskId());
        response.setName(document.getName());
        response.setUploaderId(document.getUploaderId());
        response.setUploaderName(uploader != null ? uploader.getName() : null);
        response.setUploaderAvatar(uploader != null ? uploader.getAvatar_url() : null);
        response.setUploadDate(document.getUploadDate());
        response.setSize(document.getSize());
        response.setType(document.getType());
        response.setFilePath(document.getFilePath());
        response.setTaskTitle(task != null ? task.getTitle() : null);
        response.setComments(comments);
        response.setAssignedUsers(assignments);
        return response;
    }

    public DocumentCommentResponse toDocumentCommentResponse(DocumentComment comment, User user) {
        DocumentCommentResponse response = new DocumentCommentResponse();
        response.setId(comment.getId().toString());
        response.setDocumentId(comment.getDocumentId().toString());
        response.setUserId(comment.getUserId());
        response.setUserName(user != null ? user.getName() : null);
        response.setAvatar(user != null ? user.getAvatar_url() : null);
        response.setText(comment.getText());
        response.setTimestamp(comment.getTimestamp());
        return response;
    }

    public DocumentAssignmentResponse toDocumentAssignmentResponse(DocumentAssignment assignment, User user) {
        DocumentAssignmentResponse response = new DocumentAssignmentResponse();
        response.setId(assignment.getId().toString());
        response.setDocumentId(assignment.getDocumentId().toString());
        response.setUserId(assignment.getUserId());
        response.setUserName(user != null ? user.getName() : null);
        response.setUserAvatar(user != null ? user.getAvatar_url() : null);
        response.setRole(assignment.getRole());
        response.setAssignedDate(assignment.getAssignedDate());
        return response;
    }
}