package com.pms.backend.entity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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
@Table(name = "projects")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Project {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "project_id", updatable = false, nullable = false)
    int id;
    String project_name;
    String created_by_id;
    String created_by_name;
    String color;
    String short_name;
    String project_type;
    String description;
    @Column(name = "created_at", nullable = false)
    LocalDate created_at;
    @Column(name="members")
    String members;
    String leader;
    @Column(name = "start_date")
    LocalDate start_date;

    @Column(name = "end_date")
    LocalDate end_date;
    @Column(name = "status", nullable = false, columnDefinition = "VARCHAR(255) DEFAULT 'ACTIVE'")
    String status;

    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Sprint> sprints;
    @JsonIgnore
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks = new ArrayList<>();
}
