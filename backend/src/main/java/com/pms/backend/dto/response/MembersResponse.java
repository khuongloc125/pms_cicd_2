package com.pms.backend.dto.response;

import lombok.Data;

@Data
public class MembersResponse {
    private int id;
    private String name;
    private String email;
    private String projectId;
    private String invitedByName;
    private String invitedAt;
    private String role;
    private String avatarUrl;
}
