package com.pms.backend.entity;
import java.time.LocalDateTime;

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
@Table(name = "notification")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notify_id", updatable = false, nullable = false)
    int id;
    String message;
    LocalDateTime created_At;
    String user_id;
    String user_name;
    String user_email;
    @Column(name = "user_avatar_url")
    String userAvatarUrl;
    String recipient_id;
    String recipient_email;
    String recipient_name;
    String type;
    String status;
    String recipient_avatarUrl;


}
