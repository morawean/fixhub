package com.example.fixhub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import quickfix.Message;
import quickfix.Session;
import quickfix.SessionID;

import java.util.Set;

@Component
public class OutgoingConnector {
    private static final Logger logger = LoggerFactory.getLogger(OutgoingConnector.class);

    private final SessionRegistry sessionRegistry;

    public OutgoingConnector(SessionRegistry sessionRegistry) {
        this.sessionRegistry = sessionRegistry;
    }

    public boolean sendTo(String outgoingName, Message message) {
        Set<SessionID> sessions = sessionRegistry.getSessions();
        for (SessionID sid : sessions) {
            // try match by SenderCompID or TargetCompID
            if (outgoingName.equals(sid.getSenderCompID()) || outgoingName.equals(sid.getTargetCompID())) {
                try {
                    Session.sendToTarget(message, sid);
                    logger.info("Sent message to outgoing session {}", sid);
                    return true;
                } catch (Exception e) {
                    logger.error("Failed to send to {}", sid, e);
                    return false;
                }
            }
        }

        logger.warn("No connected outgoing session matched '{}'; message not sent", outgoingName);
        return false;
    }
}
