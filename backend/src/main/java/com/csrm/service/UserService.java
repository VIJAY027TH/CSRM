package com.csrm.service;

import com.csrm.dto.UserDto;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.entity.UserStatus;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public UserService(UserRepository userRepository,
                       NotificationService notificationService,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserDto> getPendingUsers() {
        return userRepository.findByStatus(UserStatus.PENDING)
                .stream()
                .map(UserDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return new UserDto(user);
    }

    @Transactional
    public UserDto approveUser(Long id, Long adminId, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(UserStatus.APPROVED);
        User updated = userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Your CSRM account registration has been approved by the administrator. You may now log in and book campus resources.",
                "ACCOUNT_APPROVED"
        );

        auditLogService.logAction(
                adminId,
                adminUsername,
                "USER_APPROVED",
                "Approved user account: " + user.getUsername() + " (ID: " + user.getId() + ")"
        );

        return new UserDto(updated);
    }

    @Transactional
    public UserDto rejectUser(Long id, Long adminId, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setStatus(UserStatus.REJECTED);
        User updated = userRepository.save(user);

        notificationService.createNotification(
                user.getId(),
                "Your CSRM account registration request was rejected by the administrator.",
                "ACCOUNT_REJECTED"
        );

        auditLogService.logAction(
                adminId,
                adminUsername,
                "USER_REJECTED",
                "Rejected user account: " + user.getUsername() + " (ID: " + user.getId() + ")"
        );

        return new UserDto(updated);
    }

    @Transactional
    public UserDto updateUserStatus(Long id, UserStatus status, Long adminId, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        UserStatus oldStatus = user.getStatus();
        user.setStatus(status);
        User updated = userRepository.save(user);

        auditLogService.logAction(
                adminId,
                adminUsername,
                "USER_STATUS_UPDATED",
                "Changed user " + user.getUsername() + " status from " + oldStatus + " to " + status
        );

        return new UserDto(updated);
    }

    @Transactional
    public UserDto updateUserRole(Long id, Role role, Long adminId, String adminUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        Role oldRole = user.getRole();
        user.setRole(role);
        User updated = userRepository.save(user);

        auditLogService.logAction(
                adminId,
                adminUsername,
                "USER_ROLE_UPDATED",
                "Changed user " + user.getUsername() + " role from " + oldRole + " to " + role
        );

        return new UserDto(updated);
    }
}
