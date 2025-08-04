package com.pms.backend.admin.dto;

import lombok.Data;

@Data
public class AdminLoginDTO {
    private String email;
    private String password;
}