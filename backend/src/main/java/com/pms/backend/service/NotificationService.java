package com.pms.backend.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.NotificationResponse;
import com.pms.backend.entity.Notification;
import com.pms.backend.enums.NotificationStatus;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.mapper.NotificationMapper;
import com.pms.backend.repository.NotificationRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationService {

    NotificationRepository notificationRepository;
    NotificationMapper notificationMapper;

    public void createNotifications(List<NotificationRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            log.error("Notification requests list is null or empty");
            throw new AppException(ErrorStatus.NOTIFICATION_CREATION_FAILED, "No notification requests provided");
        }

        for (NotificationRequest request : requests) {
            try {
                // Log the full request for debugging
                log.info("Processing notification request: {}", request);

                // Validate request data
                StringBuilder errorMessage = new StringBuilder();
                if (request.getSender() == null) {
                    errorMessage.append("Sender is null; ");
                } else {
                    if (request.getSender().getId() == null) errorMessage.append("Sender ID is null; ");
                    if (request.getSender().getName() == null) errorMessage.append("Sender name is null; ");
                    if (request.getSender().getEmail() == null) errorMessage.append("Sender email is null; ");
                }
                if (request.getReceiver() == null) {
                    errorMessage.append("Receiver is null; ");
                } else {
                    if (request.getReceiver().getId() == null) errorMessage.append("Receiver ID is null; ");
                    if (request.getReceiver().getName() == null) errorMessage.append("Receiver name is null; ");
                    if (request.getReceiver().getEmail() == null) errorMessage.append("Receiver email is null; ");
                }
                if (request.getProject() == null) {
                    errorMessage.append("Project is null; ");
                } else if (request.getProject().getName() == null) {
                    errorMessage.append("Project name is null; ");
                }

                if (errorMessage.length() > 0) {
                    log.error("Invalid notification request data: {} - {}", request, errorMessage);
                    throw new AppException(ErrorStatus.NOTIFICATION_CREATION_FAILED, "Invalid notification request: " + errorMessage.toString());
                }

                Notification notification = notificationMapper.toNotification(request);
                notificationRepository.save(notification);
                log.info("Notification created for recipient: {}", request.getReceiver().getEmail());
            } catch (Exception e) {
                log.error("Failed to create notification for recipient: {}", 
                    request.getReceiver() != null ? request.getReceiver().getEmail() : "unknown", e);
                throw new AppException(ErrorStatus.NOTIFICATION_CREATION_FAILED, 
                    "Failed to create notification: " + e.getMessage());
            }
        }
    }

    public List<NotificationResponse> getNotificationsByRecipientEmail(String recipientEmail) {
        if (recipientEmail == null || recipientEmail.isEmpty()) {
            log.error("Recipient email is null or empty");
            throw new AppException(ErrorStatus.INVALID_INPUT, "Recipient email is required");
        }

        List<Notification> notifications = notificationRepository.findByRecipientEmail(recipientEmail);
        return notifications.stream()
                .map(notificationMapper::toNotificationResponse)
                .collect(Collectors.toList());
    }

    public void markNotificationAsRead(int notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorStatus.NOTIFICATION_NOT_FOUND));
        notification.setStatus(NotificationStatus.READ.name());
        notificationRepository.save(notification);
        log.info("Notification marked as read: {}", notificationId);
    }
}