package com.csrm.service;

import com.csrm.dto.AuthResponse;
import com.csrm.dto.LoginRequest;
import com.csrm.dto.RegisterRequest;
import com.csrm.dto.UserDto;
import com.csrm.entity.Role;
import com.csrm.entity.User;
import com.csrm.entity.UserStatus;
import com.csrm.exception.BadRequestException;
import com.csrm.exception.UnauthorizedException;
import com.csrm.repository.UserRepository;
import com.csrm.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final AuditLogService auditLogService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public UserDto register(RegisterRequest request) {
        if (request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot be self-registered.");
        }

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username is already taken.");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered.");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setStatus(UserStatus.PENDING);

        User savedUser = userRepository.save(user);

        auditLogService.logAction(
                savedUser.getId(),
                savedUser.getUsername(),
                "USER_REGISTERED",
                "User registered with role " + savedUser.getRole() + " and status PENDING"
        );

        return new UserDto(savedUser);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsernameOrEmail(request.getUsernameOrEmail(), request.getUsernameOrEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid username/email or password."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("Invalid username/email or password.");
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new UnauthorizedException("Your account is pending approval by an administrator. You cannot log in yet.");
        }

        if (user.getStatus() == UserStatus.REJECTED) {
            throw new UnauthorizedException("Your account registration was rejected by an administrator.");
        }

        if (user.getStatus() == UserStatus.INACTIVE) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact an administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(user.getUsername(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);

        auditLogService.logAction(
                user.getId(),
                user.getUsername(),
                "USER_LOGIN",
                "User successfully logged in"
        );

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}
