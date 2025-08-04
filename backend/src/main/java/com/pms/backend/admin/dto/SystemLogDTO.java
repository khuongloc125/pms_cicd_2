package com.pms.backend.admin.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SystemLogDTO {
    private Long id;
    private LocalDateTime timestamp;
    private String level;
    private String message;
}