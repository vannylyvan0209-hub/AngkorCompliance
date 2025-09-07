/**
 * Feedback Collection 2025 - JavaScript
 * User feedback collection system for design system improvements
 */

class FeedbackCollection2025 {
    constructor() {
        this.feedbackData = [];
        this.feedbackTypes = ['bug', 'feature', 'improvement', 'general'];
        this.init();
    }

    init() {
        this.setupFeedbackUI();
        this.bindFeedbackEvents();
        this.loadFeedbackData();
    }

    setupFeedbackUI() {
        const feedbackUI = document.createElement('div');
        feedbackUI.className = 'feedback-collection';
        feedbackUI.innerHTML = `
            <div class="feedback-header">
                <h3>Design System Feedback</h3>
                <div class="feedback-controls">
                    <button class="btn btn-primary" id="openFeedbackForm">Give Feedback</button>
                    <button class="btn btn-secondary" id="viewFeedback">View Feedback</button>
                    <button class="btn btn-secondary" id="exportFeedback">Export</button>
                </div>
            </div>
            <div class="feedback-content" id="feedbackContent">
                <div class="feedback-stats">
                    <div class="stat-card">
                        <h4>Total Feedback</h4>
                        <div class="stat-value" id="totalFeedback">0</div>
                    </div>
                    <div class="stat-card">
                        <h4>This Month</h4>
                        <div class="stat-value" id="monthlyFeedback">0</div>
                    </div>
                    <div class="stat-card">
                        <h4>Avg Rating</h4>
                        <div class="stat-value" id="avgRating">0.0</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(feedbackUI);
    }

    bindFeedbackEvents() {
        document.getElementById('openFeedbackForm').addEventListener('click', () => {
            this.openFeedbackForm();
        });

        document.getElementById('viewFeedback').addEventListener('click', () => {
            this.viewFeedback();
        });

        document.getElementById('exportFeedback').addEventListener('click', () => {
            this.exportFeedback();
        });
    }

    openFeedbackForm() {
        const form = document.createElement('div');
        form.className = 'feedback-form-modal';
        form.innerHTML = `
            <div class="feedback-form-overlay">
                <div class="feedback-form">
                    <div class="feedback-form-header">
                        <h3>Share Your Feedback</h3>
                        <button class="btn btn-ghost" id="closeFeedbackForm">×</button>
                    </div>
                    <form id="feedbackForm">
                        <div class="form-group">
                            <label for="feedbackType">Type of Feedback</label>
                            <select id="feedbackType" required>
                                <option value="">Select type...</option>
                                <option value="bug">Bug Report</option>
                                <option value="feature">Feature Request</option>
                                <option value="improvement">Improvement</option>
                                <option value="general">General Feedback</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="feedbackTitle">Title</label>
                            <input type="text" id="feedbackTitle" required placeholder="Brief description of your feedback">
                        </div>
                        <div class="form-group">
                            <label for="feedbackDescription">Description</label>
                            <textarea id="feedbackDescription" required placeholder="Please provide detailed information about your feedback"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="feedbackRating">Rating (1-5)</label>
                            <div class="rating-input">
                                <input type="range" id="feedbackRating" min="1" max="5" value="3">
                                <div class="rating-display" id="ratingDisplay">3</div>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="feedbackEmail">Email (optional)</label>
                            <input type="email" id="feedbackEmail" placeholder="your@email.com">
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" id="cancelFeedback">Cancel</button>
                            <button type="submit" class="btn btn-primary">Submit Feedback</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        document.body.appendChild(form);
        this.bindFormEvents();
    }

    bindFormEvents() {
        document.getElementById('closeFeedbackForm').addEventListener('click', () => {
            this.closeFeedbackForm();
        });

        document.getElementById('cancelFeedback').addEventListener('click', () => {
            this.closeFeedbackForm();
        });

        document.getElementById('feedbackForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitFeedback();
        });

        document.getElementById('feedbackRating').addEventListener('input', (e) => {
            document.getElementById('ratingDisplay').textContent = e.target.value;
        });
    }

    closeFeedbackForm() {
        const form = document.querySelector('.feedback-form-modal');
        if (form) {
            form.remove();
        }
    }

    submitFeedback() {
        const formData = {
            type: document.getElementById('feedbackType').value,
            title: document.getElementById('feedbackTitle').value,
            description: document.getElementById('feedbackDescription').value,
            rating: parseInt(document.getElementById('feedbackRating').value),
            email: document.getElementById('feedbackEmail').value,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        this.feedbackData.push(formData);
        this.saveFeedbackData();
        this.updateStats();
        this.closeFeedbackForm();
        this.showSuccessMessage();
    }

    showSuccessMessage() {
        const message = document.createElement('div');
        message.className = 'feedback-success-message';
        message.innerHTML = `
            <div class="success-content">
                <div class="success-icon">✓</div>
                <div class="success-text">Thank you for your feedback!</div>
            </div>
        `;
        
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    viewFeedback() {
        const content = document.getElementById('feedbackContent');
        if (!content) return;

        content.innerHTML = `
            <div class="feedback-list">
                <div class="feedback-list-header">
                    <h4>Recent Feedback</h4>
                    <div class="feedback-filters">
                        <select id="feedbackFilter">
                            <option value="all">All Types</option>
                            <option value="bug">Bug Reports</option>
                            <option value="feature">Feature Requests</option>
                            <option value="improvement">Improvements</option>
                            <option value="general">General</option>
                        </select>
                    </div>
                </div>
                <div class="feedback-items" id="feedbackItems"></div>
            </div>
        `;

        this.displayFeedbackItems();
        this.bindFilterEvents();
    }

    displayFeedbackItems(filter = 'all') {
        const items = document.getElementById('feedbackItems');
        if (!items) return;

        const filteredData = filter === 'all' 
            ? this.feedbackData 
            : this.feedbackData.filter(item => item.type === filter);

        items.innerHTML = filteredData.map(item => `
            <div class="feedback-item">
                <div class="feedback-item-header">
                    <div class="feedback-type ${item.type}">${item.type}</div>
                    <div class="feedback-rating">${'★'.repeat(item.rating)}${'☆'.repeat(5 - item.rating)}</div>
                    <div class="feedback-date">${new Date(item.timestamp).toLocaleDateString()}</div>
                </div>
                <div class="feedback-item-content">
                    <h5>${item.title}</h5>
                    <p>${item.description}</p>
                </div>
            </div>
        `).join('');
    }

    bindFilterEvents() {
        const filter = document.getElementById('feedbackFilter');
        if (filter) {
            filter.addEventListener('change', (e) => {
                this.displayFeedbackItems(e.target.value);
            });
        }
    }

    updateStats() {
        const total = this.feedbackData.length;
        const thisMonth = this.feedbackData.filter(item => {
            const itemDate = new Date(item.timestamp);
            const now = new Date();
            return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
        }).length;
        
        const avgRating = this.feedbackData.length > 0 
            ? (this.feedbackData.reduce((sum, item) => sum + item.rating, 0) / this.feedbackData.length).toFixed(1)
            : 0;

        const totalElement = document.getElementById('totalFeedback');
        const monthlyElement = document.getElementById('monthlyFeedback');
        const ratingElement = document.getElementById('avgRating');

        if (totalElement) totalElement.textContent = total;
        if (monthlyElement) monthlyElement.textContent = thisMonth;
        if (ratingElement) ratingElement.textContent = avgRating;
    }

    loadFeedbackData() {
        const saved = localStorage.getItem('design-system-feedback');
        if (saved) {
            this.feedbackData = JSON.parse(saved);
        }
        this.updateStats();
    }

    saveFeedbackData() {
        localStorage.setItem('design-system-feedback', JSON.stringify(this.feedbackData));
    }

    exportFeedback() {
        const dataStr = JSON.stringify(this.feedbackData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `design-system-feedback-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
    }

    // Public API methods
    getFeedbackData() {
        return this.feedbackData;
    }

    addFeedback(type, title, description, rating, email = '') {
        const feedback = {
            type,
            title,
            description,
            rating,
            email,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.feedbackData.push(feedback);
        this.saveFeedbackData();
        this.updateStats();
    }
}

// Initialize feedback collection
document.addEventListener('DOMContentLoaded', () => {
    window.feedbackCollection = new FeedbackCollection2025();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedbackCollection2025;
}
