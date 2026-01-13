# Docker Setup for FIX Hub

## Quick Start with Docker Compose

The easiest way to run FIX Hub with Docker:

```bash
docker-compose up -d
```

This will:
- Build the Docker image (frontend + backend)
- Start the container on port 8080
- Set up networking and volumes
- Enable health checks

Access the application at: **http://localhost:8080**

## Docker Build & Run

### Build the Docker image

```bash
docker build -t fixhub:latest .
```

### Run the container

```bash
docker run -d \
  --name fixhub \
  -p 8080:8080 \
  -v $(pwd)/conf:/app/conf:ro \
  -v $(pwd)/store:/app/store \
  -e APP_JWT_SECRET=your-secret-key \
  fixhub:latest
```

## Docker Compose Commands

### Start the application

```bash
docker-compose up -d
```

### Stop the application

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f fixhub
```

### Restart

```bash
docker-compose restart
```

## Image Details

### Multi-stage build
- **Stage 1**: Build frontend (Node.js 16 Alpine)
- **Stage 2**: Build backend (Maven + JDK 17)
- **Stage 3**: Runtime (JRE 17 Alpine - minimal image)

### Features
- ✅ Non-root user (fixhub:1000)
- ✅ Health checks enabled
- ✅ Memory optimization (-Xmx512m)
- ✅ Volume support for config and data
- ✅ Environment variable configuration
- ✅ Automatic restart policy

## Environment Variables

Configure via `docker-compose.yml` or `docker run -e`:

```bash
APP_JWT_SECRET=your-secret-key          # JWT signing key
APP_JWT_EXPIRATION=86400000             # Token expiration (ms)
JAVA_OPTS=-Xmx512m -Xms256m            # JVM settings
```

## Volumes

### Mount points

- `/app/conf` - Configuration files (read-only)
- `/app/store` - FIX message store and data (persistent)

### Example with custom config

```bash
docker-compose -f docker-compose.yml \
  -e "FIXHUB_CONFIG_PATH=/app/conf/custom.yml" \
  up -d
```

## Networking

Docker Compose creates a bridge network `fixhub-network`. To connect other containers:

```yaml
services:
  your-service:
    networks:
      - fixhub-network
    depends_on:
      - fixhub
```

Then access FIX Hub at: `http://fixhub:8080`

## Health Checks

The container includes health checks:

```bash
docker-compose ps  # Shows health status
```

View health status:

```bash
docker inspect fixhub | grep -A 20 '"Health"'
```

## Image Size

Optimized with multi-stage build:
- **Final image**: ~400-450 MB
- Uses JRE 17 (not JDK) to reduce size
- Alpine base image reduces overhead

## Troubleshooting

### Check logs

```bash
docker-compose logs -f fixhub
```

### Access shell

```bash
docker exec -it fixhub /bin/bash
```

### Check health

```bash
curl http://localhost:8080/api/websocket/status
```

### Port already in use

```bash
docker-compose down
# or change port in docker-compose.yml
```

### Memory issues

Adjust `JAVA_OPTS`:

```yaml
environment:
  - JAVA_OPTS=-Xmx1g -Xms512m  # 1GB heap
```

## Production Considerations

### Security
- Change `APP_JWT_SECRET` to a strong key
- Use environment variables from `.env` file
- Run with read-only root filesystem

### Performance
- Increase heap: `-Xmx2g` for larger workloads
- Add CPU limits: `cpus: "2"`
- Add memory limits: `mem_limit: 2GB`

### Example production setup

```yaml
services:
  fixhub:
    build: .
    container_name: fixhub
    ports:
      - "8080:8080"
    environment:
      - JAVA_OPTS=-Xmx2g -Xms1g
      - APP_JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./conf:/app/conf:ro
      - ./store:/app/store
    restart: always
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/websocket/status"]
      interval: 30s
      timeout: 10s
      retries: 5
    deploy:
      resources:
        limits:
          cpus: "2"
          memory: 2G
        reservations:
          cpus: "1"
          memory: 1G
```

## Docker Push to Registry

```bash
# Tag image
docker tag fixhub:latest myregistry.com/fixhub:latest

# Push to registry
docker push myregistry.com/fixhub:latest

# Use from registry
docker pull myregistry.com/fixhub:latest
```

## Kubernetes Deployment

Example Kubernetes manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fixhub
spec:
  replicas: 1
  selector:
    matchLabels:
      app: fixhub
  template:
    metadata:
      labels:
        app: fixhub
    spec:
      containers:
      - name: fixhub
        image: fixhub:latest
        ports:
        - containerPort: 8080
        env:
        - name: APP_JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: fixhub-secrets
              key: jwt-secret
        volumeMounts:
        - name: config
          mountPath: /app/conf
          readOnly: true
        - name: store
          mountPath: /app/store
        livenessProbe:
          httpGet:
            path: /api/websocket/status
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
      volumes:
      - name: config
        configMap:
          name: fixhub-config
      - name: store
        persistentVolumeClaim:
          claimName: fixhub-pvc
```

## Clean Up

Remove all containers and images:

```bash
docker-compose down -v                    # Stop and remove volumes
docker rmi fixhub:latest                  # Remove image
```
