package com.csrm.repository;

import com.csrm.entity.Resource;
import com.csrm.entity.ResourceAvailability;
import com.csrm.entity.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {
    List<Resource> findByType(ResourceType type);
    List<Resource> findByAvailability(ResourceAvailability availability);
    List<Resource> findByTypeAndAvailability(ResourceType type, ResourceAvailability availability);
    long countByType(ResourceType type);
    long countByAvailability(ResourceAvailability availability);
}
