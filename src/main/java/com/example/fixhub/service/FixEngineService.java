package com.example.fixhub.service;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import quickfix.*;
import com.example.fixhub.websocket.MessageStreamHandler;
import com.example.fixhub.websocket.FIXMessageEvent;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class FixEngineService {

    private static final Logger logger = LoggerFactory.getLogger(FixEngineService.class);

    private final Map<String, SocketAcceptor> acceptors = new HashMap<>();

    @Value("${fixhub.config-path:conf/fixhub.yml}")
    private String configPath;

    private final Object lock = new Object();

    private final RoutingService routingService;
    private final SessionRegistry sessionRegistry;
    
    @Autowired(required = false)
    private MessageStreamHandler messageStreamHandler;

    @PostConstruct
    public void init() {
        start();
    }

    public FixEngineService(RoutingService routingService, SessionRegistry sessionRegistry) {
        this.routingService = routingService;
        this.sessionRegistry = sessionRegistry;
    }

    public void start() {
        synchronized (lock) {
            if (!acceptors.isEmpty()) {
                logger.info("QuickFIX/J acceptors already running");
                return;
            }

            File hubFile = new File(configPath);
            if (!hubFile.exists()) {
                logger.warn("Hub config not found at {}; skipping acceptor start", configPath);
                return;
            }

            com.example.fixhub.config.HubConfig hubCfg = new com.example.fixhub.config.HubConfig();
            try (InputStream in = new FileInputStream(hubFile)) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper(new com.fasterxml.jackson.dataformat.yaml.YAMLFactory());
                hubCfg = mapper.readValue(in, com.example.fixhub.config.HubConfig.class);
            } catch (IOException e) {
                logger.error("Failed to load hub config from {}", configPath, e);
                return;
            }

            if (hubCfg.incoming == null || hubCfg.incoming.isEmpty()) {
                logger.warn("No incoming definitions in hub config; skipping acceptor start");
                return;
            }

            for (com.example.fixhub.config.IncomingConfig ic : hubCfg.incoming) {
                String settingsPath = ic.settingsFile == null || ic.settingsFile.isBlank() ? "conf/quickfixj.cfg" : ic.settingsFile;
                File settingsFile = new File(settingsPath);
                if (!settingsFile.exists()) {
                    logger.warn("Settings file {} for incoming '{}' not found; skipping", settingsPath, ic.name);
                    continue;
                }

                try (InputStream sin = new FileInputStream(settingsFile)) {
                    SessionSettings settings = new SessionSettings(sin);
                    MessageStoreFactory storeFactory = new FileStoreFactory(settings);
                    LogFactory logFactory = new SLF4JLogFactory(settings);
                    MessageFactory messageFactory = new DefaultMessageFactory();
                    Application application = new FixApplication(routingService, sessionRegistry, messageStreamHandler);

                    SocketAcceptor acc = new SocketAcceptor(application, storeFactory, settings, logFactory, messageFactory);
                    acc.start();
                    acceptors.put(ic.name != null ? ic.name : settingsPath, acc);
                    logger.info("QuickFIX/J acceptor started for incoming '{}' (settings={})", ic.name, settingsPath);
                } catch (ConfigError | IOException e) {
                    logger.error("Failed to start QuickFIX/J acceptor for {}", settingsPath, e);
                }
            }
        }
    }

    public void stop() {
        synchronized (lock) {
            for (Map.Entry<String, SocketAcceptor> e : acceptors.entrySet()) {
                try {
                    e.getValue().stop();
                    logger.info("QuickFIX/J acceptor stopped for {}", e.getKey());
                } catch (Exception ex) {
                    logger.warn("Error stopping acceptor {}", e.getKey(), ex);
                }
            }
            acceptors.clear();
        }
    }

    public void reloadConfig(File file) {
        logger.info("Reload config requested: {}", file.getAbsolutePath());
        // For now, restart the acceptor to pick up settings changes
        stop();
        start();
    }

    /**
     * Start an acceptor for a dynamic connection entry. Keyed by the connection id.
     */
    public boolean startAcceptorForConnection(com.example.fixhub.model.Connection conn) {
        synchronized (lock) {
            String key = conn.getId();
            if (key == null) return false;
            if (acceptors.containsKey(key)) {
                logger.info("Acceptor already running for connection {}", key);
                return false;
            }
            String settingsPath = conn.getSettingsFile();
            if (settingsPath == null || settingsPath.isBlank()) settingsPath = "conf/quickfixj.cfg";
            File settingsFile = new File(settingsPath);
            if (!settingsFile.exists()) {
                logger.warn("Settings file {} for connection '{}' not found; skipping", settingsPath, conn.getName());
                return false;
            }

            try (InputStream sin = new FileInputStream(settingsFile)) {
                SessionSettings settings = new SessionSettings(sin);
                MessageStoreFactory storeFactory = new FileStoreFactory(settings);
                LogFactory logFactory = new SLF4JLogFactory(settings);
                MessageFactory messageFactory = new DefaultMessageFactory();
                Application application = new FixApplication(routingService, sessionRegistry, messageStreamHandler);

                SocketAcceptor acc = new SocketAcceptor(application, storeFactory, settings, logFactory, messageFactory);
                acc.start();
                acceptors.put(key, acc);
                logger.info("QuickFIX/J acceptor started for connection '{}' (settings={})", key, settingsPath);
                return true;
            } catch (ConfigError | IOException e) {
                logger.error("Failed to start QuickFIX/J acceptor for {}", settingsPath, e);
                return false;
            }
        }
    }

    public boolean stopAcceptorForConnectionId(String id) {
        synchronized (lock) {
            SocketAcceptor acc = acceptors.remove(id);
            if (acc == null) return false;
            try {
                acc.stop();
                logger.info("QuickFIX/J acceptor stopped for connection {}", id);
            } catch (Exception ex) {
                logger.warn("Error stopping acceptor for connection {}", id, ex);
            }
            return true;
        }
    }

    public List<SessionID> listSessions() {
        return new ArrayList<>(sessionRegistry.getSessions());
    }

    private static class FixApplication implements Application {

        private final RoutingService routingService;
        private final SessionRegistry sessionRegistry;
        private final MessageStreamHandler messageStreamHandler;

        public FixApplication(RoutingService routingService, SessionRegistry sessionRegistry, MessageStreamHandler messageStreamHandler) {
            this.routingService = routingService;
            this.sessionRegistry = sessionRegistry;
            this.messageStreamHandler = messageStreamHandler;
        }

        @Override
        public void onCreate(SessionID sessionId) {
            logger.info("onCreate {}", sessionId);
        }

        @Override
        public void onLogon(SessionID sessionId) {
            logger.info("onLogon {}", sessionId);
            sessionRegistry.add(sessionId);
        }

        @Override
        public void onLogout(SessionID sessionId) {
            logger.info("onLogout {}", sessionId);
            sessionRegistry.remove(sessionId);
        }

        @Override
        public void toAdmin(Message message, SessionID sessionId) {
            logger.debug("toAdmin {} {}", sessionId, message);
        }

        @Override
        public void fromAdmin(Message message, SessionID sessionId) throws FieldNotFound, IncorrectDataFormat, IncorrectTagValue, RejectLogon {
            logger.debug("fromAdmin {} {}", sessionId, message);
        }

        @Override
        public void toApp(Message message, SessionID sessionId) throws DoNotSend {
            logger.debug("toApp {} {}", sessionId, message);
        }

        @Override
        public void fromApp(Message message, SessionID sessionId) throws FieldNotFound, IncorrectDataFormat, IncorrectTagValue, UnsupportedMessageType {
            logger.info("fromApp {} {}", sessionId, message);
            
            // Broadcast message event via WebSocket
            if (messageStreamHandler != null) {
                try {
                    String messageType = message.getHeader().getString(35); // MsgType field
                    FIXMessageEvent event = new FIXMessageEvent(
                        "incoming",
                        sessionId.toString(),
                        sessionId.getSenderCompID(),
                        sessionId.getTargetCompID(),
                        messageType,
                        message.toString(),
                        "FROM_CLIENT"
                    );
                    messageStreamHandler.broadcastMessage(event);
                } catch (Exception e) {
                    logger.debug("Failed to broadcast message via WebSocket", e);
                }
            }
            
            try {
                boolean routed = routingService.route(message, sessionId);
                if (!routed) logger.debug("Message not routed: {}", message);
            } catch (Exception e) {
                logger.error("Routing failed", e);
            }
        }
    }
}

