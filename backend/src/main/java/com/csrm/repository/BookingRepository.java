package com.csrm.repository;

import com.csrm.entity.Booking;
import com.csrm.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("SELECT b FROM Booking b WHERE b.resource.id = :resourceId " +
           "AND b.status IN (:activeStatuses) " +
           "AND b.startTime < :endTime " +
           "AND b.endTime > :startTime " +
           "AND (:excludeBookingId IS NULL OR b.id != :excludeBookingId)")
    List<Booking> findOverlappingBookings(
            @Param("resourceId") Long resourceId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("activeStatuses") Collection<BookingStatus> activeStatuses,
            @Param("excludeBookingId") Long excludeBookingId
    );

    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Booking> findByUserIdOrderByStartTimeDesc(Long userId);

    List<Booking> findByResourceIdOrderByStartTimeDesc(Long resourceId);

    List<Booking> findByResourceIdAndStatusInOrderByStartTimeAsc(Long resourceId, Collection<BookingStatus> statuses);

    List<Booking> findByResourceIdAndStatusIn(Long resourceId, Collection<BookingStatus> statuses);

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findAllByOrderByStartTimeDesc();

    List<Booking> findByStatus(BookingStatus status);

    long countByStatus(BookingStatus status);

    long countByStartTimeBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status != 'CANCELLED'")
    long countActiveBookings();

    @Query("SELECT b.resource.type, COUNT(b) FROM Booking b GROUP BY b.resource.type")
    List<Object[]> countBookingsByResourceType();

    @Query("SELECT DATE(b.startTime), COUNT(b) FROM Booking b GROUP BY DATE(b.startTime) ORDER BY DATE(b.startTime) DESC")
    List<Object[]> countBookingsByDate();

    @Query("SELECT b.user.username, COUNT(b) FROM Booking b GROUP BY b.user.username ORDER BY COUNT(b) DESC")
    List<Object[]> countBookingsByUser();
}
