# Build Stage - Frontend
FROM node:16-alpine AS frontend-builder
WORKDIR /app/ui
COPY ui/package*.json ./
RUN npm install
COPY ui/src ./src
COPY ui/public ./public
COPY ui/tsconfig.json ui/vite.config.ts ui/index.html ./
RUN npm run build

# Build Stage - Backend
FROM maven:3.9-eclipse-temurin-17 AS backend-builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
COPY conf ./conf
COPY --from=frontend-builder /app/ui/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Copy the built JAR from builder
COPY --from=backend-builder /app/target/fix-hub-0.1.0.jar app.jar

# Create non-root user
RUN useradd -m -u 1000 fixhub && chown fixhub:fixhub /app
USER fixhub

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8080/api/websocket/status || exit 1

# Start application
ENTRYPOINT ["java", "-jar", "app.jar"]
