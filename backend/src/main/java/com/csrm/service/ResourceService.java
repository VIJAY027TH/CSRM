package com.csrm.service;

import com.csrm.dto.BookingDto;
import com.csrm.dto.ResourceDto;
import com.csrm.entity.Booking;
import com.csrm.entity.BookingStatus;
import com.csrm.entity.Resource;
import com.csrm.entity.ResourceAvailability;
import com.csrm.entity.ResourceType;
import com.csrm.exception.ResourceNotFoundException;
import com.csrm.repository.BookingRepository;
import com.csrm.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogService auditLogService;

    public ResourceService(ResourceRepository resourceRepository,
                           BookingRepository bookingRepository,
                           AuditLogService auditLogService) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<ResourceDto> getAllResources(ResourceType type, ResourceAvailability availability, String location, String search) {
        List<Resource> resources = resourceRepository.findAll();

        return resources.stream()
                .filter(r -> type == null || r.getType() == type)
                .filter(r -> availability == null || r.getAvailability() == availability)
                .filter(r -> location == null || location.isBlank() || r.getLocation().toLowerCase().contains(location.toLowerCase()))
                .filter(r -> search == null || search.isBlank() ||
                        r.getName().toLowerCase().contains(search.toLowerCase()) ||
                        (r.getDescription() != null && r.getDescription().toLowerCase().contains(search.toLowerCase())) ||
                        r.getLocation().toLowerCase().contains(search.toLowerCase()))
                .map(ResourceDto::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ResourceDto getResourceById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return new ResourceDto(resource);
    }

    @Transactional
    public ResourceDto createResource(ResourceDto dto, Long adminId, String adminUsername) {
        Resource resource = new Resource();
        resource.setName(dto.getName().trim());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation().trim());
        resource.setAvailability(dto.getAvailability() != null ? dto.getAvailability() : ResourceAvailability.AVAILABLE);
        resource.setDescription(dto.getDescription());
        resource.setCapacity(dto.getCapacity() != null ? dto.getCapacity() : 1);

        Resource saved = resourceRepository.save(resource);

        auditLogService.logAction(
                adminId,
                adminUsername,
                "RESOURCE_CREATED",
                "Created resource: " + saved.getName() + " (" + saved.getType() + ") at " + saved.getLocation()
        );

        return new ResourceDto(saved);
    }

    @Transactional
    public ResourceDto updateResource(Long id, ResourceDto dto, Long adminId, String adminUsername) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        resource.setName(dto.getName().trim());
        resource.setType(dto.getType());
        resource.setLocation(dto.getLocation().trim());
        if (dto.getAvailability() != null) {
            resource.setAvailability(dto.getAvailability());
        }
        resource.setDescription(dto.getDescription());
        if (dto.getCapacity() != null) {
            resource.setCapacity(dto.getCapacity());
        }

        Resource updated = resourceRepository.save(resource);

        auditLogService.logAction(
                adminId,
                adminUsername,
                "RESOURCE_UPDATED",
                "Updated resource: " + updated.getName() + " (ID: " + updated.getId() + ")"
        );

        return new ResourceDto(updated);
    }

    @Transactional
    public void deleteResource(Long id, Long adminId, String adminUsername) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        auditLogService.logAction(
                adminId,
                adminUsername,
                "RESOURCE_DELETED",
                "Deleted resource: " + resource.getName() + " (ID: " + resource.getId() + ")"
        );

        resourceRepository.delete(resource);
    }

    @Transactional(readOnly = true)
    public List<BookingDto> getResourceBookingsForDate(Long resourceId, LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX);

        List<BookingStatus> activeStatuses = Arrays.asList(BookingStatus.CONFIRMED, BookingStatus.PENDING);

        List<Booking> bookings = bookingRepository.findByResourceIdAndStatusInOrderByStartTimeAsc(resourceId, activeStatuses);

        return bookings.stream()
                .filter(b -> !(b.getEndTime().isBefore(startOfDay) || b.getStartTime().isAfter(endOfDay)))
                .map(BookingDto::new)
                .collect(Collectors.toList());
    }
}
