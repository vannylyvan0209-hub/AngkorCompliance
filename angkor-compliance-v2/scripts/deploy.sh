#!/bin/bash

# Angkor Compliance Platform Deployment Script
# This script handles the deployment of the application to production

set -e

# Configuration
APP_NAME="angkor-compliance"
DOCKER_REGISTRY="ghcr.io"
VERSION=${1:-latest}
ENVIRONMENT=${2:-production}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed"
        exit 1
    fi
    
    log_success "All dependencies are installed"
}

# Check if environment file exists
check_environment() {
    log_info "Checking environment configuration..."
    
    if [ ! -f ".env.production" ]; then
        log_error "Environment file .env.production not found"
        log_info "Please copy env.production.example to .env.production and update the values"
        exit 1
    fi
    
    log_success "Environment configuration found"
}

# Pull latest images
pull_images() {
    log_info "Pulling latest images..."
    
    docker-compose -f docker-compose.prod.yml pull
    
    log_success "Images pulled successfully"
}

# Run database migrations
run_migrations() {
    log_info "Running database migrations..."
    
    docker-compose -f docker-compose.prod.yml run --rm backend npx prisma migrate deploy
    
    log_success "Database migrations completed"
}

# Deploy application
deploy() {
    log_info "Deploying application..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down
    
    # Start new containers
    docker-compose -f docker-compose.prod.yml up -d
    
    log_success "Application deployed successfully"
}

# Wait for services to be healthy
wait_for_health() {
    log_info "Waiting for services to be healthy..."
    
    # Wait for database
    log_info "Waiting for database..."
    timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U angkor_user -d angkor_compliance; do sleep 2; done'
    
    # Wait for Redis
    log_info "Waiting for Redis..."
    timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml exec redis redis-cli ping; do sleep 2; done'
    
    # Wait for backend
    log_info "Waiting for backend..."
    timeout 60 bash -c 'until docker-compose -f docker-compose.prod.yml exec backend node healthcheck.js; do sleep 2; done'
    
    # Wait for frontend
    log_info "Waiting for frontend..."
    timeout 60 bash -c 'until curl -f http://localhost/health; do sleep 2; done'
    
    log_success "All services are healthy"
}

# Run health checks
health_check() {
    log_info "Running health checks..."
    
    # Check database
    if docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U angkor_user -d angkor_compliance; then
        log_success "Database is healthy"
    else
        log_error "Database health check failed"
        exit 1
    fi
    
    # Check Redis
    if docker-compose -f docker-compose.prod.yml exec redis redis-cli ping; then
        log_success "Redis is healthy"
    else
        log_error "Redis health check failed"
        exit 1
    fi
    
    # Check backend
    if docker-compose -f docker-compose.prod.yml exec backend node healthcheck.js; then
        log_success "Backend is healthy"
    else
        log_error "Backend health check failed"
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost/health; then
        log_success "Frontend is healthy"
    else
        log_error "Frontend health check failed"
        exit 1
    fi
    
    log_success "All health checks passed"
}

# Clean up old images
cleanup() {
    log_info "Cleaning up old images..."
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting deployment of $APP_NAME version $VERSION to $ENVIRONMENT"
    
    check_dependencies
    check_environment
    pull_images
    run_migrations
    deploy
    wait_for_health
    health_check
    cleanup
    
    log_success "Deployment completed successfully!"
    log_info "Application is available at: http://localhost"
    log_info "API is available at: http://localhost/api"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [VERSION] [ENVIRONMENT]"
        echo ""
        echo "Arguments:"
        echo "  VERSION      Docker image version to deploy (default: latest)"
        echo "  ENVIRONMENT  Deployment environment (default: production)"
        echo ""
        echo "Examples:"
        echo "  $0                    # Deploy latest version to production"
        echo "  $0 v1.0.0            # Deploy v1.0.0 to production"
        echo "  $0 v1.0.0 staging    # Deploy v1.0.0 to staging"
        exit 0
        ;;
    *)
        main
        ;;
esac
