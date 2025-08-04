package com.pms.backend.admin.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.pms.backend.admin.dto.SystemLogDTO;
import com.pms.backend.admin.entity.SystemLog;
import com.pms.backend.admin.repostitory.SystemLogRepository;

@Service
public class SystemLogService {

    @Autowired
    private SystemLogRepository systemLogRepository;

    public List<SystemLogDTO> findAllLogs() {
        return systemLogRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public SystemLogDTO createLog(SystemLogDTO systemLogDTO) {
        SystemLog systemLog = new SystemLog();
        systemLog.setTimestamp(systemLogDTO.getTimestamp());
        systemLog.setLevel(systemLogDTO.getLevel());
        systemLog.setMessage(systemLogDTO.getMessage());
        systemLog = systemLogRepository.save(systemLog);
        return convertToDTO(systemLog);
    }

    private SystemLogDTO convertToDTO(SystemLog systemLog) {
        SystemLogDTO dto = new SystemLogDTO();
        dto.setId(systemLog.getId());
        dto.setTimestamp(systemLog.getTimestamp());
        dto.setLevel(systemLog.getLevel());
        dto.setMessage(systemLog.getMessage());
        return dto;
    }
}