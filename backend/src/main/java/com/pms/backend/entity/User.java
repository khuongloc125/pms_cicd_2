package com.pms.backend.entity;

import java.time.LocalDate;

import org.hibernate.annotations.GenericGenerator;

import com.pms.backend.enums.AuthProvider;
import com.pms.backend.enums.Role;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    String id;
    String google_id;
    String name;
    String email;
    boolean email_verified;
    String password;
    String avatar_url;
    String access_token;
    String refresh_token;
    String background_url;
    
    @Enumerated(EnumType.STRING)
    AuthProvider authProvider;

    @Enumerated(EnumType.STRING)
    Role role;

    int expiresIn;

    @Column(name = "created_at")
    LocalDate createdAt;

    int project_id;

}
