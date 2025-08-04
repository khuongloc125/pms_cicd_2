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
@Table(name = "document_assignments")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    Integer id;

    @Column(name = "document_id", nullable = false)
    Integer documentId;

    @Column(name = "user_id", nullable = false)
    String userId;

    @Column(name = "role", nullable = false)
    String role;

    @Column(name = "assigned_date")
    LocalDateTime assignedDate;

    @PrePersist
    public void prePersist() {
        if (assignedDate == null) {
            assignedDate = LocalDateTime.now();
        }
    }
}