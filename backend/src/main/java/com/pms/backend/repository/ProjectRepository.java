package com.pms.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pms.backend.entity.Project;

public interface ProjectRepository extends JpaRepository<Project, Integer> {
    @Query("SELECT p FROM Project p WHERE p.created_at = :date")
    List<Project> findByCreatedAt(@Param("date") LocalDate date);
    @Query("SELECT p FROM Project p WHERE p.leader = :name OR p.members LIKE %:name%")
List<Project> findAllByLeaderOrMembers(String name);
}
