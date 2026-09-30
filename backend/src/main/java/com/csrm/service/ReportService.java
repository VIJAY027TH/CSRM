package com.csrm.service;

import com.csrm.dto.*;
import com.csrm.entity.AuditLog;
import com.csrm.entity.Booking;
import com.csrm.entity.BookingStatus;
import com.csrm.entity.Resource;
import com.csrm.entity.ResourceType;
import com.csrm.entity.User;
import com.csrm.entity.UserStatus;
import com.csrm.repository.AuditLogRepository;
import com.csrm.repository.BookingRepository;
import com.csrm.repository.ResourceRepository;
import com.csrm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;

    public ReportService(UserRepository userRepository,
                         ResourceRepository resourceRepository,
                         BookingRepository bookingRepository,
                         AuditLogRepository auditLogRepository) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsDto getDashboardStats() {
        DashboardStatsDto stats = new DashboardStatsDto();

        long totalUsers = userRepository.count();
        long pendingUsers = userRepository.countByStatus(UserStatus.PENDING);
        long totalResources = resourceRepository.count();
        long activeBookings = bookingRepository.countActiveBookings();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        long todayBookings = bookingRepository.countByStartTimeBetween(startOfToday, endOfToday);
        long cancelledBookings = bookingRepository.countByStatus(BookingStatus.CANCELLED);

        List<AuditLog> conflictLogs = auditLogRepository.findByActionOrderByTimestampDesc("BOOKING_CONFLICT_ATTEMPT");
        long bookingConflicts = conflictLogs.size();

        // Resources breakdown
        Map<String, Long> resourcesByType = new HashMap<>();
        for (ResourceType type : ResourceType.values()) {
            resourcesByType.put(type.name(), resourceRepository.countByType(type));
        }

        // Bookings by resource type
        Map<String, Long> bookingsByType = new HashMap<>();
        List<Object[]> bookingTypeCounts = bookingRepository.countBookingsByResourceType();
        for (Object[] row : bookingTypeCounts) {
            if (row[0] != null) {
                bookingsByType.put(row[0].toString(), (Long) row[1]);
            }
        }

        // Approximate overall utilization
        List<Resource> allResources = resourceRepository.findAll();
        double totalUtilization = 0.0;
        if (!allResources.isEmpty()) {
            List<UtilizationReportDto> utilList = getUtilizationReport();
            double sumPercent = utilList.stream().mapToDouble(UtilizationReportDto::getUtilizationPercent).sum();
            totalUtilization = Math.round((sumPercent / allResources.size()) * 10.0) / 10.0;
        }

        stats.setTotalUsers(totalUsers);
        stats.setPendingUsers(pendingUsers);
        stats.setTotalResources(totalResources);
        stats.setActiveBookings(activeBookings);
        stats.setTodayBookings(todayBookings);
        stats.setCancelledBookings(cancelledBookings);
        stats.setBookingConflicts(bookingConflicts);
        stats.setResourceUtilization(totalUtilization);
        stats.setResourcesByType(resourcesByType);
        stats.setBookingsByType(bookingsByType);

        return stats;
    }

    @Transactional(readOnly = true)
    public List<UtilizationReportDto> getUtilizationReport() {
        List<Resource> resources = resourceRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();

        // Consider operational window: 8:00 to 20:00 (12 hours/day * 30 days = 360 hours monthly window)
        final double MONTHLY_HOURS_CAP = 360.0;

        List<UtilizationReportDto> reports = new ArrayList<>();

        for (Resource res : resources) {
            List<Booking> resBookings = allBookings.stream()
                    .filter(b -> b.getResource().getId().equals(res.getId()) && b.getStatus() != BookingStatus.CANCELLED)
                    .collect(Collectors.toList());

            long count = resBookings.size();
            double totalHours = 0.0;

            for (Booking b : resBookings) {
                Duration d = Duration.between(b.getStartTime(), b.getEndTime());
                totalHours += Math.max(0, d.toMinutes() / 60.0);
            }

            double percent = (totalHours / MONTHLY_HOURS_CAP) * 100.0;
            if (percent > 100.0) percent = 100.0;
            double roundedPercent = Math.round(percent * 10.0) / 10.0;
            double roundedHours = Math.round(totalHours * 10.0) / 10.0;

            reports.add(new UtilizationReportDto(
                    res.getId(),
                    res.getName(),
                    res.getType(),
                    res.getLocation(),
                    count,
                    roundedHours,
                    roundedPercent
            ));
        }

        return reports;
    }

    @Transactional(readOnly = true)
    public List<ConflictReportDto> getConflictReport() {
        List<AuditLog> conflictLogs = auditLogRepository.findByActionOrderByTimestampDesc("BOOKING_CONFLICT_ATTEMPT");

        return conflictLogs.stream().map(log -> new ConflictReportDto(
                log.getId(),
                log.getTimestamp(),
                log.getUsername() != null ? log.getUsername() : "User #" + log.getUserId(),
                "Resource Booking Conflict",
                null,
                null,
                log.getDetails()
        )).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<UserActivityReportDto> getUserActivityReport() {
        List<User> users = userRepository.findAll();
        List<Booking> allBookings = bookingRepository.findAll();
        List<AuditLog> allLogs = auditLogRepository.findAll();

        List<UserActivityReportDto> reports = new ArrayList<>();

        for (User user : users) {
            List<Booking> userBookings = allBookings.stream()
                    .filter(b -> b.getUser().getId().equals(user.getId()))
                    .collect(Collectors.toList());

            long totalBookings = userBookings.size();
            long activeBookings = userBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CONFIRMED || b.getStatus() == BookingStatus.PENDING)
                    .count();
            long cancelledBookings = userBookings.stream()
                    .filter(b -> b.getStatus() == BookingStatus.CANCELLED)
                    .count();

            Optional<AuditLog> lastLog = allLogs.stream()
                    .filter(l -> l.getUserId() != null && l.getUserId().equals(user.getId()))
                    .max(Comparator.comparing(AuditLog::getTimestamp));

            LocalDateTime lastActionTime = lastLog.map(AuditLog::getTimestamp).orElse(user.getCreatedAt());

            reports.add(new UserActivityReportDto(
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole(),
                    user.getStatus(),
                    totalBookings,
                    activeBookings,
                    cancelledBookings,
                    lastActionTime
            ));
        }

        return reports;
    }
}
