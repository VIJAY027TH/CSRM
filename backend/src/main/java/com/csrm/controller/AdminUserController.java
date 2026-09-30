package com.csrm.controller;

import com.csrm.dto.*;
import com.csrm.security.UserPrincipal;
import com.csrm.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<UserDto> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<UserDto>>> getPendingUsers() {
        List<UserDto> pendingUsers = userService.getPendingUsers();
        return ResponseEntity.ok(ApiResponse.success("Pending users retrieved successfully", pendingUsers));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        UserDto user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", user));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<UserDto>> approveUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = userService.approveUser(id, principal.getId(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User account approved successfully", user));
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<UserDto>> rejectUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = userService.rejectUser(id, principal.getId(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User account rejected successfully", user));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserDto>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = userService.updateUserStatus(id, request.getStatus(), principal.getId(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User status updated successfully", user));
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<ApiResponse<UserDto>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        UserDto user = userService.updateUserRole(id, request.getRole(), principal.getId(), principal.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User role updated successfully", user));
    }
}
