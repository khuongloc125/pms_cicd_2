package com.pms.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.NotificationResponse;
import com.pms.backend.exception.AppException;
import com.pms.backend.service.NotificationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationController {

    NotificationService notificationService;

    @PostMapping("/webhook/send_email")
    public ResponseEntity<String> handleWebhook(@RequestBody List<NotificationRequest> requests) {
        try {
            notificationService.createNotifications(requests);
            return ResponseEntity.ok("Notifications created successfully");
        } catch (AppException e) {
            return ResponseEntity.status(e.getErrorStatus().getStatus())
                    .body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Internal server error: " + e.getMessage());
        }
    }

    @GetMapping("/recipient/{email}")
    public ResponseEntity<List<NotificationResponse>> getNotificationsByRecipientEmail(@PathVariable String email) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByRecipientEmail(email);
        return ResponseEntity.ok(notifications);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable int id) {
        notificationService.markNotificationAsRead(id);
        return ResponseEntity.ok().build();
    }
}