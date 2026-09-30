package com.csrm.controller;

import com.csrm.dto.ApiResponse;
import com.csrm.dto.BookingDto;
import com.csrm.dto.ResourceDto;
import com.csrm.entity.ResourceAvailability;
import com.csrm.entity.ResourceType;
import com.csrm.security.UserPrincipal;
import com.csrm.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceDto>>> getAllResources(
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceAvailability availability,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String search) {
        List<ResourceDto> resources = resourceService.getAllResources(type, availability, location, search);
        return ResponseEntity.ok(ApiResponse.success("Resources retrieved successfully", resources));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceDto>> getResourceById(@PathVariable Long id) {
        ResourceDto resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.success("Resource retrieved successfully", resource));
    }

    @GetMapping("/{id}/slots")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getResourceBookingsForDate(
            @PathVariable Long id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<BookingDto> bookings = resourceService.getResourceBookingsForDate(id, date);
        return ResponseEntity.ok(ApiResponse.success("Resource schedule retrieved successfully", bookings));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto>> createResource(
            @Valid @RequestBody ResourceDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        ResourceDto created = resourceService.createResource(dto, principal.getId(), principal.getUsername());
        return new ResponseEntity<>(ApiResponse.success("Resource created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResourceDto>> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody ResourceDto dto,
            @AuthenticationPrincipal UserPrincipal principal) {
        ResourceDto updated = resourceService.updateResource(id, dto, principal.getId(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resource updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteResource(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        resourceService.deleteResource(id, principal.getId(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Resource deleted successfully"));
    }
}
