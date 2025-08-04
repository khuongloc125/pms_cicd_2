package com.pms.backend.admin.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.pms.backend.admin.dto.SystemLogDTO;
import com.pms.backend.admin.Service.SystemLogService;

@RestController
@RequestMapping("/api/admin/logs")
public class SystemLogController {

    @Autowired
    private SystemLogService systemLogService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SystemLogDTO>> getAllLogs() {
        return ResponseEntity.ok(systemLogService.findAllLogs());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SystemLogDTO> createLog(@RequestBody SystemLogDTO systemLogDTO) {
        return ResponseEntity.ok(systemLogService.createLog(systemLogDTO));
    }
}