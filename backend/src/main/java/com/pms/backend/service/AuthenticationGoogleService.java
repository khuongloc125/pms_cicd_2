package com.pms.backend.service;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import com.pms.backend.entity.User;
import com.pms.backend.enums.AuthProvider;
import com.pms.backend.enums.Role;
import com.pms.backend.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationGoogleService {

    final UserRepository userRepository;
    final OAuth2AuthorizedClientService authorizedClientService;

    public User loginRegisterByGoogleOAuth2(OAuth2AuthenticationToken auth2AuthenticationToken) {
        OAuth2User oAuth2User = auth2AuthenticationToken.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String googleId = oAuth2User.getAttribute("sub");
        String avatar = oAuth2User.getAttribute("picture");

        log.info("USER EMAIL FROM GOOGLE IS {}", email);
        log.info("USER NAME FROM GOOGLE IS {}", name);

        OAuth2AuthorizedClient authorizedClient = authorizedClientService.loadAuthorizedClient(
                auth2AuthenticationToken.getAuthorizedClientRegistrationId(),
                auth2AuthenticationToken.getName());
        String accessToken = authorizedClient.getAccessToken().getTokenValue();
        String refreshToken = (authorizedClient.getRefreshToken() != null)
                ? authorizedClient.getRefreshToken().getTokenValue()
                : null;
        // Calculate expiresIn from access token expiration
        Instant expiresAt = authorizedClient.getAccessToken().getExpiresAt();
        long expiresIn = expiresAt != null ? (expiresAt.getEpochSecond() - Instant.now().getEpochSecond()) : 3600;

        log.info("ACCESS TOKEN: {}", accessToken);
        log.info("REFRESH TOKEN: {}", refreshToken != null ? refreshToken : "null (Google did not provide a refresh token)");
        log.info("EXPIRES IN: {} seconds", expiresIn);

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setName(name);
            user.setEmail(email);
            user.setGoogle_id(googleId);
            user.setAvatar_url(avatar);
            user.setAccess_token(accessToken);
            user.setRefresh_token(refreshToken);
            user.setAuthProvider(AuthProvider.GOOGLE);
            user.setRole(Role.USER);
            user.setCreatedAt(LocalDate.now());
            userRepository.save(user);
        } else {
            if (user.getGoogle_id() == null) {
                user.setGoogle_id(googleId);
            }
            if (user.getName() == null || !user.getName().equals(name)) {
                user.setName(name);
            }
            if (user.getAvatar_url() != null && !user.getAvatar_url().contains("google")) {
                // Giữ avatar tùy chỉnh nếu đã upload
            } else {
                user.setAvatar_url(avatar); // Cập nhật avatar Google nếu chưa có tùy chỉnh
            }
            if (user.getAccess_token() == null || !user.getAccess_token().equals(accessToken)) {
                user.setAccess_token(accessToken);
            }
            if (refreshToken != null && (user.getRefresh_token() == null || !user.getRefresh_token().equals(refreshToken))) {
                user.setRefresh_token(refreshToken);
            }
            userRepository.save(user);
        }

        // Set expiresIn in user object for controller to use
        user.setExpiresIn((int) expiresIn);
        return user;
    }
}
