package com.pms.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String username;
    private String password;
    private String role;
    private String email;
}