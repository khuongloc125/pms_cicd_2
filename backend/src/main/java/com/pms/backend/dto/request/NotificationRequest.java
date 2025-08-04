package com.pms.backend.dto.request;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRequest {
    Sender sender;
    Receiver receiver;
    Project project;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Sender {
        String id;
        String name;
        String email;
        String avatar;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Receiver {
        String id;
        String name;
        String email;
        String avatar;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class Project {
        String name;
    }
}