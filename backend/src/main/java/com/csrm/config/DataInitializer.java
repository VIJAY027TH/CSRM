package com.csrm.config;

import com.csrm.entity.*;
import com.csrm.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           ResourceRepository resourceRepository,
                           BookingRepository bookingRepository,
                           AuditLogRepository auditLogRepository,
                           NotificationRepository notificationRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogRepository = auditLogRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seedUsers();
        seedResources();
        seedBookingsAndLogs();
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            logger.info("Seeding initial users...");

            String defaultPassword = passwordEncoder.encode("Password@123");

            User admin = new User("admin", defaultPassword, "admin@csrm.com", Role.ADMIN, UserStatus.ACTIVE);
            User faculty = new User("faculty", defaultPassword, "faculty@csrm.com", Role.FACULTY, UserStatus.ACTIVE);
            User student = new User("student", defaultPassword, "student@csrm.com", Role.STUDENT, UserStatus.ACTIVE);
            User pendingStudent = new User("rahul_kumar", defaultPassword, "rahul@csrm.com", Role.STUDENT, UserStatus.PENDING);
            User pendingFaculty = new User("dr_sharma", defaultPassword, "sharma@csrm.com", Role.FACULTY, UserStatus.PENDING);

            userRepository.saveAll(List.of(admin, faculty, student, pendingStudent, pendingFaculty));
            logger.info("Users seeded: admin, faculty, student, rahul_kumar (PENDING), dr_sharma (PENDING)");
        }
    }

    private void seedResources() {
        if (resourceRepository.count() == 0) {
            logger.info("Seeding initial resources...");

            List<Resource> resources = List.of(
                    new Resource("Auditorium Hall A", ResourceType.CLASSROOM, "Main Campus, Building 1, Floor 1",
                            ResourceAvailability.AVAILABLE, "Main campus auditorium with 4K laser projector, surround sound, and stage.", 200),
                    new Resource("Lecture Hall 101", ResourceType.CLASSROOM, "Science Block, Floor 1",
                            ResourceAvailability.AVAILABLE, "Tiered lecture hall equipped with smart podium and dual interactive displays.", 60),
                    new Resource("Seminar Room 302", ResourceType.CLASSROOM, "Management Block, Floor 3",
                            ResourceAvailability.AVAILABLE, "Conference setup with high-definition video conferencing and wireless presentation.", 35),

                    new Resource("Advanced AI & Robotics Lab", ResourceType.LAB, "Tech Center, Room 204",
                            ResourceAvailability.AVAILABLE, "30 GPU workstations, NVIDIA CUDA setup, ROS robotics developer kits.", 30),
                    new Resource("Cyber Security & Networks Lab", ResourceType.LAB, "IT Block, Room 105",
                            ResourceAvailability.AVAILABLE, "Isolated network sandbox environment for vulnerability assessment and forensics.", 40),
                    new Resource("IoT & Prototyping Lab", ResourceType.LAB, "Tech Center, Room 208",
                            ResourceAvailability.MAINTENANCE, "Oscilloscopes, spectrum analyzers, and soldering stations (Scheduled calibration).", 25),

                    new Resource("Smart Locker Bay A-01", ResourceType.LOCKER, "Central Library, Ground Floor",
                            ResourceAvailability.AVAILABLE, "Digital RFID keycard locker with internal fast device charging port.", 1),
                    new Resource("Smart Locker Bay A-02", ResourceType.LOCKER, "Central Library, Ground Floor",
                            ResourceAvailability.AVAILABLE, "Digital RFID keycard locker for daily student use.", 1),
                    new Resource("Athletics Locker Bay B-05", ResourceType.LOCKER, "Sports Complex, Ground Floor",
                            ResourceAvailability.AVAILABLE, "Spacious ventilated locker for sports equipment and gear.", 1),

                    new Resource("Sony FX6 Cinema 4K Camera Kit", ResourceType.EQUIPMENT, "Media Studio, Booth 2",
                            ResourceAvailability.AVAILABLE, "Broadcast quality camera with 24-70mm GM lens, wireless lav mics, and carbon tripod.", 1),
                    new Resource("Ultimaker S5 Industrial 3D Printer", ResourceType.EQUIPMENT, "MakerSpace, Zone C",
                            ResourceAvailability.AVAILABLE, "Dual-extrusion composite-ready 3D printer with PLA and ABS filament kits.", 1),
                    new Resource("Dell Precision Mobile Workstation #4", ResourceType.EQUIPMENT, "IT Helpdesk, Desk 1",
                            ResourceAvailability.UNAVAILABLE, "Core i9, 64GB RAM, RTX 4000 GPU (Temporarily checked out for maintenance).", 1)
            );

            resourceRepository.saveAll(resources);
            logger.info("12 initial resources seeded across CLASSROOM, LAB, LOCKER, EQUIPMENT");
        }
    }

    private void seedBookingsAndLogs() {
        if (bookingRepository.count() == 0) {
            logger.info("Seeding initial bookings and audit logs...");

            User faculty = userRepository.findByUsername("faculty").orElse(null);
            User student = userRepository.findByUsername("student").orElse(null);
            User admin = userRepository.findByUsername("admin").orElse(null);

            List<Resource> resources = resourceRepository.findAll();
            if (faculty != null && student != null && admin != null && !resources.isEmpty()) {
                Resource hall101 = resources.stream().filter(r -> r.getName().contains("101")).findFirst().orElse(resources.get(0));
                Resource aiLab = resources.stream().filter(r -> r.getName().contains("AI")).findFirst().orElse(resources.get(1));
                Resource locker1 = resources.stream().filter(r -> r.getName().contains("Locker Bay A-01")).findFirst().orElse(resources.get(2));
                Resource camera = resources.stream().filter(r -> r.getName().contains("Camera")).findFirst().orElse(resources.get(3));

                LocalDateTime tomorrow = LocalDateTime.now().plusDays(1).withHour(10).withMinute(0).withSecond(0).withNano(0);

                Booking b1 = new Booking(faculty, hall101, tomorrow, tomorrow.plusHours(2), BookingStatus.CONFIRMED, "CS301 Advanced Algorithms Lecture");
                Booking b2 = new Booking(student, aiLab, tomorrow.plusHours(4), tomorrow.plusHours(6), BookingStatus.CONFIRMED, "Senior Capstone Deep Learning Training");
                Booking b3 = new Booking(student, locker1, tomorrow.minusHours(1), tomorrow.plusHours(8), BookingStatus.CONFIRMED, "Personal study material storage during exams");
                Booking b4 = new Booking(faculty, camera, tomorrow.plusDays(1).withHour(14).withMinute(0), tomorrow.plusDays(1).withHour(17).withMinute(0), BookingStatus.CONFIRMED, "Campus Documentary Project Filming");

                bookingRepository.saveAll(List.of(b1, b2, b3, b4));

                // Audit Logs
                auditLogRepository.save(new AuditLog(faculty.getId(), faculty.getUsername(), "BOOKING_CREATED",
                        "Booked " + hall101.getName() + " for " + b1.getStartTime() + " to " + b1.getEndTime()));
                auditLogRepository.save(new AuditLog(student.getId(), student.getUsername(), "BOOKING_CREATED",
                        "Booked " + aiLab.getName() + " for " + b2.getStartTime() + " to " + b2.getEndTime()));
                auditLogRepository.save(new AuditLog(student.getId(), student.getUsername(), "BOOKING_CREATED",
                        "Booked " + locker1.getName() + " for " + b3.getStartTime() + " to " + b3.getEndTime()));
                auditLogRepository.save(new AuditLog(admin.getId(), admin.getUsername(), "RESOURCE_CREATED",
                        "Initialized campus resource catalog with 12 items."));

                // Notifications
                notificationRepository.save(new Notification(faculty.getId(),
                        "Your booking for " + hall101.getName() + " on " + b1.getStartTime().toLocalDate() + " has been confirmed.",
                        "BOOKING_CONFIRMATION"));
                notificationRepository.save(new Notification(student.getId(),
                        "Your booking for " + aiLab.getName() + " on " + b2.getStartTime().toLocalDate() + " has been confirmed.",
                        "BOOKING_CONFIRMATION"));
                notificationRepository.save(new Notification(student.getId(),
                        "Welcome to CSRM! Your account is approved and ready for booking campus resources.",
                        "ACCOUNT_APPROVED"));

                logger.info("Initial bookings, audit logs, and notifications seeded successfully.");
            }
        }
    }
}
