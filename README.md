# FIX Hub - Backend & Frontend

A minimal scaffold for a FIX hub using Spring Boot and QuickFIX/J with a React UI.

## Project Structure

```
finclusion/
├── src/              # Backend (Spring Boot/Java)
├── ui/               # Frontend (React/TypeScript)
├── conf/             # FIX configuration files
├── start-backend.sh  # Start backend server
├── start-frontend.sh # Start frontend dev server
└── DEVELOPMENT.md    # Detailed development guide
```

## Quick Start

### Prerequisites
- **Backend**: Java 17, Maven
- **Frontend**: Node.js 16+, npm

### Start Backend

```bash
./start-backend.sh
```

Server runs on: **http://localhost:8080**

### Start Frontend (Dev Mode)

```bash
./start-frontend.sh
```

Frontend runs on: **http://localhost:5173**

## API Endpoints

```bash
# Health check
curl http://localhost:8080/actuator/health

# Reload config
curl -X POST "http://localhost:8080/api/config/reload?path=./conf/fixhub.yml"
```

## Frontend Build for Production

```bash
cd ui
npm run build    # Creates optimized build in dist/
npm run preview  # Preview production build
```

## Next Steps

- See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed development workflow
- Implement QuickFIX/J engine in `src/main/java/com/example/fixhub/service/`
- Extend React components in `ui/src/components/`
- Add TLS, authentication, and persistence
