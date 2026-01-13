package com.example.fixhub.controller;

import com.example.fixhub.websocket.MessageStreamHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/websocket")
public class WebSocketStatusController {

    @Autowired(required = false)
    private MessageStreamHandler messageStreamHandler;

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getWebSocketStatus() {
        Map<String, Object> status = new HashMap<>();
        if (messageStreamHandler != null) {
            status.put("enabled", true);
            status.put("connected_sessions", messageStreamHandler.getConnectedSessions());
            status.put("endpoint", "/ws/messages");
        } else {
            status.put("enabled", false);
            status.put("connected_sessions", 0);
        }
        return ResponseEntity.ok(status);
    }
}
