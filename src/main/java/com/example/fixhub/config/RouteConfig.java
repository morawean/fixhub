package com.example.fixhub.config;

public class RouteConfig {
    public String from; // incoming name
    public String to;   // outgoing name
    public Integer conditionTag; // optional FIX tag to inspect
    public String conditionValue; // optional value to match

    public RouteConfig() {}

    public RouteConfig(String from, String to) {
        this.from = from;
        this.to = to;
    }

    public String getFrom() { return from; }
    public void setFrom(String from) { this.from = from; }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public Integer getConditionTag() { return conditionTag; }
    public void setConditionTag(Integer conditionTag) { this.conditionTag = conditionTag; }

    public String getConditionValue() { return conditionValue; }
    public void setConditionValue(String conditionValue) { this.conditionValue = conditionValue; }
}
