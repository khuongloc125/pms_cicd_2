package com.pms.backend.dto.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    int id;
    String message;
    LocalDateTime createdAt;
    String userId;
    String userName;
    String userEmail;
    String userAvatarUrl;
    String recipientId;
    String recipientEmail;
    String recipientName;
    String recipientAvatarUrl;
    String type;
    String status;
}