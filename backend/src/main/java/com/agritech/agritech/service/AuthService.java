package com.agritech.agritech.service;

import com.agritech.agritech.dto.ApiResponse;
import com.agritech.agritech.dto.LoginRequest;
import com.agritech.agritech.dto.LoginResponse;
import com.agritech.agritech.dto.RegistrationRequest;
import com.agritech.agritech.entity.User;
import com.agritech.agritech.entity.UserRole;
import com.agritech.agritech.repository.UserRepository;
import com.agritech.agritech.util.PasswordHasher;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public ApiResponse register(@Valid RegistrationRequest request) {
        String normalizedEmail = request.getEmail() == null ? null : request.getEmail().trim();
        String normalizedRole = request.getRole() == null ? null : request.getRole().trim();

        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (userRepository.existsByEmail(normalizedEmail.toLowerCase())) {
            return new ApiResponse(false, "Email already registered");
        }

        try {
            UserRole role = UserRole.valueOf(normalizedRole.toUpperCase());
            User user = new User();
            user.setFullName(request.getFullName().trim());
            user.setEmail(normalizedEmail.toLowerCase());
            user.setPhone(request.getPhone().trim());
            user.setLocation(request.getLocation().trim());
            user.setPassword(PasswordHasher.hash(request.getPassword()));
            user.setRole(role);
            User savedUser = userRepository.save(user);
            return new ApiResponse(true, "Registration successful", savedUser.getId());
        } catch (IllegalArgumentException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be FARMER or BUYER");
        }
    }

    @Transactional(readOnly = true)
    public LoginResponse login(@Valid LoginRequest request) {
        String normalizedEmail = request.getEmail() == null ? null : request.getEmail().trim();
        String password = request.getPassword() == null ? null : request.getPassword();

        if (normalizedEmail == null || normalizedEmail.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (password == null || password.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is required");
        }

        User user = userRepository.findByEmail(normalizedEmail.toLowerCase())
                .orElse(null);

        if (user == null || !PasswordHasher.hash(password).equals(user.getPassword())) {
            return new LoginResponse(false, "Invalid email or password", null, null, null);
        }

        return new LoginResponse(true, "Login successful", user.getId(), user.getRole().name(), user.getFullName());
    }
}
