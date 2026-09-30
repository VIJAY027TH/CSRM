package com.csrm.dto;

import com.csrm.entity.Role;
import com.csrm.entity.UserStatus;

import java.time.LocalDateTime;

public class UserActivityReportDto {
    private Long userId;
    private String username;
    private String email;
    private Role role;
    private UserStatus status;
    private long totalBookings;
    private long activeBookings;
    private long cancelledBookings;
    private LocalDateTime lastActionTime;

    public UserActivityReportDto() {
    }

    public UserActivityReportDto(Long userId, String username, String email, Role role, UserStatus status, long totalBookings, long activeBookings, long cancelledBookings, LocalDateTime lastActionTime) {
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.role = role;
        this.status = status;
        this.totalBookings = totalBookings;
        this.activeBookings = activeBookings;
        this.cancelledBookings = cancelledBookings;
        this.lastActionTime = lastActionTime;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public LocalDateTime getLastActionTime() {
        return lastActionTime;
    }

    public void setLastActionTime(LocalDateTime lastActionTime) {
        this.lastActionTime = lastActionTime;
    }
}
