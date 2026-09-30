package com.csrm.controller;

import com.csrm.dto.*;
import com.csrm.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {

    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = reportService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics", stats));
    }

    @GetMapping("/utilization")
    public ResponseEntity<ApiResponse<List<UtilizationReportDto>>> getUtilizationReport() {
        List<UtilizationReportDto> report = reportService.getUtilizationReport();
        return ResponseEntity.ok(ApiResponse.success("Resource utilization report", report));
    }

    @GetMapping("/conflicts")
    public ResponseEntity<ApiResponse<List<ConflictReportDto>>> getConflictReport() {
        List<ConflictReportDto> report = reportService.getConflictReport();
        return ResponseEntity.ok(ApiResponse.success("Booking conflict report", report));
    }

    @GetMapping("/user-activity")
    public ResponseEntity<ApiResponse<List<UserActivityReportDto>>> getUserActivityReport() {
        List<UserActivityReportDto> report = reportService.getUserActivityReport();
        return ResponseEntity.ok(ApiResponse.success("User activity report", report));
    }
}
