/**
 * Angkor Compliance Platform - Progress Indicators JavaScript 2025
 * 
 * Progress bars, loading states, and indicators functionality.
 */

class ProgressManager {
    constructor() {
        this.loadingOverlay = null;
        this.loadingBar = null;
        this.init();
    }

    init() {
        this.createLoadingOverlay();
        this.createLoadingBar();
    }

    createLoadingOverlay() {
        this.loadingOverlay = document.createElement('div');
        this.loadingOverlay.className = 'loading-overlay';
        this.loadingOverlay.innerHTML = `
            <div class="loading-card">
                <div class="spinner spinner-lg"></div>
                <p class="loading-text">Loading...</p>
            </div>
        `;
        document.body.appendChild(this.loadingOverlay);
    }

    createLoadingBar() {
        this.loadingBar = document.createElement('div');
        this.loadingBar.className = 'loading-bar';
        this.loadingBar.innerHTML = '<div class="loading-bar-progress"></div>';
        document.body.appendChild(this.loadingBar);
    }

    showLoadingOverlay(text = 'Loading...') {
        if (this.loadingOverlay) {
            this.loadingOverlay.querySelector('.loading-text').textContent = text;
            this.loadingOverlay.classList.add('show');
        }
    }

    hideLoadingOverlay() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('show');
        }
    }

    showLoadingBar() {
        if (this.loadingBar) {
            this.loadingBar.style.display = 'block';
        }
    }

    hideLoadingBar() {
        if (this.loadingBar) {
            this.loadingBar.style.display = 'none';
        }
    }

    updateLoadingBar(progress) {
        if (this.loadingBar) {
            const progressBar = this.loadingBar.querySelector('.loading-bar-progress');
            if (progressBar) {
                progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
            }
        }
    }

    createProgressRing(element, progress, options = {}) {
        const { size = 120, strokeWidth = 8, color = 'var(--primary-500)' } = options;
        const radius = (size - strokeWidth) / 2;
        const circumference = radius * 2 * Math.PI;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (progress / 100) * circumference;

        element.innerHTML = `
            <svg width="${size}" height="${size}">
                <circle class="progress-ring-circle" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}"/>
                <circle class="progress-ring-progress" cx="${size/2}" cy="${size/2}" r="${radius}" stroke-width="${strokeWidth}" 
                        stroke-dasharray="${strokeDasharray}" stroke-dashoffset="${strokeDashoffset}" style="stroke: ${color}"/>
            </svg>
            <div class="progress-ring-text">${Math.round(progress)}%</div>
        `;
    }

    updateProgressBar(element, progress) {
        const progressBar = element.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
        }
    }

    createSkeleton(element, type = 'text') {
        const skeleton = document.createElement('div');
        skeleton.className = `skeleton skeleton-${type}`;
        element.appendChild(skeleton);
        return skeleton;
    }

    removeSkeleton(element) {
        const skeletons = element.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }
}

// Initialize progress manager
document.addEventListener('DOMContentLoaded', () => {
    window.progressManager = new ProgressManager();
});

// Global access
window.ProgressManager = ProgressManager;
