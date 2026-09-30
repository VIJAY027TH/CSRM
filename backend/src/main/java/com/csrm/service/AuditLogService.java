package com.csrm.service;

import com.csrm.dto.AuditLogDto;
import com.csrm.entity.AuditLog;
import com.csrm.repository.AuditLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public AuditLog logAction(Long userId, String username, String action, String details) {
        AuditLog log = new AuditLog(userId, username, action, details);
        return auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc()
                .stream()
                .map(AuditLogDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> searchLogs(Long userId, String action, LocalDateTime startDate, LocalDateTime endDate) {
        return auditLogRepository.searchLogs(userId, action, startDate, endDate)
                .stream()
                .map(AuditLogDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditLogDto> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId)
                .stream()
                .map(AuditLogDto::new)
                .collect(Collectors.toList());
    }
}
