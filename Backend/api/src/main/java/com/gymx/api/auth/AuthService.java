
package com.gymx.api.auth;

import com.gymx.api.auth.dto.LoginRequest;
import com.gymx.api.auth.dto.RegisterRequest;
import com.gymx.api.user.UserRepository;
import com.gymx.api.user.User;
import com.gymx.api.security.JwtService;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;
import java.util.Map;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> register(RegisterRequest request) {

        String email = normalizeEmail(request.getEmail());


        if (request.getPassword() == null
                || request.getPassword().length() < 8
                || request.getPassword().length() > 72) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Password must be 8-72 characters");
        }

        if (email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Email is required");
        }

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = new User();
        user.setEmail(email);
        user.setUserName(email.contains("@") ? email.substring(0, email.indexOf('@')) : email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(user);

        return createAuthResponse(savedUser);
    }

    public Map<String, Object> login(LoginRequest request) {

        String email = normalizeEmail(request.getEmail());

        User user = userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"));

        if (request.getPassword() == null
                || !passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password");
        }

        return createAuthResponse(user);
    }

    private Map<String, Object> createAuthResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "userName", user.getUserName() != null ? user.getUserName() : (user.getEmail().contains("@") ? user.getEmail().substring(0, user.getEmail().indexOf('@')) : "Athlete"),
                "tokenType", "Bearer",
                "accessToken", jwtService.generateToken(user.getEmail())
        );
    }

    private String normalizeEmail(String email) {
        return email == null
                ? ""
                : email.trim().toLowerCase(Locale.ROOT);
    }
}
