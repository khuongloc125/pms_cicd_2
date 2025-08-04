package com.pms.backend.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.pms.backend.dto.request.EmailCheckRequest;
import com.pms.backend.dto.request.UserCreationRequest;
import com.pms.backend.dto.request.UserUpdateRequest;
import com.pms.backend.dto.response.EmailCheckResponse;
import com.pms.backend.dto.response.UserResponse;
import com.pms.backend.entity.User;
import com.pms.backend.exception.AppException;
import com.pms.backend.exception.ErrorStatus;
import com.pms.backend.repository.UserRepository;
import com.pms.backend.service.MembersService;
import com.pms.backend.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;


@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/auth")
public class UserController {
    final UserService userService;
    final UserRepository userRepository;
    final MembersService membersService;
    @PostMapping("/register")
public ResponseEntity<?> createUser(@RequestBody UserCreationRequest request) {
    try {
        log.info("Processing registration for email: {}", request.getEmail());
        User user = userService.createRequest(request);
        log.info("User created successfully: {}", user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("result", user); // Thay đổi từ "user" thành "result"
        response.put("message", "Registration successful");
        
        return ResponseEntity.ok(response);
    } catch (AppException e) {
        log.error("Registration failed: {}", e.getMessage());
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", e.getMessage());
        errorResponse.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
    } catch (Exception e) {
        log.error("Unexpected error during registration: {}", e.getMessage());
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", "Unexpected error occurred");
        errorResponse.put("message", "Unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
    }
}

    @PostMapping("/check-email")
    ResponseEntity<?> checkEmail(@RequestBody EmailCheckRequest request) {
        boolean exists = userService.checkEmailExists(request.getEmail());
        return ResponseEntity.ok(new EmailCheckResponse(exists));
    }

    @GetMapping("/get-users")
    List<User> getUsers(){
        return userService.getUsers();
    }


    @GetMapping("/get-users/{userId}")
    UserResponse getUser(@PathVariable("userId") UUID userId){
        return userService.getUser(userId);
    }


    @PutMapping("/update-user/{userId}")
    UserResponse updateUser(@PathVariable("userId") UUID userId, @RequestBody UserUpdateRequest request){
        return userService.updateUserRequest(userId,request);
    }

    @PutMapping("/update-user-by-email/{email}")
    UserResponse updateUserByEmail(@PathVariable("email") String email, @RequestBody UserUpdateRequest request){
        if (request.getName() == null || request.getName().trim().isEmpty()) {
        throw new AppException(ErrorStatus.INVALID_INPUT); // Thêm kiểm tra
        }
        return userService.updateUserRequestEmail(email,request);
    }


    @DeleteMapping("/delete-user/{userId}")
    String deleteUser(@PathVariable("userId") UUID id){
        userService.deleteUser(id);
        return "User has been deleted";
    }
    // Chỉ thay thế các method upload trong UserController.java

@PostMapping("/upload-avatar")
    public ResponseEntity<Map<String, Object>> uploadAvatar(
            @RequestParam("avatar") MultipartFile file, 
            @RequestParam("email") String email) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Kiểm tra kích thước file (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size exceeds 5MB limit");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Kiểm tra định dạng file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Only image files are allowed");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email not found"));

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/avatars/" + fileName);
            Files.createDirectories(uploadPath.getParent());
            Files.write(uploadPath, file.getBytes());

            String avatarUrl = "http://localhost:8080/uploads/avatars/" + fileName;
            user.setAvatar_url(avatarUrl);
            userRepository.save(user);
            membersService.updateMemberAvatar(email, avatarUrl);

            response.put("success", true);
            response.put("avatarUrl", avatarUrl);
            response.put("message", "Avatar uploaded successfully");
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error uploading avatar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/upload-background")
    public ResponseEntity<Map<String, Object>> uploadBackground(
            @RequestParam("background") MultipartFile file, 
            @RequestParam("email") String email) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // Kiểm tra kích thước file (5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "File size exceeds 5MB limit");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            // Kiểm tra định dạng file
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "Only image files are allowed");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email not found"));

            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path uploadPath = Paths.get("uploads/backgrounds/" + fileName);
            Files.createDirectories(uploadPath.getParent());
            Files.write(uploadPath, file.getBytes());

            String backgroundUrl = "http://localhost:8080/uploads/backgrounds/" + fileName;
            user.setBackground_url(backgroundUrl);
            userRepository.save(user);

            response.put("success", true);
            response.put("backgroundUrl", backgroundUrl);
            response.put("message", "Background uploaded successfully");
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error uploading background: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/remove-background")
    public ResponseEntity<Map<String, Object>> removeBackground(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            String email = request.get("email");
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("Email not found"));

            if (user.getBackground_url() != null) {
                String fileName = user.getBackground_url().substring(user.getBackground_url().lastIndexOf("/") + 1);
                Path filePath = Paths.get("uploads/backgrounds/" + fileName);
                Files.deleteIfExists(filePath);
                user.setBackground_url(null);
                userRepository.save(user);
            }

            response.put("success", true);
            response.put("message", "Background removed successfully");
            return ResponseEntity.ok(response);
            
        } catch (IOException e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error removing background: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
     @GetMapping("/count")
    public ResponseEntity<Integer> getUserCount() {
        return ResponseEntity.ok(userService.getUserCount());
    }
    @GetMapping("/monthly-count")
    public ResponseEntity<Map<String, Integer>> getMonthlyUserCount() {
        Map<String, Integer> monthlyCount = new HashMap<>();
        LocalDate today = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            YearMonth month = YearMonth.from(today.minusMonths(i));
            String monthKey = month.getMonth().toString().toLowerCase() + "-" + month.getYear(); 
            monthlyCount.put(monthKey, userService.countUsersByMonth(month));
        }
        return ResponseEntity.ok(monthlyCount);
    }
}
