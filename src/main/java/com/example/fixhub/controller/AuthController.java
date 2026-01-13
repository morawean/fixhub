package com.example.fixhub.controller;

import com.example.fixhub.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class AuthResponse {
        public String token;
        public String username;
        public String message;

        public AuthResponse(String token, String username, String message) {
            this.token = token;
            this.username = username;
            this.message = message;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        // Simple authentication: default credentials
        // In production, validate against a database with proper password hashing
        if ("admin".equals(request.username) && "admin".equals(request.password)) {
            String token = jwtTokenProvider.generateToken(request.username);
            return ResponseEntity.ok(new AuthResponse(token, request.username, "Login successful"));
        }
        return ResponseEntity.status(401).body(new AuthResponse(null, null, "Invalid credentials"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateToken() {
        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("message", "Token is valid");
        return ResponseEntity.ok(response);
    }
}
