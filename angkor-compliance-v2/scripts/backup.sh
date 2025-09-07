#!/bin/bash

# Angkor Compliance Platform Backup Script
# This script handles database backups and file storage backups

set -e

# Configuration
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="angkor_compliance_backup_${DATE}"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

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

# Create backup directory
create_backup_dir() {
    log_info "Creating backup directory..."
    mkdir -p "${BACKUP_DIR}/${BACKUP_NAME}"
    log_success "Backup directory created: ${BACKUP_DIR}/${BACKUP_NAME}"
}

# Backup database
backup_database() {
    log_info "Starting database backup..."
    
    # Create database dump
    pg_dump -h postgres -U ${POSTGRES_USER} -d ${POSTGRES_DB} \
        --verbose --clean --no-owner --no-privileges \
        --format=custom --file="${BACKUP_DIR}/${BACKUP_NAME}/database.dump"
    
    if [ $? -eq 0 ]; then
        log_success "Database backup completed"
    else
        log_error "Database backup failed"
        exit 1
    fi
}

# Backup Redis data
backup_redis() {
    log_info "Starting Redis backup..."
    
    # Create Redis dump
    redis-cli -h redis -a ${REDIS_PASSWORD} --rdb "${BACKUP_DIR}/${BACKUP_NAME}/redis.rdb"
    
    if [ $? -eq 0 ]; then
        log_success "Redis backup completed"
    else
        log_warning "Redis backup failed (this is optional)"
    fi
}

# Backup file storage
backup_files() {
    log_info "Starting file storage backup..."
    
    # Create files backup
    tar -czf "${BACKUP_DIR}/${BACKUP_NAME}/files.tar.gz" \
        -C /app/uploads . 2>/dev/null || log_warning "No files to backup"
    
    log_success "File storage backup completed"
}

# Upload to S3
upload_to_s3() {
    if [ -n "${AWS_S3_BUCKET}" ] && [ -n "${AWS_ACCESS_KEY_ID}" ] && [ -n "${AWS_SECRET_ACCESS_KEY}" ]; then
        log_info "Uploading backup to S3..."
        
        # Create compressed archive
        tar -czf "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" -C "${BACKUP_DIR}" "${BACKUP_NAME}"
        
        # Upload to S3
        aws s3 cp "${BACKUP_DIR}/${BACKUP_NAME}.tar.gz" \
            "s3://${AWS_S3_BUCKET}/backups/${BACKUP_NAME}.tar.gz"
        
        if [ $? -eq 0 ]; then
            log_success "Backup uploaded to S3 successfully"
        else
            log_error "Failed to upload backup to S3"
            exit 1
        fi
    else
        log_warning "S3 configuration not found, skipping S3 upload"
    fi
}

# Clean up old backups
cleanup_old_backups() {
    log_info "Cleaning up old backups..."
    
    # Clean up local backups
    find "${BACKUP_DIR}" -name "angkor_compliance_backup_*" -type d -mtime +${RETENTION_DAYS} -exec rm -rf {} \;
    find "${BACKUP_DIR}" -name "angkor_compliance_backup_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    # Clean up S3 backups
    if [ -n "${AWS_S3_BUCKET}" ] && [ -n "${AWS_ACCESS_KEY_ID}" ] && [ -n "${AWS_SECRET_ACCESS_KEY}" ]; then
        aws s3 ls "s3://${AWS_S3_BUCKET}/backups/" | \
        awk '{print $4}' | \
        grep "angkor_compliance_backup_" | \
        head -n -${RETENTION_DAYS} | \
        xargs -I {} aws s3 rm "s3://${AWS_S3_BUCKET}/backups/{}"
    fi
    
    log_success "Old backups cleaned up"
}

# Verify backup
verify_backup() {
    log_info "Verifying backup..."
    
    # Check if backup files exist
    if [ -f "${BACKUP_DIR}/${BACKUP_NAME}/database.dump" ]; then
        log_success "Database backup verified"
    else
        log_error "Database backup verification failed"
        exit 1
    fi
    
    if [ -f "${BACKUP_DIR}/${BACKUP_NAME}/redis.rdb" ]; then
        log_success "Redis backup verified"
    fi
    
    if [ -f "${BACKUP_DIR}/${BACKUP_NAME}/files.tar.gz" ]; then
        log_success "File storage backup verified"
    fi
    
    log_success "Backup verification completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    if [ -n "${SMTP_HOST}" ] && [ -n "${SMTP_USER}" ] && [ -n "${SMTP_PASSWORD}" ]; then
        log_info "Sending notification..."
        
        # Send email notification
        echo "Backup ${status}: ${message}" | \
        mail -s "Angkor Compliance Backup ${status}" \
             -a "From: ${SMTP_USER}" \
             "${SMTP_USER}"
        
        log_success "Notification sent"
    else
        log_warning "SMTP configuration not found, skipping notification"
    fi
}

# Main backup function
main() {
    log_info "Starting backup process..."
    
    create_backup_dir
    backup_database
    backup_redis
    backup_files
    verify_backup
    upload_to_s3
    cleanup_old_backups
    
    log_success "Backup process completed successfully!"
    send_notification "SUCCESS" "Backup completed successfully"
}

# Handle script arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --verify      Verify existing backup"
        echo "  --restore     Restore from backup"
        echo ""
        echo "Environment Variables:"
        echo "  POSTGRES_USER           Database username"
        echo "  POSTGRES_DB             Database name"
        echo "  REDIS_PASSWORD          Redis password"
        echo "  AWS_S3_BUCKET           S3 bucket for backup storage"
        echo "  AWS_ACCESS_KEY_ID       AWS access key"
        echo "  AWS_SECRET_ACCESS_KEY   AWS secret key"
        echo "  BACKUP_RETENTION_DAYS   Number of days to retain backups"
        echo "  SMTP_HOST               SMTP server for notifications"
        echo "  SMTP_USER               SMTP username"
        echo "  SMTP_PASSWORD           SMTP password"
        exit 0
        ;;
    --verify)
        verify_backup
        ;;
    --restore)
        log_info "Restore functionality not implemented yet"
        exit 1
        ;;
    *)
        main
        ;;
esac
