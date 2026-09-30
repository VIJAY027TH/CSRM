package com.csrm.controller;

import com.csrm.dto.*;
import com.csrm.security.UserPrincipal;
import com.csrm.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingDto>>> getMyBookings(@AuthenticationPrincipal UserPrincipal principal) {
        List<BookingDto> bookings = bookingService.getUserBookings(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("My bookings retrieved successfully", bookings));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto booking = bookingService.getBookingById(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success("Booking retrieved successfully", booking));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            @Valid @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto created = bookingService.createBooking(request, principal.getId());
        return new ResponseEntity<>(ApiResponse.success("Booking created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBookingRequest request,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto updated = bookingService.updateBooking(id, request, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success("Booking modified successfully", updated));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingDto>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        BookingDto cancelled = bookingService.cancelBooking(id, principal.getId(), principal.getRole());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", cancelled));
    }
}
