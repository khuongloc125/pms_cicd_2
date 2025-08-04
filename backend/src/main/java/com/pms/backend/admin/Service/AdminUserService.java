package com.pms.backend.admin.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.pms.backend.admin.dto.AdminLoginDTO;
import com.pms.backend.admin.dto.AdminUserDTO;
import com.pms.backend.admin.entity.AdminUser;
import com.pms.backend.admin.repostitory.AdminUserRepository;

@Service
public class AdminUserService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<AdminUserDTO> findAllUsers() {
        return adminUserRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public AdminUserDTO createUser(AdminUserDTO adminUserDTO) {
        AdminUser adminUser = new AdminUser();
        adminUser.setUsername(adminUserDTO.getUsername());
        adminUser.setPassword(passwordEncoder.encode(adminUserDTO.getPassword()));
        adminUser.setRole(adminUserDTO.getRole());
        adminUser.setEmail(adminUserDTO.getEmail());
        adminUser = adminUserRepository.save(adminUser);
        return convertToDTO(adminUser);
    }

    public AdminUserDTO updateUser(Long id, AdminUserDTO adminUserDTO) {
        AdminUser adminUser = adminUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        adminUser.setUsername(adminUserDTO.getUsername());
        if (adminUserDTO.getPassword() != null && !adminUserDTO.getPassword().isEmpty()) {
            adminUser.setPassword(passwordEncoder.encode(adminUserDTO.getPassword()));
        }
        adminUser.setRole(adminUserDTO.getRole());
        adminUser.setEmail(adminUserDTO.getEmail());
        adminUser = adminUserRepository.save(adminUser);
        return convertToDTO(adminUser);
    }

    public void deleteUser(Long id) {
        adminUserRepository.deleteById(id);
    }

    public AdminUserDTO login(AdminLoginDTO loginDTO) {
        System.out.println("Login attempt with email: " + loginDTO.getEmail());
        AdminUser adminUser = adminUserRepository.findByEmail(loginDTO.getEmail())
                .orElseThrow(() -> {
                    System.out.println("Email not found: " + loginDTO.getEmail());
                    return new RuntimeException("Invalid email or password");
                });
        System.out.println("Found user: " + adminUser.getEmail() + ", checking password...");
        if (!passwordEncoder.matches(loginDTO.getPassword(), adminUser.getPassword())) {
            System.out.println("Password mismatch for email: " + loginDTO.getEmail());
            throw new RuntimeException("Invalid email or password");
        }
        System.out.println("Login successful for email: " + loginDTO.getEmail());
        return convertToDTO(adminUser);
    }

    private AdminUserDTO convertToDTO(AdminUser adminUser) {
        AdminUserDTO dto = new AdminUserDTO();
        dto.setId(adminUser.getId());
        dto.setUsername(adminUser.getUsername());
        dto.setRole(adminUser.getRole());
        dto.setEmail(adminUser.getEmail());
        return dto;
    }
}
