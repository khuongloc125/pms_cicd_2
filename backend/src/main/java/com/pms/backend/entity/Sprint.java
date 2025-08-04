package com.pms.backend.entity;

import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pms.backend.enums.SprintStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "sprints")
@Getter
@Setter
public class Sprint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name")
    private String name;

    @Column(name = "create_by_id")
    private String createById;

    @Column(name = "create_by_name")
    private String createByName;

    @Column(name = "duration")
    private String duration;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "sprint_goal")
    private String sprintGoal;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private SprintStatus status;

    @Column(name = "work_items")
    private Integer workItems;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Project project;

    @JsonIgnore
    @OneToMany(mappedBy = "sprint", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Task> tasks;

    // Thêm phương thức để kiểm tra tính toàn vẹn (tùy chọn)
    @PrePersist
    @PreUpdate
    private void validate() {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalStateException("Name cannot be null or empty");
        }
    }
}