package com.example.fixhub.controller;

import com.example.fixhub.service.FixEngineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import quickfix.SessionID;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    @Autowired
    private FixEngineService fixEngineService;

    @GetMapping
    public ResponseEntity<List<SessionID>> list() {
        List<SessionID> sessions = fixEngineService.listSessions();
        return ResponseEntity.ok(sessions);
    }

    @PostMapping("/{sessionId}/disconnect")
    public ResponseEntity<Map<String, String>> disconnect(@PathVariable String sessionId) {
        Map<String, String> response = new HashMap<>();
        try {
            // For now, we can log the disconnect request
            // In future, implement actual session disconnection logic
            response.put("status", "disconnect_initiated");
            response.put("message", "Session disconnect initiated for: " + sessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("status", "error");
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
