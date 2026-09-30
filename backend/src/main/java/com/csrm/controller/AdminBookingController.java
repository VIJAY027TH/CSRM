package com.csrm.controller;

import com.csrm.dto.ApiResponse;
import com.csrm.dto.BookingDto;
import com.csrm.dto.UpdateBookingRequest;
import com.csrm.security.UserPrincipal;
import com.csrm.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/bookings")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBookingController {

    private final BookingService bookingService;

    public AdminBookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDto>>> getAllBookings() {
        List<BookingDto> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success("All campus bookings retrieved successfully", bookings));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingByAdmin(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto updated = bookingService.updateBooking(id, request, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success("Booking updated by administrator", updated));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDto>> cancelBookingByAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto cancelled = bookingService.cancelBooking(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled by administrator", cancelled));
    }
}
