package com.pms.backend.dto.response;

import java.time.LocalDate;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationResponse {
    boolean authenticated;
    private String id;
    private String accessToken;
    private long expiresIn;
    private String name;
    private String email;
    private String avatarUrl;
    private String role;
    private LocalDate createdAt;
    private String backgroundUrl;
}
