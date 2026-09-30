package com.csrm.service;

import com.csrm.dto.BookingDto;
import com.csrm.dto.CreateBookingRequest;
import com.csrm.dto.UpdateBookingRequest;
import com.csrm.entity.*;
import com.csrm.exception.BadRequestException;
import com.csrm.exception.BookingConflictException;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.exception.UnauthorizedException;
import com.csrm.repository.BookingRepository;
import com.csrm.repository.ResourceRepository;
import com.csrm.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          UserRepository userRepository,
                          NotificationService notificationService,
                          AuditLogService auditLogService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public BookingDto createBooking(CreateBookingRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Resource resource = resourceRepository.findById(request.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + request.getResourceId()));

        // Role-based booking permission checks
        validateRoleBookingPermission(user.getRole(), resource.getType());

        // Validate time range
        validateTimeRange(request.getStartTime(), request.getEndTime());

        // Validate resource availability status
        if (resource.getAvailability() != ResourceAvailability.AVAILABLE) {
            throw new BadRequestException("Resource '" + resource.getName() + "' is currently " +
                    resource.getAvailability() + " and cannot be booked.");
        }

        // Conflict Detection: existing.startTime < requested.endTime AND existing.endTime > requested.startTime
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING);
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                resource.getId(),
                request.getStartTime(),
                request.getEndTime(),
                activeStatuses,
                null
        );

        if (!conflicts.isEmpty()) {
            auditLogService.logAction(
                    user.getId(),
                    user.getUsername(),
                    "BOOKING_CONFLICT_ATTEMPT",
                    "Conflict detected on resource: " + resource.getName() + " for time " +
                            request.getStartTime() + " to " + request.getEndTime()
            );
            throw new BookingConflictException("Resource is already booked for the selected time.");
        }

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setResource(resource);
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPurpose(request.getPurpose());

        Booking saved = bookingRepository.save(booking);

        // Create Audit Log
        auditLogService.logAction(
                user.getId(),
                user.getUsername(),
                "BOOKING_CREATED",
                "Booked " + resource.getName() + " (" + resource.getType() + ") from " +
                        saved.getStartTime() + " to " + saved.getEndTime()
        );

        // Generate Notification
        notificationService.createNotification(
                user.getId(),
                "Your booking for " + resource.getName() + " on " + saved.getStartTime().toLocalDate() +
                        " (" + saved.getStartTime().toLocalTime() + " - " + saved.getEndTime().toLocalTime() + ") has been confirmed.",
                "BOOKING_CONFIRMATION"
        );

        return new BookingDto(saved);
    }

    @Transactional
    public BookingDto updateBooking(Long bookingId, UpdateBookingRequest request, Long requestingUserId, Role requestingUserRole) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        // Ownership or Admin check
        boolean isAdmin = requestingUserRole == Role.ADMIN;
        if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedException("You are not authorized to modify this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Cancelled bookings cannot be modified.");
        }

        LocalDateTime newStart = request.getStartTime() != null ? request.getStartTime() : booking.getStartTime();
        LocalDateTime newEnd = request.getEndTime() != null ? request.getEndTime() : booking.getEndTime();

        validateTimeRange(newStart, newEnd);

        // Check availability of the resource
        if (booking.getResource().getAvailability() != ResourceAvailability.AVAILABLE) {
            throw new BadRequestException("Resource '" + booking.getResource().getName() + "' is currently " +
                    booking.getResource().getAvailability() + " and cannot be scheduled.");
        }

        // Overlap query excluding current booking
        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING);
        List<Booking> conflicts = bookingRepository.findOverlappingBookings(
                booking.getResource().getId(),
                newStart,
                newEnd,
                activeStatuses,
                booking.getId()
        );

        if (!conflicts.isEmpty()) {
            auditLogService.logAction(
                    requestingUserId,
                    booking.getUser().getUsername(),
                    "BOOKING_CONFLICT_ATTEMPT",
                    "Conflict detected during modification on resource: " + booking.getResource().getName()
            );
            throw new BookingConflictException("Resource is already booked for the selected time.");
        }

        booking.setStartTime(newStart);
        booking.setEndTime(newEnd);
        if (request.getPurpose() != null) {
            booking.setPurpose(request.getPurpose());
        }
        if (isAdmin && request.getStatus() != null) {
            booking.setStatus(request.getStatus());
        }

        Booking updated = bookingRepository.save(booking);

        // Audit Log
        auditLogService.logAction(
                requestingUserId,
                booking.getUser().getUsername(),
                "BOOKING_MODIFIED",
                "Modified booking ID " + updated.getId() + " for " + updated.getResource().getName() +
                        " to " + updated.getStartTime() + " - " + updated.getEndTime()
        );

        // Notification
        notificationService.createNotification(
                booking.getUser().getId(),
                "Your booking for " + booking.getResource().getName() + " has been modified to " +
                        updated.getStartTime().toLocalDate() + " (" + updated.getStartTime().toLocalTime() + " - " + updated.getEndTime().toLocalTime() + ").",
                "BOOKING_MODIFICATION"
        );

        return new BookingDto(updated);
    }

    @Transactional
    public BookingDto cancelBooking(Long bookingId, Long requestingUserId, Role requestingUserRole) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        boolean isAdmin = requestingUserRole == Role.ADMIN;
        if (!isAdmin && !booking.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedException("You are not authorized to cancel this booking.");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking cancelled = bookingRepository.save(booking);

        // Audit Log
        auditLogService.logAction(
                requestingUserId,
                booking.getUser().getUsername(),
                "BOOKING_CANCELLED",
                "Cancelled booking ID " + cancelled.getId() + " for " + cancelled.getResource().getName()
        );

        // Notification
        notificationService.createNotification(
                booking.getUser().getId(),
                "Your booking for " + booking.getResource().getName() + " on " +
                        cancelled.getStartTime().toLocalDate() + " has been cancelled.",
                "BOOKING_CANCELLATION"
        );

        return new BookingDto(cancelled);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(BookingDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BookingDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BookingDto getBookingById(Long id, Long requestingUserId, Role requestingUserRole) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (requestingUserRole != Role.ADMIN && !booking.getUser().getId().equals(requestingUserId)) {
            throw new UnauthorizedException("You are not authorized to view this booking.");
        }

        return new BookingDto(booking);
    }

    private void validateRoleBookingPermission(Role role, ResourceType resourceType) {
        if (role == Role.STUDENT && resourceType == ResourceType.CLASSROOM) {
            throw new BadRequestException("Students are only permitted to book Lockers, Labs, and Equipment. Classrooms are reserved for Faculty.");
        }
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time cannot be null.");
        }
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("Booking end time must be after its start time.");
        }
        if (startTime.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new BadRequestException("Cannot create or modify a booking in the past.");
        }
    }
}
