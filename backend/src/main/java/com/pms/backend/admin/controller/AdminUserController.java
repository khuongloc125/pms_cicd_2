package com.pms.backend.admin.controller;

import com.pms.backend.admin.dto.AdminUserDTO;
import com.pms.backend.admin.Service.AdminUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AdminUserDTO>> getAllUsers() {
        return ResponseEntity.ok(adminUserService.findAllUsers());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDTO> createUser(@RequestBody AdminUserDTO adminUserDTO) {
        return ResponseEntity.ok(adminUserService.createUser(adminUserDTO));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminUserDTO> updateUser(@PathVariable Long id, @RequestBody AdminUserDTO adminUserDTO) {
        return ResponseEntity.ok(adminUserService.updateUser(id, adminUserDTO));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}