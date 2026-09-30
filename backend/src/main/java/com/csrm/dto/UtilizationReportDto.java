package com.csrm.dto;

import com.csrm.entity.ResourceType;

public class UtilizationReportDto {
    private Long resourceId;
    private String resourceName;
    private ResourceType resourceType;
    private String location;
    private long totalBookings;
    private double totalHoursBooked;
    private double utilizationPercent;

    public UtilizationReportDto() {
    }

    public UtilizationReportDto(Long resourceId, String resourceName, ResourceType resourceType, String location, long totalBookings, double totalHoursBooked, double utilizationPercent) {
        this.resourceId = resourceId;
        this.resourceName = resourceName;
        this.resourceType = resourceType;
        this.location = location;
        this.totalBookings = totalBookings;
        this.totalHoursBooked = totalHoursBooked;
        this.utilizationPercent = utilizationPercent;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public void setResourceId(Long resourceId) {
        this.resourceId = resourceId;
    }

    public String getResourceName() {
        return resourceName;
    }

    public void setResourceName(String resourceName) {
        this.resourceName = resourceName;
    }

    public ResourceType getResourceType() {
        return resourceType;
    }

    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public long getTotalBookings() {
        return totalBookings;
    }

    public void setTotalBookings(long totalBookings) {
        this.totalBookings = totalBookings;
    }

    public double getTotalHoursBooked() {
        return totalHoursBooked;
    }

    public void setTotalHoursBooked(double totalHoursBooked) {
        this.totalHoursBooked = totalHoursBooked;
    }

    public double getUtilizationPercent() {
        return utilizationPercent;
    }

    public void setUtilizationPercent(double utilizationPercent) {
        this.utilizationPercent = utilizationPercent;
    }
}
