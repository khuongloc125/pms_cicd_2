package com.pms.backend.admin.repostitory;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.pms.backend.admin.entity.SystemLog;

@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
}