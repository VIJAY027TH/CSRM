package com.csrm.dto;

import com.csrm.entity.Resource;
import com.csrm.entity.ResourceAvailability;
import com.csrm.entity.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class ResourceDto {
    private Long id;

    @NotBlank(message = "Resource name is required")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotBlank(message = "Location is required")
    private String location;

    @NotNull(message = "Availability status is required")
    private ResourceAvailability availability = ResourceAvailability.AVAILABLE;

    private String description;

    private Integer capacity = 1;

    private LocalDateTime createdAt;

    public ResourceDto() {
    }

    public ResourceDto(Resource resource) {
        this.id = resource.getId();
        this.name = resource.getName();
        this.type = resource.getType();
        this.location = resource.getLocation();
        this.availability = resource.getAvailability();
        this.description = resource.getDescription();
        this.capacity = resource.getCapacity();
        this.createdAt = resource.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ResourceType getType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public ResourceAvailability getAvailability() {
        return availability;
    }

    public void setAvailability(ResourceAvailability availability) {
        this.availability = availability;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
