package com.pms.backend.repository;

import com.pms.backend.entity.Sprint;
import com.pms.backend.enums.SprintStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SprintRepository extends JpaRepository<Sprint, Long> {
    Optional<Sprint> findByProjectIdAndName(Long projectId, String name);
    List<Sprint> findByProjectId(Long projectId);
    List<Sprint> findByProjectIdAndStatus(Long projectId, SprintStatus status);
}