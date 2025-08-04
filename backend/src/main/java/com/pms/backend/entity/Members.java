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
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "members")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Members {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", updatable = false, nullable = false)
    int id;

    String name;

    String email;

    @Column(name = "project_id")
    String projectId;

    @Column(name = "invited_by_name")
    String invitedByName;

    @Column(name = "invited_at")
    String invitedAt;

    String role;

    @Column(name = "avatar_url")
    String avatarUrl;
}