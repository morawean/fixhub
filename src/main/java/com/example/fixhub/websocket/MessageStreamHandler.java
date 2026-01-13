package com.example.fixhub.websocket;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.CloseStatus;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class MessageStreamHandler extends TextWebSocketHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(MessageStreamHandler.class);
    private static final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private static final ObjectMapper mapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        logger.info("WebSocket connection established: {}", session.getId());
        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        logger.info("WebSocket connection closed: {}", session.getId());
        sessions.remove(session);
    }

    public void broadcastMessage(FIXMessageEvent event) {
        String json;
        try {
            json = mapper.writeValueAsString(event);
        } catch (Exception e) {
            logger.error("Failed to serialize message event", e);
            return;
        }

        TextMessage message = new TextMessage(json);
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(message);
                }
            } catch (Exception e) {
                logger.warn("Failed to send WebSocket message to session {}", session.getId(), e);
            }
        }
    }

    public int getConnectedSessions() {
        return sessions.size();
    }
}
