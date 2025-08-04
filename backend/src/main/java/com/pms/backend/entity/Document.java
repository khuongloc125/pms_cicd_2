package com.pms.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.experimental.FieldDefaults;
@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "documents")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    Integer id;

    @Column(name = "project_id", nullable = false)
    Integer projectId;

    @Column(name = "task_id")
    Integer taskId;

    @Column(name = "name", nullable = false)
    String name;

    @Column(name = "uploader_id", nullable = false)
    String uploaderId;

    @Column(name = "upload_date")
    LocalDateTime uploadDate;

    @Column(name = "size", nullable = false)
    Long size;

    @Column(name = "type", nullable = false)
    String type;

    @Column(name = "file_path", nullable = false)
    String filePath;

    @Column(name = "created_at", nullable = false)
    LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (uploadDate == null) {
            uploadDate = LocalDateTime.now();
        }
    }
}