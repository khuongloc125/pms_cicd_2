package com.pms.backend.mapper;

import com.pms.backend.dto.request.NotificationRequest;
import com.pms.backend.dto.response.NotificationResponse;
import com.pms.backend.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface NotificationMapper {
    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "message", expression = "java(String.format(\"%s (%s) added you to the project %s\", request.getSender().getName(), request.getSender().getEmail(), request.getProject().getName()))")
    @Mapping(target = "created_At", expression = "java(java.time.LocalDateTime.now())")
    @Mapping(target = "user_id", source = "sender.id")
    @Mapping(target = "user_name", source = "sender.name")
    @Mapping(target = "user_email", source = "sender.email")
    @Mapping(target = "userAvatarUrl", source = "sender.avatar")
    @Mapping(target = "recipient_id", source = "receiver.id")
    @Mapping(target = "recipient_email", source = "receiver.email")
    @Mapping(target = "recipient_name", source = "receiver.name")
    @Mapping(target = "recipient_avatarUrl", source = "receiver.avatar")
    @Mapping(target = "type", constant = "ADD_MEMBER")
    @Mapping(target = "status", constant = "UNREAD")
    Notification toNotification(NotificationRequest request);

    @Mapping(target = "createdAt", source = "created_At")
    NotificationResponse toNotificationResponse(Notification notification);
}