package com.example.fixhub.websocket;

public class FIXMessageEvent {
    public String type; // "incoming" or "outgoing"
    public String sessionId;
    public String senderCompID;
    public String targetCompID;
    public String messageType;
    public String messageBody;
    public long timestamp;
    public String direction; // "FROM_CLIENT", "TO_CLIENT", "FROM_SERVER", "TO_SERVER"

    public FIXMessageEvent() {
        this.timestamp = System.currentTimeMillis();
    }

    public FIXMessageEvent(String type, String sessionId, String senderCompID, String targetCompID,
                          String messageType, String messageBody, String direction) {
        this();
        this.type = type;
        this.sessionId = sessionId;
        this.senderCompID = senderCompID;
        this.targetCompID = targetCompID;
        this.messageType = messageType;
        this.messageBody = messageBody;
        this.direction = direction;
    }
}
