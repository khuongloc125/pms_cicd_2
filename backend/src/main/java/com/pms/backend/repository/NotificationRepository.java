package com.pms.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.pms.backend.entity.Notification;

// Trong NotificationRepository.java
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    @Query("SELECT n FROM Notification n WHERE n.recipient_email = :email")
    List<Notification> findByRecipientEmail(@Param("email") String email);
}
