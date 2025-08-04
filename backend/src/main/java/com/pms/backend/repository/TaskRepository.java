package com.pms.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pms.backend.entity.Task;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findBySprintId(Integer sprintId);
    List<Task> findBySprintIsNullAndProject_Id(Integer projectId);
    Optional<Task> findByIdAndProject_Id(Integer taskId, Integer projectId);
    @Query("SELECT COALESCE(MAX(t.taskNumber), 0) FROM Task t WHERE t.project.id = :projectId")
    Integer findMaxTaskNumberByProjectId(@Param("projectId") Integer projectId);
}
