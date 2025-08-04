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
public class ProjectResponse {
    int id;
    String project_name;
    String created_by_id;
    String created_by_name;
    String project_type;
    String description;
    String members;
    String leader;
    String short_name;
    String color;
    LocalDate created_at;
    LocalDate start_date; // Thêm trường mới
    LocalDate end_date;
    String status;
}