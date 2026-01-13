package com.example.fixhub.service;

import com.example.fixhub.config.HubConfig;
import com.example.fixhub.config.RouteConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.yaml.YAMLFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import quickfix.FieldNotFound;
import quickfix.Message;
import quickfix.SessionID;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.util.Collections;
import java.util.List;

@Service
public class RoutingService {
    private static final Logger logger = LoggerFactory.getLogger(RoutingService.class);

    private final OutgoingConnector outgoingConnector;

    @Value("${fixhub.config-path:conf/fixhub.yml}")
    private String configPath;

    private HubConfig config = new HubConfig();

    public RoutingService(OutgoingConnector outgoingConnector) {
        this.outgoingConnector = outgoingConnector;
    }

    @PostConstruct
    public void load() {
        File f = new File(configPath);
        if (!f.exists()) {
            logger.warn("Hub config not found at {}", configPath);
            return;
        }

        ObjectMapper mapper = new ObjectMapper(new YAMLFactory());
        try {
            this.config = mapper.readValue(f, HubConfig.class);
            logger.info("Loaded hub config with {} incoming, {} outgoing, {} routes",
                    config.incoming == null ? 0 : config.incoming.size(),
                    config.outgoing == null ? 0 : config.outgoing.size(),
                    config.routes == null ? 0 : config.routes.size());
        } catch (IOException e) {
            logger.error("Failed to load hub config", e);
        }
    }

    public List<RouteConfig> routes() {
        return config.routes == null ? Collections.emptyList() : config.routes;
    }

    public boolean route(Message message, SessionID incomingSession) {
        if (config.routes == null || config.routes.isEmpty()) return false;

        for (RouteConfig r : config.routes) {
            boolean fromMatches = r.from == null || r.from.isBlank() || r.from.equals(incomingSession.getSenderCompID()) || r.from.equals(incomingSession.getTargetCompID());
            if (!fromMatches) continue;

            if (r.conditionTag != null && r.conditionValue != null) {
                try {
                    String v = message.getString(r.conditionTag);
                    if (!r.conditionValue.equals(v)) continue;
                } catch (FieldNotFound e) {
                    continue;
                }
            }

            logger.info("Routing message from {} to {} via rule {}", incomingSession, r.to, r);
            boolean sent = outgoingConnector.sendTo(r.to, message);
            return sent;
        }

        logger.debug("No routing rule matched for incoming session {}", incomingSession);
        return false;
    }
}
