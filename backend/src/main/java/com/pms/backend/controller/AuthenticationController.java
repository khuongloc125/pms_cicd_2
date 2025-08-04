package com.pms.backend.controller;

import java.security.Key;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.dto.request.ApiResponsive;
import com.pms.backend.dto.request.AuthenticationRequest;
import com.pms.backend.dto.response.AuthenticationResponse;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.AuthenticationService;

import io.jsonwebtoken.security.Keys;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@RequestMapping("/api/auth")
public class AuthenticationController {

    final AuthenticationService authenticationService;
    final UserRepository userRepository;
    private static final Key SECRET_KEY = Keys.secretKeyFor(io.jsonwebtoken.SignatureAlgorithm.HS512);

    @PostMapping("/login")
    ApiResponsive<AuthenticationResponse> authenticate(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authenticationService.authenticate(request);
        return ApiResponsive.<AuthenticationResponse>builder()
                .result(response)
                .build();
    }
}
