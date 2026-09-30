package com.csrm.dto;

import java.util.Map;

public class DashboardStatsDto {
    private long totalUsers;
    private long pendingUsers;
    private long totalResources;
    private long activeBookings;
    private long todayBookings;
    private long cancelledBookings;
    private long bookingConflicts;
    private double resourceUtilization;
    private Map<String, Long> resourcesByType;
    private Map<String, Long> bookingsByType;

    public DashboardStatsDto() {
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getPendingUsers() {
        return pendingUsers;
    }

    public void setPendingUsers(long pendingUsers) {
        this.pendingUsers = pendingUsers;
    }

    public long getTotalResources() {
        return totalResources;
    }

    public void setTotalResources(long totalResources) {
        this.totalResources = totalResources;
    }

    public long getActiveBookings() {
        return activeBookings;
    }

    public void setActiveBookings(long activeBookings) {
        this.activeBookings = activeBookings;
    }

    public long getTodayBookings() {
        return todayBookings;
    }

    public void setTodayBookings(long todayBookings) {
        this.todayBookings = todayBookings;
    }

    public long getCancelledBookings() {
        return cancelledBookings;
    }

    public void setCancelledBookings(long cancelledBookings) {
        this.cancelledBookings = cancelledBookings;
    }

    public long getBookingConflicts() {
        return bookingConflicts;
    }

    public void setBookingConflicts(long bookingConflicts) {
        this.bookingConflicts = bookingConflicts;
    }

    public double getResourceUtilization() {
        return resourceUtilization;
    }

    public void setResourceUtilization(double resourceUtilization) {
        this.resourceUtilization = resourceUtilization;
    }

    public Map<String, Long> getResourcesByType() {
        return resourcesByType;
    }

    public void setResourcesByType(Map<String, Long> resourcesByType) {
        this.resourcesByType = resourcesByType;
    }

    public Map<String, Long> getBookingsByType() {
        return bookingsByType;
    }

    public void setBookingsByType(Map<String, Long> bookingsByType) {
        this.bookingsByType = bookingsByType;
    }
}
