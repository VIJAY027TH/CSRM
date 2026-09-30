# Campus Smart Resource Management System (CSRM)

A full-stack, enterprise-grade academic facility and resource scheduling platform designed for universities and higher-education campuses. CSRM delivers **conflict-free resource bookings**, **role-based access control (RBAC)**, **audit trails**, and **real-time event notifications**.

---

## 1. Technology Stack

### Backend
- **Language**: Java 21 / 25
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6 with stateless JWT Bearer token authentication & BCrypt password hashing (10 salt rounds)
- **Data Persistence**: Spring Data JPA / Hibernate 6
- **Database**: MySQL 8.0+
- **Build Tool**: Apache Maven 3.9+
- **Architecture**: Strict Layered Architecture (`Controller` → `Service` → `Repository` → `Entity`)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Centralized Axios with request/response interceptors
- **Icons**: Lucide React
- **Design**: Responsive modern academic dashboard UI with custom CSS variables, cards, status badges, modals, and slot grids

### Database
- **DBMS**: MySQL 8.0+
- **Database Name**: `csrm_db`
- **Schema Script**: `database/create_database.sql`

---

## 2. User Roles & Access Control

| Role | Permissions & Capabilities |
| :--- | :--- |
| **ADMIN** | System oversight, user account approval/rejection, role assignment, status toggling, complete resource catalog CRUD, view & override all bookings, system-wide utilization & conflict reports, complete audit logs inspection. *(Cannot be self-registered)* |
| **FACULTY** | View available resources, book Classrooms, Labs, and Equipment, view schedule calendar, modify & cancel own bookings, view personal notifications. |
| **STUDENT** | View available resources, book Lockers, Labs, and Equipment, request services, modify & cancel own bookings, view personal notifications. *(Restricted from reserving Classrooms directly)* |

> **Important**: All authorization rules are strictly enforced by Spring Security on the backend API layer (`@PreAuthorize` and `SecurityFilterChain`), ensuring security is maintained even if the frontend is bypassed.

---

## 3. Demo Credentials

All seeded accounts are initialized with the password: **`Password@123`**

| Role | Username | Email | Initial Status |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin` | `admin@csrm.com` | `ACTIVE` |
| **FACULTY** | `faculty` | `faculty@csrm.com` | `ACTIVE` |
| **STUDENT** | `student` | `student@csrm.com` | `ACTIVE` |
| **PENDING STUDENT** | `rahul_kumar` | `rahul@csrm.com` | `PENDING` (Tests approval block) |
| **PENDING FACULTY** | `dr_sharma` | `sharma@csrm.com` | `PENDING` (Tests approval block) |

---

## 4. Conflict-Free Booking Logic

To eliminate double bookings, CSRM implements mathematical interval overlap detection at the database query level:

$$\text{Existing Booking Conflicts If: } (\text{existing.start\_time} < \text{requested.end\_time}) \land (\text{existing.end\_time} > \text{requested.start\_time})$$

### Spring Data JPA Query
```java
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
```

- **Conflict Response**: If any overlapping active booking is found, the backend rejects the request immediately with **HTTP 409 Conflict**:
  ```json
  {
    "timestamp": "2026-09-30T14:16:44.201",
    "status": 409,
    "error": "Conflict",
    "message": "Resource is already booked for the selected time.",
    "path": "/api/bookings"
  }
  ```
- **Cancelled Bookings**: Marked as `CANCELLED` and automatically excluded from active conflict checks, releasing the time slot instantly for other campus members.
- **Modification Isolation**: When modifying an existing booking, `:excludeBookingId` ensures the reservation being updated does not conflict with itself.

---

## 5. Project Directory Structure

```
CSRM/
├── backend/
│   ├── src/main/java/com/csrm/
│   │   ├── config/
│   │   │   └── DataInitializer.java        # Initial DB seed runner
│   │   ├── controller/
│   │   │   ├── AuthController.java          # Login, Register, Profile
│   │   │   ├── AdminUserController.java     # User approvals & access control
│   │   │   ├── ResourceController.java      # Resource catalog & schedule slots
│   │   │   ├── BookingController.java       # User booking lifecycle
│   │   │   ├── AdminBookingController.java  # Admin override & cancel
│   │   │   ├── NotificationController.java  # User in-app notifications
│   │   │   ├── AdminAuditController.java    # Audit trail searches
│   │   │   └── AdminReportController.java   # Utilization & conflict reports
│   │   ├── dto/                             # Strongly typed request/response DTOs
│   │   ├── entity/                          # JPA Entities (User, Resource, Booking, AuditLog, Notification)
│   │   ├── exception/                       # Global @RestControllerAdvice & custom exceptions
│   │   ├── repository/                      # Spring Data JPA Repositories
│   │   ├── security/                        # JWT Filter, Token Provider, UserPrincipal, SecurityConfig
│   │   ├── service/                         # Layered Business Logic
│   │   └── CsrmApplication.java             # Spring Boot Main Application
│   ├── src/main/resources/
│   │   └── application.properties           # MySQL connection & JWT configurations
│   └── pom.xml                              # Maven build specifications
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx                   # Sticky header with notifications & user pill
│   │   │   ├── Sidebar.jsx                  # Role-based navigational menu
│   │   │   ├── Footer.jsx                   # Academic platform footer
│   │   │   ├── NotificationDropdown.jsx     # Live popover counter & mark read actions
│   │   │   ├── StatusBadge.jsx              # Semantic colored badges
│   │   │   ├── Modal.jsx                    # Reusable dialog modal with Escape & backdrop listeners
│   │   │   ├── ProtectedRoute.jsx           # Client-side route guards
│   │   │   └── LoadingSpinner.jsx           # Clean CSS animation spinners
│   │   ├── context/
│   │   │   └── AuthContext.jsx              # React context managing auth state & roles
│   │   ├── pages/
│   │   │   ├── auth/                        # Login.jsx, Register.jsx
│   │   │   ├── user/                        # Dashboard, Resources, BookingCalendar, MyBookings, Notifications, Profile
│   │   │   └── admin/                       # AdminDashboard, UserManagement, ResourceManagement, BookingManagement, Reports, AuditLogs
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx                # React Router v6 configuration
│   │   ├── services/
│   │   │   ├── api.js                       # Centralized Axios with token attachment & 401/403/409 handling
│   │   │   ├── authService.js
│   │   │   ├── resourceService.js
│   │   │   ├── bookingService.js
│   │   │   ├── notificationService.js
│   │   │   └── adminService.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                        # Modern CSS design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/
│   └── create_database.sql                  # Complete DDL & seed data script
│
└── README.md
```

---

## 6. Setup & Execution Instructions

### Prerequisites
- Java JDK 21+
- Apache Maven 3.9+
- Node.js 18+ and npm
- MySQL Server 8.0+ running on port 3306

### Step 1: Database Setup
1. Open MySQL terminal or MySQL Workbench:
   ```sql
   CREATE DATABASE csrm_db;
   ```
2. Execute `database/create_database.sql` to generate schema and default seed data.
3. Configure your credentials in `backend/src/main/resources/application.properties` if different from default (`root` / `VIJAY2026#DB`).

### Step 2: Run the Spring Boot Backend
```powershell
cd backend
mvn clean package -DskipTests
java -jar target/csrm-backend-1.0.0.jar
```
The backend starts at: `http://localhost:8080`

### Step 3: Run the React Frontend
```powershell
cd frontend
npm install
npm run dev
```
The frontend starts at: `http://localhost:5173`

---

## 7. Key REST APIs

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register student or faculty (status: `PENDING`)
- `POST /api/auth/login` - Authenticate and receive signed JWT
- `GET /api/auth/me` - Retrieve current user profile

### User Management (`/api/admin/users`)
- `GET /api/admin/users` - Retrieve all users
- `GET /api/admin/users/pending` - Retrieve pending approval requests
- `PUT /api/admin/users/{id}/approve` - Approve user registration
- `PUT /api/admin/users/{id}/reject` - Reject user registration
- `PUT /api/admin/users/{id}/status` - Modify status (`ACTIVE`, `INACTIVE`)
- `PUT /api/admin/users/{id}/role` - Modify role (`STUDENT`, `FACULTY`, `ADMIN`)

### Resources (`/api/resources`)
- `GET /api/resources` - Query resources with filters (`type`, `availability`, `search`)
- `GET /api/resources/{id}` - Resource detail
- `GET /api/resources/{id}/slots?date=YYYY-MM-DD` - Occupied slots for date
- `POST /api/resources` - Create facility *(Admin)*
- `PUT /api/resources/{id}` - Update facility *(Admin)*
- `DELETE /api/resources/{id}` - Delete facility *(Admin)*

### Bookings (`/api/bookings` & `/api/admin/bookings`)
- `GET /api/bookings` - Current user's bookings
- `POST /api/bookings` - Create reservation *(Backend conflict check)*
- `PUT /api/bookings/{id}` - Modify own reservation
- `PUT /api/bookings/{id}/cancel` - Cancel reservation *(Frees time slot)*
- `GET /api/admin/bookings` - All campus bookings *(Admin)*
- `PUT /api/admin/bookings/{id}` - Modify any booking *(Admin)*
- `PUT /api/admin/bookings/{id}/cancel` - Cancel any booking *(Admin)*

### Notifications (`/api/notifications`)
- `GET /api/notifications` - User notification inbox
- `GET /api/notifications/unread-count` - Unread counter
- `PUT /api/notifications/{id}/read` - Mark single notification as read
- `PUT /api/notifications/read-all` - Mark all as read

### Reports & Audit (`/api/admin`)
- `GET /api/admin/reports/dashboard` - Top metrics & distribution charts
- `GET /api/admin/reports/utilization` - Facility utilization rates & hours
- `GET /api/admin/reports/conflicts` - Logged conflict attempts
- `GET /api/admin/reports/user-activity` - User reservation volume
- `GET /api/admin/audit` - Searchable audit records with user & date filters

---

## 8. Verification & Viva Presentation Checklist

| Test Item | Verification Scenario | Outcome |
| :---: | :--- | :---: |
| **TEST 1** | Register new Student account | Created with status `PENDING` |
| **TEST 2** | Pending account attempts login | Blocked with HTTP 403 Forbidden |
| **TEST 3** | Admin approves account | Account transitions to `APPROVED`, login succeeds |
| **TEST 4** | Admin rejects account | Account transitions to `REJECTED`, login blocked |
| **TEST 5** | Create reservation on available facility | HTTP 200/201 Created & Notification recorded |
| **TEST 6** | Attempt overlapping booking | HTTP 409 Conflict with clear explanation |
| **TEST 7** | Modify reservation to vacant slot | Succeeded & schedule updated |
| **TEST 8** | Modify reservation into overlapping slot | HTTP 409 Conflict blocked |
| **TEST 9** | Cancel existing reservation | Status changed to `CANCELLED` |
| **TEST 10** | Previously cancelled slot re-booked | Re-booking succeeds immediately |
| **TEST 11** | Audit log tracking | Immutable record created for every sensitive action |
| **TEST 12** | Event Notifications | Notifications generated for booking and account events |
| **TEST 13** | Admin access to user directory | Admin manages roles and approvals |
| **TEST 14** | Admin access to resource CRUD | Add, edit, calibrate availability |
| **TEST 15** | Role-based API protection | Students/Faculty calling Admin APIs receive HTTP 403 |
| **TEST 16** | Password Security | Only BCrypt hashes stored; raw passwords never returned |
| **TEST 17** | Production Frontend Build | `npm run build` generates optimized bundle with 0 errors |
| **TEST 18** | Production Backend Build | `mvn clean package` packages JAR with 0 errors |
