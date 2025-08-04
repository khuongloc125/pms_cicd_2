package com.pms.backend.admin.controller;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.admin.Service.AdminUserService;
import com.pms.backend.admin.dto.AdminLoginDTO;
import com.pms.backend.admin.dto.AdminUserDTO;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpSession;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    @Autowired
    private AdminUserService adminUserService;
    private static final Key SECRET_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);
    private static final long EXPIRATION_TIME = 3600_000; // 1 hour (milliseconds)

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AdminLoginDTO loginDTO, HttpSession session) {
        System.out.println("Received login request for email: " + loginDTO.getEmail());
        try {
            AdminUserDTO adminUserDTO = adminUserService.login(loginDTO);
            session.setAttribute("userId", adminUserDTO.getId());
            session.setAttribute("name", adminUserDTO.getUsername());
            session.setAttribute("role", adminUserDTO.getRole());

            // Generate JWT token
            String token = Jwts.builder()
                    .setSubject(adminUserDTO.getId().toString())
                    .claim("role", adminUserDTO.getRole())
                    .setIssuedAt(new Date())
                    .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                    .signWith(SECRET_KEY)
                    .compact();

            Map<String, Object> response = new HashMap<>();
            response.put("user", adminUserDTO);
            response.put("token", token);

            System.out.println("Login successful for email: " + loginDTO.getEmail());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("Login failed: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}