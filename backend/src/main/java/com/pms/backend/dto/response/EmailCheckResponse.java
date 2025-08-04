package com.pms.backend.dto.response;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.AccessLevel;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class EmailCheckResponse {
    boolean exists;
}
