package com.pms.backend.service;

import java.security.Key;
import java.util.Date;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pms.backend.dto.request.AuthenticationRequest;
import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.entity.User;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    private static final Key SECRET_KEY = Keys.secretKeyFor(SignatureAlgorithm.HS512);
    private static final long EXPIRATION_TIME = 3600_000; // 1 giờ (milliseconds);
    private static final String DEFAULT_AVATAR_URL = "http://localhost:8080/uploads/avatars/default-avatar.png";

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorStatus.USER_NOT_EXISTED));

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new AppException(ErrorStatus.INVALID_CREDENTIALS);
        }

        if (user.getAvatar_url() == null || user.getAvatar_url().isEmpty()) {
            user.setAvatar_url(DEFAULT_AVATAR_URL);
            userRepository.save(user); // Lưu thay đổi vào cơ sở dữ liệu
        }
        // Tạo JWT
        String accessToken = Jwts.builder()
                .setSubject(user.getEmail())
                .claim("userId", user.getId())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME))
                .signWith(SECRET_KEY)
                .compact();

        return AuthenticationResponse.builder()
                .authenticated(true)
                .accessToken(accessToken)
                .expiresIn(EXPIRATION_TIME / 1000)
                .id(user.getId())
                .name(user.getName() != null ? user.getName() : "User") // Thêm tên
                .email(user.getEmail()) // Thêm email
                .avatarUrl(user.getAvatar_url() != null ? user.getAvatar_url() : "")// seconds
                .role(user.getRole().name())
                .backgroundUrl(user.getBackground_url() != null ? user.getBackground_url() : "")
                .createdAt(user.getCreatedAt())
                .build();
    }
}
