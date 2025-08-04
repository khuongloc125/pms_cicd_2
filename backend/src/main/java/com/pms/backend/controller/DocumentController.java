package com.pms.backend.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pms.backend.dto.request.DocumentAssignmentRequest;
import com.pms.backend.dto.request.DocumentCommentRequest;
import com.pms.backend.dto.request.DocumentCreationRequest;
import com.pms.backend.dto.response.DocumentAssignmentResponse;
import com.pms.backend.dto.response.DocumentCommentResponse;
import com.pms.backend.dto.response.DocumentResponse;
import com.pms.backend.service.DocumentService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/documents")
public class DocumentController {
    DocumentService documentService;

    @PostMapping(value = "/{projectId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<List<DocumentResponse>> uploadDocument(
            @PathVariable Integer projectId,
            @RequestPart("files") MultipartFile[] files,
            @RequestPart("request") DocumentCreationRequest request,
            @RequestHeader("userId") String userId) {
        List<DocumentResponse> responses = documentService.uploadDocuments(projectId, request, files, userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<List<DocumentResponse>> getDocumentsByProject(
            @PathVariable Integer projectId,
            @RequestHeader("userId") String userId) {
        List<DocumentResponse> documents = documentService.getDocumentsByProject(projectId, userId);
        return ResponseEntity.ok(documents);
    }

    @PostMapping("/{documentId}/comments")
    public ResponseEntity<DocumentCommentResponse> addComment(
            @PathVariable Integer documentId,
            @RequestBody DocumentCommentRequest request,
            @RequestHeader("userId") String userId) {
        DocumentCommentResponse response = documentService.addComment(documentId, request, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{documentId}/assign")
    public ResponseEntity<DocumentAssignmentResponse> assignUser(
            @PathVariable Integer documentId,
            @RequestBody DocumentAssignmentRequest request,
            @RequestHeader("userId") String userId) {
        DocumentAssignmentResponse response = documentService.assignUser(documentId, request, userId);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{documentId}/assign/{email}")
    public ResponseEntity<Void> removeAssignment(
            @PathVariable Integer documentId,
            @PathVariable String email,
            @RequestHeader("userId") String userId) {
        documentService.removeAssignment(documentId, email, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<DocumentResponse>> searchUsers(
            @RequestParam String query,
            @RequestHeader("userId") String userId) {
        List<DocumentResponse> users = documentService.searchUsers(query, userId);
        return ResponseEntity.ok(users);
    }
    @GetMapping("/{documentId}/download")
    public ResponseEntity<Resource> downloadDocument(
            @PathVariable Integer documentId,
            @RequestHeader("userId") String userId) {
        Resource file = documentService.getDocumentFile(documentId, userId);
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=\"" + file.getFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(file);
    }
}