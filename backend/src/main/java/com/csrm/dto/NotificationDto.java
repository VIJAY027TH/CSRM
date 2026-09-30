package com.csrm.dto;

import com.csrm.entity.Notification;

import java.time.LocalDateTime;

public class NotificationDto {
    private Long id;
    private Long userId;
    private String message;
    private String type;
    private boolean readStatus;
    private LocalDateTime createdAt;

    public NotificationDto() {
    }

    public NotificationDto(Notification notification) {
        this.id = notification.getId();
        this.userId = notification.getUserId();
        this.message = notification.getMessage();
        this.type = notification.getType();
        this.readStatus = notification.isReadStatus();
        this.createdAt = notification.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public boolean isReadStatus() {
        return readStatus;
    }

    public void setReadStatus(boolean readStatus) {
        this.readStatus = readStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
