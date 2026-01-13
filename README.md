# FIX Hub (prototype)

This repository contains a minimal scaffold for a FIX hub using Spring Boot and QuickFIX/J.

Quick start

Build and run locally:

```bash
mvn -DskipTests package
java -jar target/fix-hub-0.1.0.jar
```

Reload config at runtime (example):

```bash
curl -X POST "http://localhost:8080/api/config/reload?path=./conf/fixhub.yml"
```

Next steps

- Implement QuickFIX/J engine wiring in `com.example.fixhub.service.FixEngineService`
- Add web UI (React/TypeScript) to manage config and view sessions
- Add TLS, authentication, metrics, and persistence
