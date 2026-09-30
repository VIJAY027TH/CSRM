package com.csrm.dto;

import java.time.LocalDateTime;

public class ConflictReportDto {
    private Long id;
    private LocalDateTime timestamp;
    private String attemptedBy;
    private String resourceName;
    private LocalDateTime requestedStartTime;
    private LocalDateTime requestedEndTime;
    private String details;

    public ConflictReportDto() {
    }

    public ConflictReportDto(Long id, LocalDateTime timestamp, String attemptedBy, String resourceName, LocalDateTime requestedStartTime, LocalDateTime requestedEndTime, String details) {
        this.id = id;
        this.timestamp = timestamp;
        this.attemptedBy = attemptedBy;
        this.resourceName = resourceName;
        this.requestedStartTime = requestedStartTime;
        this.requestedEndTime = requestedEndTime;
        this.details = details;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getAttemptedBy() {
        return attemptedBy;
    }

    public void setAttemptedBy(String attemptedBy) {
        this.attemptedBy = attemptedBy;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public LocalDateTime getRequestedStartTime() {
        return requestedStartTime;
    }

    public void setRequestedStartTime(LocalDateTime requestedStartTime) {
        this.requestedStartTime = requestedStartTime;
    }

    public LocalDateTime getRequestedEndTime() {
        return requestedEndTime;
    }

    public void setRequestedEndTime(LocalDateTime requestedEndTime) {
        this.requestedEndTime = requestedEndTime;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
