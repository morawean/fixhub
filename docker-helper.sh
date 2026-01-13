#!/bin/bash

# Docker helper script for FIX Hub
# Usage: ./docker-helper.sh [build|run|stop|logs|push]

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
IMAGE_NAME="fixhub"
IMAGE_TAG="latest"
CONTAINER_NAME="fixhub"
REGISTRY=""  # Set to your registry: "myregistry.com"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_usage() {
    echo "FIX Hub Docker Helper"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  build       Build Docker image"
    echo "  compose-up  Start with docker-compose"
    echo "  compose-down Stop with docker-compose"
    echo "  run         Run container directly"
    echo "  stop        Stop running container"
    echo "  logs        View container logs"
    echo "  shell       Open shell in container"
    echo "  health      Check container health"
    echo "  push        Push image to registry"
    echo "  clean       Remove image and containers"
    echo ""
    echo "Examples:"
    echo "  $0 build"
    echo "  $0 compose-up"
    echo "  $0 logs"
}

build() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Image built successfully${NC}"
        docker images | grep ${IMAGE_NAME}
    else
        echo -e "${RED}✗ Build failed${NC}"
        return 1
    fi
}

compose_up() {
    echo -e "${YELLOW}Starting with docker-compose...${NC}"
    docker-compose up -d
    sleep 3
    docker-compose ps
    echo ""
    echo -e "${GREEN}✓ Application starting...${NC}"
    echo -e "  Frontend: http://localhost:8080"
    echo -e "  Login: admin/admin"
}

compose_down() {
    echo -e "${YELLOW}Stopping docker-compose...${NC}"
    docker-compose down
    echo -e "${GREEN}✓ Stopped${NC}"
}

run() {
    echo -e "${YELLOW}Running container...${NC}"
    docker run -d \
        --name ${CONTAINER_NAME} \
        -p 8080:8080 \
        -v $(pwd)/conf:/app/conf:ro \
        -v $(pwd)/store:/app/store \
        -e APP_JWT_SECRET=your-secret-key \
        ${IMAGE_NAME}:${IMAGE_TAG}
    
    sleep 3
    docker ps
    echo ""
    echo -e "${GREEN}✓ Container running${NC}"
    echo -e "  Frontend: http://localhost:8080"
}

stop() {
    echo -e "${YELLOW}Stopping container...${NC}"
    docker stop ${CONTAINER_NAME}
    docker rm ${CONTAINER_NAME}
    echo -e "${GREEN}✓ Stopped${NC}"
}

logs() {
    docker logs -f ${CONTAINER_NAME}
}

shell() {
    echo -e "${YELLOW}Opening shell in container...${NC}"
    docker exec -it ${CONTAINER_NAME} /bin/bash
}

health() {
    echo -e "${YELLOW}Checking container health...${NC}"
    docker inspect ${CONTAINER_NAME} | grep -A 10 '"Health"'
}

push() {
    if [ -z "$REGISTRY" ]; then
        echo -e "${RED}✗ Registry not configured${NC}"
        echo "  Set REGISTRY variable in script"
        return 1
    fi
    
    echo -e "${YELLOW}Tagging image for registry...${NC}"
    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    
    echo -e "${YELLOW}Pushing to registry...${NC}"
    docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}
    echo -e "${GREEN}✓ Pushed${NC}"
}

clean() {
    echo -e "${YELLOW}Cleaning up...${NC}"
    
    if docker ps -a | grep ${CONTAINER_NAME} > /dev/null; then
        docker stop ${CONTAINER_NAME} 2>/dev/null
        docker rm ${CONTAINER_NAME}
    fi
    
    if docker images | grep ${IMAGE_NAME} > /dev/null; then
        docker rmi ${IMAGE_NAME}:${IMAGE_TAG}
    fi
    
    echo -e "${GREEN}✓ Cleaned${NC}"
}

# Main
if [ $# -eq 0 ]; then
    print_usage
    exit 0
fi

case "$1" in
    build)
        build
        ;;
    compose-up)
        compose_up
        ;;
    compose-down)
        compose_down
        ;;
    run)
        run
        ;;
    stop)
        stop
        ;;
    logs)
        logs
        ;;
    shell)
        shell
        ;;
    health)
        health
        ;;
    push)
        push
        ;;
    clean)
        clean
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        print_usage
        exit 1
        ;;
esac
