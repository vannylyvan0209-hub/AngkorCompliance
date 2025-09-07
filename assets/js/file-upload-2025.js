/**
 * Angkor Compliance Platform - File Upload JavaScript 2025
 * 
 * Modern file upload components with drag-and-drop functionality,
 * accessibility support, and responsive design.
 */

class FileUploadManager {
    constructor() {
        this.uploads = new Map();
        this.config = {
            maxFileSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: ['image/*', 'application/pdf', 'text/*'],
            maxFiles: 5,
            enableDragDrop: true,
            enableProgress: true,
            enablePreview: true,
            enableValidation: true,
            enableAccessibility: true,
            enableAnimations: true,
            uploadUrl: '/api/upload',
            chunkSize: 1024 * 1024, // 1MB
            retryAttempts: 3,
            retryDelay: 1000
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeUploads();
        this.setupAccessibility();
        this.setupResponsive();
    }

    setupEventListeners() {
        // Handle window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardNavigation(e);
        });

        // Handle paste events
        document.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });
    }

    initializeUploads() {
        const uploadElements = document.querySelectorAll('.file-upload');
        
        uploadElements.forEach((element, index) => {
            const id = element.id || `file-upload-${index}`;
            this.createUpload(id, element);
        });
    }

    setupAccessibility() {
        this.uploads.forEach((upload, id) => {
            const { element } = upload;
            
            // Add ARIA attributes
            if (!element.getAttribute('role')) {
                element.setAttribute('role', 'button');
            }
            
            if (!element.getAttribute('aria-label')) {
                element.setAttribute('aria-label', 'File upload area');
            }
            
            if (!element.getAttribute('tabindex')) {
                element.setAttribute('tabindex', '0');
            }
        });
    }

    setupResponsive() {
        const updateResponsiveClasses = () => {
            this.uploads.forEach((upload) => {
                const { element } = upload;
                
                if (window.innerWidth < 768) {
                    element.classList.add('file-upload-mobile');
                } else {
                    element.classList.remove('file-upload-mobile');
                }
                
                if (window.innerWidth < 480) {
                    element.classList.add('file-upload-small');
                } else {
                    element.classList.remove('file-upload-small');
                }
            });
        };
        
        updateResponsiveClasses();
        window.addEventListener('resize', updateResponsiveClasses);
    }

    // Public Methods
    createUpload(id, element, options = {}) {
        const config = { ...this.config, ...options };
        
        // Store upload
        this.uploads.set(id, {
            id,
            element,
            config,
            files: [],
            isUploading: false,
            isDragOver: false,
            progress: 0,
            error: null,
            success: false
        });
        
        // Apply configuration
        this.applyConfiguration(this.uploads.get(id));
        
        return this.uploads.get(id);
    }

    addFile(id, file) {
        const upload = this.uploads.get(id);
        if (!upload) {
            console.error(`File upload with id "${id}" not found`);
            return;
        }
        
        const { config } = upload;
        
        // Validate file
        if (!this.validateFile(file, config)) {
            return false;
        }
        
        // Add file
        upload.files.push(file);
        
        // Render upload
        this.renderUpload(upload);
        
        // Trigger event
        this.triggerEvent(upload.element, 'file-upload:file:add', { 
            upload: config, 
            file 
        });
        
        return true;
    }

    removeFile(id, fileIndex) {
        const upload = this.uploads.get(id);
        if (!upload) {
            console.error(`File upload with id "${id}" not found`);
            return;
        }
        
        const { config } = upload;
        
        // Remove file
        const file = upload.files.splice(fileIndex, 1)[0];
        
        // Render upload
        this.renderUpload(upload);
        
        // Trigger event
        this.triggerEvent(upload.element, 'file-upload:file:remove', { 
            upload: config, 
            file 
        });
        
        return file;
    }

    clearFiles(id) {
        const upload = this.uploads.get(id);
        if (!upload) {
            console.error(`File upload with id "${id}" not found`);
            return;
        }
        
        const { config } = upload;
        
        // Clear files
        upload.files = [];
        
        // Render upload
        this.renderUpload(upload);
        
        // Trigger event
        this.triggerEvent(upload.element, 'file-upload:files:clear', { 
            upload: config 
        });
        
        return this;
    }

    uploadFiles(id) {
        const upload = this.uploads.get(id);
        if (!upload) {
            console.error(`File upload with id "${id}" not found`);
            return;
        }
        
        const { config } = upload;
        
        if (upload.files.length === 0) {
            return;
        }
        
        // Start upload
        upload.isUploading = true;
        upload.progress = 0;
        upload.error = null;
        upload.success = false;
        
        // Render upload
        this.renderUpload(upload);
        
        // Trigger event
        this.triggerEvent(upload.element, 'file-upload:upload:start', { 
            upload: config, 
            files: upload.files 
        });
        
        // Upload files
        this.performUpload(upload);
        
        return this;
    }

    cancelUpload(id) {
        const upload = this.uploads.get(id);
        if (!upload) {
            console.error(`File upload with id "${id}" not found`);
            return;
        }
        
        const { config } = upload;
        
        // Cancel upload
        upload.isUploading = false;
        upload.progress = 0;
        
        // Render upload
        this.renderUpload(upload);
        
        // Trigger event
        this.triggerEvent(upload.element, 'file-upload:upload:cancel', { 
            upload: config 
        });
        
        return this;
    }

    // Private Methods
    applyConfiguration(upload) {
        const { element, config } = upload;
        
        // Add configuration classes
        if (config.enableDragDrop) element.classList.add('file-upload-drag-enabled');
        if (config.enableProgress) element.classList.add('file-upload-progress-enabled');
        if (config.enablePreview) element.classList.add('file-upload-preview-enabled');
        if (config.enableValidation) element.classList.add('file-upload-validation-enabled');
        if (config.enableAccessibility) element.classList.add('file-upload-accessibility-enabled');
        if (config.enableAnimations) element.classList.add('file-upload-animations-enabled');
        
        // Add event listeners
        this.addEventListeners(upload);
        
        // Initialize features
        if (config.enableDragDrop) this.initializeDragDrop(upload);
        if (config.enableProgress) this.initializeProgress(upload);
        if (config.enablePreview) this.initializePreview(upload);
        if (config.enableValidation) this.initializeValidation(upload);
        if (config.enableAccessibility) this.initializeAccessibility(upload);
        if (config.enableAnimations) this.initializeAnimations(upload);
        
        // Render upload
        this.renderUpload(upload);
    }

    addEventListeners(upload) {
        const { element, config } = upload;
        
        // Click event listeners
        element.addEventListener('click', () => {
            this.handleClick(upload);
        });
        
        // Input event listeners
        const input = element.querySelector('.file-upload-input');
        if (input) {
            input.addEventListener('change', (e) => {
                this.handleFileSelect(upload, e);
            });
        }
        
        // Button event listeners
        const button = element.querySelector('.file-upload-button');
        if (button) {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleClick(upload);
            });
        }
        
        // Action event listeners
        const actions = element.querySelectorAll('.file-upload-item-action');
        actions.forEach((action, index) => {
            action.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleAction(upload, action, index);
            });
        });
    }

    renderUpload(upload) {
        const { element, config, files, isUploading, progress, error, success } = upload;
        
        // Update content
        this.updateUploadContent(upload);
        
        // Update list
        this.updateUploadList(upload);
        
        // Update state
        this.updateUploadState(upload);
    }

    updateUploadContent(upload) {
        const { element, config, files } = upload;
        
        const content = element.querySelector('.file-upload-content');
        if (!content) return;
        
        const icon = content.querySelector('.file-upload-icon');
        const title = content.querySelector('.file-upload-title');
        const subtitle = content.querySelector('.file-upload-subtitle');
        const button = content.querySelector('.file-upload-button');
        
        if (files.length === 0) {
            if (icon) icon.innerHTML = '<i data-lucide="upload"></i>';
            if (title) title.textContent = 'Drop files here or click to upload';
            if (subtitle) subtitle.textContent = 'Supports: ' + config.allowedTypes.join(', ');
            if (button) button.textContent = 'Choose Files';
        } else {
            if (icon) icon.innerHTML = '<i data-lucide="file"></i>';
            if (title) title.textContent = `${files.length} file(s) selected`;
            if (subtitle) subtitle.textContent = this.formatFileSize(this.getTotalSize(files));
            if (button) button.textContent = 'Add More Files';
        }
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateUploadList(upload) {
        const { element, config, files } = upload;
        
        const list = element.querySelector('.file-upload-list');
        if (!list) return;
        
        if (files.length === 0) {
            list.innerHTML = '';
            return;
        }
        
        // Update list HTML
        list.innerHTML = files.map((file, index) => {
            const size = this.formatFileSize(file.size);
            const type = this.getFileType(file);
            const icon = this.getFileIcon(file);
            
            return `
                <div class="file-upload-item" data-index="${index}">
                    <div class="file-upload-item-icon">
                        <i data-lucide="${icon}"></i>
                    </div>
                    <div class="file-upload-item-content">
                        <div class="file-upload-item-name">${file.name}</div>
                        <div class="file-upload-item-size">${size} • ${type}</div>
                        <div class="file-upload-item-progress">
                            <div class="file-upload-item-progress-bar" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="file-upload-item-actions">
                        <button class="file-upload-item-action" data-action="remove" title="Remove file">
                            <i data-lucide="x"></i>
                        </button>
                        <button class="file-upload-item-action" data-action="preview" title="Preview file">
                            <i data-lucide="eye"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Add event listeners to new items
        const items = list.querySelectorAll('.file-upload-item');
        items.forEach((item, index) => {
            const actions = item.querySelectorAll('.file-upload-item-action');
            actions.forEach(action => {
                action.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.handleAction(upload, action, index);
                });
            });
        });
        
        // Initialize icons
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    updateUploadState(upload) {
        const { element, config, isUploading, progress, error, success } = upload;
        
        // Update state classes
        element.classList.remove('file-upload-loading', 'file-upload-error', 'file-upload-success');
        
        if (isUploading) {
            element.classList.add('file-upload-loading');
        } else if (error) {
            element.classList.add('file-upload-error');
        } else if (success) {
            element.classList.add('file-upload-success');
        }
        
        // Update progress
        const progressBars = element.querySelectorAll('.file-upload-item-progress-bar');
        progressBars.forEach(bar => {
            bar.style.width = `${progress}%`;
        });
    }

    // Event Handlers
    handleClick(upload) {
        const { element, config } = upload;
        
        if (config.enableDragDrop) {
            const input = element.querySelector('.file-upload-input');
            if (input) {
                input.click();
            }
        }
    }

    handleFileSelect(upload, event) {
        const { config } = upload;
        const files = Array.from(event.target.files);
        
        files.forEach(file => {
            this.addFile(upload.id, file);
        });
        
        // Clear input
        event.target.value = '';
    }

    handleAction(upload, action, index) {
        const { config } = upload;
        const actionType = action.getAttribute('data-action');
        
        switch (actionType) {
            case 'remove':
                this.removeFile(upload.id, index);
                break;
            case 'preview':
                this.previewFile(upload, index);
                break;
        }
    }

    handleResize() {
        this.uploads.forEach((upload) => {
            this.renderUpload(upload);
        });
    }

    handleKeyboardNavigation(e) {
        // Handle global keyboard shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 'u':
                    e.preventDefault();
                    this.focusFirstUpload();
                    break;
            }
        }
    }

    handlePaste(e) {
        // Handle paste events for file uploads
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.kind === 'file') {
                const file = item.getAsFile();
                if (file) {
                    this.addFileToFirstUpload(file);
                }
            }
        }
    }

    focusFirstUpload() {
        const firstUpload = this.uploads.values().next().value;
        if (firstUpload && firstUpload.element) {
            firstUpload.element.focus();
        }
    }

    addFileToFirstUpload(file) {
        const firstUpload = this.uploads.values().next().value;
        if (firstUpload) {
            this.addFile(firstUpload.id, file);
        }
    }

    // Utility Methods
    validateFile(file, config) {
        // Check file size
        if (file.size > config.maxFileSize) {
            this.showError(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(config.maxFileSize)}.`);
            return false;
        }
        
        // Check file type
        if (!this.isFileTypeAllowed(file, config.allowedTypes)) {
            this.showError(`File "${file.name}" is not allowed. Allowed types: ${config.allowedTypes.join(', ')}.`);
            return false;
        }
        
        // Check max files
        if (this.uploads.get(this.currentUploadId)?.files.length >= config.maxFiles) {
            this.showError(`Maximum ${config.maxFiles} files allowed.`);
            return false;
        }
        
        return true;
    }

    isFileTypeAllowed(file, allowedTypes) {
        return allowedTypes.some(type => {
            if (type.endsWith('/*')) {
                return file.type.startsWith(type.slice(0, -1));
            }
            return file.type === type;
        });
    }

    getFileType(file) {
        const type = file.type.split('/')[0];
        return type.charAt(0).toUpperCase() + type.slice(1);
    }

    getFileIcon(file) {
        const type = file.type.split('/')[0];
        switch (type) {
            case 'image': return 'image';
            case 'video': return 'video';
            case 'audio': return 'music';
            case 'application': return 'file-text';
            case 'text': return 'file-text';
            default: return 'file';
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getTotalSize(files) {
        return files.reduce((total, file) => total + file.size, 0);
    }

    previewFile(upload, index) {
        const { config } = upload;
        const file = upload.files[index];
        
        if (file.type.startsWith('image/')) {
            this.previewImage(file);
        } else if (file.type === 'application/pdf') {
            this.previewPDF(file);
        } else {
            this.previewText(file);
        }
    }

    previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showPreview('image', e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    previewPDF(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showPreview('pdf', e.target.result, file.name);
        };
        reader.readAsDataURL(file);
    }

    previewText(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            this.showPreview('text', e.target.result, file.name);
        };
        reader.readAsText(file);
    }

    showPreview(type, content, filename) {
        // Create preview modal
        const modal = document.createElement('div');
        modal.className = 'file-preview-modal';
        modal.innerHTML = `
            <div class="file-preview-content">
                <div class="file-preview-header">
                    <h3>${filename}</h3>
                    <button class="file-preview-close">&times;</button>
                </div>
                <div class="file-preview-body">
                    ${type === 'image' ? `<img src="${content}" alt="${filename}">` : ''}
                    ${type === 'pdf' ? `<iframe src="${content}" width="100%" height="500px"></iframe>` : ''}
                    ${type === 'text' ? `<pre>${content}</pre>` : ''}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeButton = modal.querySelector('.file-preview-close');
        closeButton.addEventListener('click', () => {
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        });
    }

    showError(message) {
        // Create error notification
        const notification = document.createElement('div');
        notification.className = 'file-upload-error-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 5000);
    }

    performUpload(upload) {
        const { config } = upload;
        
        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                
                // Upload complete
                upload.isUploading = false;
                upload.progress = 100;
                upload.success = true;
                
                // Render upload
                this.renderUpload(upload);
                
                // Trigger event
                this.triggerEvent(upload.element, 'file-upload:upload:complete', { 
                    upload: config, 
                    files: upload.files 
                });
            } else {
                upload.progress = progress;
                this.renderUpload(upload);
            }
        }, 100);
    }

    // Feature Initializers
    initializeDragDrop(upload) {
        const { element } = upload;
        
        element.addEventListener('dragover', (e) => {
            e.preventDefault();
            element.classList.add('drag-over');
        });
        
        element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
        });
        
        element.addEventListener('drop', (e) => {
            e.preventDefault();
            element.classList.remove('drag-over');
            
            const files = Array.from(e.dataTransfer.files);
            files.forEach(file => {
                this.addFile(upload.id, file);
            });
        });
    }

    initializeProgress(upload) {
        // Progress initialization
    }

    initializePreview(upload) {
        // Preview initialization
    }

    initializeValidation(upload) {
        // Validation initialization
    }

    initializeAccessibility(upload) {
        // Accessibility initialization
    }

    initializeAnimations(upload) {
        // Animations initialization
    }

    // Utility Methods
    triggerEvent(element, eventName, detail) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        element.dispatchEvent(event);
    }

    // Configuration
    setConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }

    getConfig() {
        return { ...this.config };
    }

    // Cleanup
    destroy() {
        this.uploads.forEach((upload, id) => {
            this.destroyUpload(id);
        });
        this.uploads.clear();
    }

    destroyUpload(id) {
        const upload = this.uploads.get(id);
        if (!upload) return;
        
        // Remove event listeners
        const { element } = upload;
        element.removeEventListener('click', this.handleClick);
        element.removeEventListener('dragover', this.handleDragOver);
        element.removeEventListener('dragleave', this.handleDragLeave);
        element.removeEventListener('drop', this.handleDrop);
        
        // Remove from uploads map
        this.uploads.delete(id);
        
        return this;
    }
}

// Initialize file upload manager
document.addEventListener('DOMContentLoaded', () => {
    window.fileUploadManager = new FileUploadManager();
});

// Global access
window.FileUploadManager = FileUploadManager;
