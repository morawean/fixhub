# FIX Hub - Docker Setup Guide

## Files Created

✅ **Dockerfile** - Multi-stage Docker build (frontend + backend)  
✅ **docker-compose.yml** - Docker Compose configuration  
✅ **.dockerignore** - Files to exclude from Docker build  
✅ **DOCKER.md** - Comprehensive Docker documentation  
✅ **docker-helper.sh** - Helper script for Docker commands  
✅ **.env.example** - Environment variable template  

## Quick Start

### Option 1: Docker Compose (Recommended)

```bash
cd /home/am/Dokumente/develop/finclusion
docker-compose up -d
```

Then visit: **http://localhost:8080**

### Option 2: Manual Docker Build & Run

```bash
# Build
docker build -t fixhub:latest .

# Run
docker run -d -p 8080:8080 \
  -v $(pwd)/conf:/app/conf:ro \
  -v $(pwd)/store:/app/store \
  fixhub:latest
```

### Option 3: Docker Helper Script

```bash
./docker-helper.sh build          # Build image
./docker-helper.sh compose-up     # Start with docker-compose
./docker-helper.sh logs           # View logs
./docker-helper.sh stop           # Stop container
```

## Dockerfile Features

✅ **Multi-stage build** - Optimized final image (~450MB)
- Stage 1: Node 16 (builds frontend)
- Stage 2: Maven + JDK 17 (builds backend)
- Stage 3: JRE 17 only (runtime)

✅ **Security**
- Non-root user (fixhub:1000)
- Minimal base image

✅ **Production-ready**
- Health checks enabled
- Automatic restart
- Memory limits
- Volume mounts

✅ **Frontend + Backend**
- Builds React/Vite frontend
- Builds Maven fat JAR
- Embeds frontend in JAR
- Single container deployment

## Volumes

Mount your config and data directories:

```bash
docker run -d -p 8080:8080 \
  -v $(pwd)/conf:/app/conf:ro \
  -v $(pwd)/store:/app/store \
  fixhub:latest
```

- `/app/conf` - Configuration files (read-only)
- `/app/store` - FIX message store (persistent)

## Environment Variables

```bash
docker run -d -p 8080:8080 \
  -e APP_JWT_SECRET=your-secret-key \
  -e APP_JWT_EXPIRATION=86400000 \
  -e JAVA_OPTS="-Xmx512m -Xms256m" \
  fixhub:latest
```

Or use .env file:

```bash
cp .env.example .env
# Edit .env with your settings
docker-compose --env-file .env up -d
```

## Docker Compose Features

✅ **Network isolation** - fixhub-network bridge
✅ **Health checks** - HTTP endpoint monitoring
✅ **Volume management** - Persistent storage
✅ **Environment variables** - Easy configuration
✅ **Restart policy** - unless-stopped

## Common Commands

### Build
```bash
docker build -t fixhub:latest .
docker-compose build --no-cache  # Rebuild from scratch
```

### Run
```bash
docker-compose up -d              # Start in background
docker run -d -p 8080:8080 fixhub  # Direct run
```

### Monitor
```bash
docker-compose logs -f             # Stream logs
docker ps                          # List containers
docker stats                       # Resource usage
```

### Manage
```bash
docker-compose restart              # Restart service
docker-compose down                 # Stop and remove
docker-compose down -v              # Also remove volumes
```

### Debug
```bash
docker exec -it fixhub /bin/bash   # Shell access
docker logs fixhub                 # View logs
curl http://localhost:8080/api/websocket/status  # Health check
```

## Production Deployment

### Docker Swarm

```bash
docker stack deploy -c docker-compose.yml fixhub
```

### Kubernetes

See DOCKER.md for full Kubernetes example manifest.

### Container Registry

```bash
# Tag
docker tag fixhub:latest myregistry.com/fixhub:latest

# Push
docker push myregistry.com/fixhub:latest

# Use
docker pull myregistry.com/fixhub:latest
```

## Troubleshooting

### Port 8080 already in use
```bash
docker-compose down
# or change port in docker-compose.yml: ports: ["9090:8080"]
```

### Container won't start
```bash
docker logs fixhub  # Check logs
docker ps -a        # See stopped containers
```

### Check health
```bash
docker inspect fixhub | grep -A 10 '"Health"'
curl http://localhost:8080/api/websocket/status
```

### Memory issues
```yaml
# Increase in docker-compose.yml
environment:
  - JAVA_OPTS=-Xmx2g -Xms1g
```

## Cleanup

```bash
# Remove container
docker-compose down

# Remove image
docker rmi fixhub:latest

# Remove everything
docker system prune -a
```

## File Structure

```
finclusion/
├── Dockerfile              ← Multi-stage build
├── docker-compose.yml      ← Easy deployment
├── docker-helper.sh        ← Helper commands
├── .dockerignore          ← Files to exclude
├── .env.example           ← Config template
├── DOCKER.md              ← Full documentation
├── pom.xml
├── ui/
│   ├── package.json
│   └── src/
└── src/
    └── main/java/
```

## Security Checklist

- ☐ Change `APP_JWT_SECRET` from default
- ☐ Use `.env` file (add to .gitignore)
- ☐ Set proper file permissions on conf/
- ☐ Use read-only volume for config
- ☐ Set resource limits (CPU, memory)
- ☐ Use non-root user (already done)
- ☐ Scan image: `docker scan fixhub:latest`

## Performance Tips

1. **Memory**: Adjust `-Xmx` based on your workload
2. **CPU**: Set limits in docker-compose.yml
3. **Storage**: Use volume mount for persistent data
4. **Logs**: Rotate logs to prevent disk issues
5. **Network**: Keep fixhub-network isolated

## Next Steps

1. ✓ Docker files created
2. Install Docker on your system
3. Run `docker-compose up -d`
4. Visit http://localhost:8080
5. See DOCKER.md for advanced usage

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Kubernetes with Docker](https://kubernetes.io/docs/tasks/container-lifecycle-management/deploy-container-linux/)
- See `DOCKER.md` for detailed guides
