package com.example.fixhub.service;

import com.example.fixhub.model.Connection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.annotation.PostConstruct;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class ConnectionService {
    private final Map<String, Connection> store = new ConcurrentHashMap<>();
    private static final Logger logger = LoggerFactory.getLogger(ConnectionService.class);

    @Value("${fixhub.connections-file:conf/connections.json}")
    private String connectionsFile;

    private final ObjectMapper mapper = new ObjectMapper();

    private final FixEngineService fixEngineService;

    public ConnectionService(FixEngineService fixEngineService) {
        this.fixEngineService = fixEngineService;
    }

    public List<Connection> findAll() {
        return new ArrayList<>(store.values());
    }

    public Connection create(Connection c) {
        String id = c.getId();
        if (id == null || id.isEmpty()) id = UUID.randomUUID().toString();
        c.setId(id);
        store.put(id, c);
        saveToFile();
        // attempt to start acceptor for dynamic connection
        try { fixEngineService.startAcceptorForConnection(c); } catch (Exception ignored) {}
        return c;
    }

    public Optional<Connection> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    public Optional<Connection> update(String id, Connection c) {
        if (!store.containsKey(id)) return Optional.empty();
        c.setId(id);
        store.put(id, c);
        saveToFile();
        return Optional.of(c);
    }

    public boolean delete(String id) {
        Connection removed = store.remove(id);
        boolean ok = removed != null;
        if (ok) {
            saveToFile();
            try { fixEngineService.stopAcceptorForConnectionId(id); } catch (Exception ignored) {}
        }
        return ok;
    }

    @PostConstruct
    public void loadFromFile() {
        java.io.File f = resolveFile(connectionsFile);
        if (!f.exists()) return;
        try {
            Connection[] arr = mapper.readValue(f, Connection[].class);
            for (Connection c : arr) {
                if (c.getId() == null || c.getId().isEmpty()) c.setId(UUID.randomUUID().toString());
                store.put(c.getId(), c);
                try { fixEngineService.startAcceptorForConnection(c); } catch (Exception ignored) {}
            }
        } catch (Exception e) {
            // log but don't fail startup
            logger.warn("Failed to load connections file: {}", e.getMessage());
        }
    }

    private synchronized void saveToFile() {
        try {
            java.io.File f = resolveFile(connectionsFile);
            if (f.getParentFile() != null) f.getParentFile().mkdirs();
            mapper.writerWithDefaultPrettyPrinter().writeValue(f, store.values());
            logger.info("Saved {} connections to {}", store.size(), f.getAbsolutePath());
        } catch (Exception e) {
            logger.error("Failed to save connections file: {}", e.getMessage(), e);
        }
    }

    private java.io.File resolveFile(String path) {
        Path p = Paths.get(path);
        if (!p.isAbsolute()) {
            p = Paths.get(System.getProperty("user.dir")).resolve(path).normalize();
        }
        return p.toFile();
    }
}
