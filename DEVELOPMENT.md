# Development Guide

## Starting Backend

```bash
# Option 1: Run from IDE
# Import project in IntelliJ/Eclipse and run FixHubApplication.java

# Option 2: Maven
mvn clean package -DskipTests
java -jar target/fix-hub-0.1.0.jar

# Option 3: Maven directly
mvn spring-boot:run
```

**Backend runs on:** `http://localhost:8080`

## Starting Frontend

```bash
cd ui

# Install dependencies (first time only)
npm install

# Development mode (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

**Frontend runs on:** `http://localhost:5173` (dev) or `http://localhost:8080` (when served by backend)

## Development Workflow

### For Backend Development
1. Start backend: `mvn spring-boot:run`
2. Changes automatically reload via Spring Boot DevTools
3. Test API endpoints with curl or Postman

### For Frontend Development
1. Start backend: `java -jar target/fix-hub-0.1.0.jar` (or `mvn spring-boot:run`)
2. Start frontend: `cd ui && npm run dev`
3. Edit React components - changes auto-reload in browser
4. Access UI at: `http://localhost:5173`

### For Full Integration Testing
1. Build frontend: `cd ui && npm run build`
2. Start backend: `java -jar target/fix-hub-0.1.0.jar`
3. Access at: `http://localhost:8080`
4. Frontend served by backend's static server

## Key Directories

| Path | Purpose |
|------|---------|
| `src/main/java/` | Spring Boot application code |
| `src/main/resources/` | Configuration files, static assets |
| `ui/src/` | React components and logic |
| `ui/dist/` | Built frontend (production) |
| `conf/` | FIX protocol configuration |
| `store/` | Runtime FIX message storage |

## Testing Commands

```bash
# Backend health check
curl http://localhost:8080/actuator/health

# Backend info
curl http://localhost:8080/actuator/info

# Frontend API test
curl http://localhost:8080/api/config/reload?path=./conf/fixhub.yml
```

## Troubleshooting

### Port 8080 Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

### Frontend Not Updating After Changes
1. Clear browser cache (Ctrl+Shift+Delete)
2. Restart dev server: `npm run dev`

### Maven Build Issues
```bash
# Clean and rebuild
mvn clean install -DskipTests

# Update dependencies
mvn dependency:resolve
```
