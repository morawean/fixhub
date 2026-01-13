package com.example.fixhub.service;

import org.springframework.stereotype.Component;
import quickfix.SessionID;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionRegistry {
    private final Set<SessionID> sessions = ConcurrentHashMap.newKeySet();

    public void add(SessionID id) {
        sessions.add(id);
    }

    public void remove(SessionID id) {
        sessions.remove(id);
    }

    public Set<SessionID> getSessions() {
        return Collections.unmodifiableSet(sessions);
    }
}
