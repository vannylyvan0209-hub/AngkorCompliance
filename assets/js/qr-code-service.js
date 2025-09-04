// QR Code Generation Service for Angkor Compliance Platform
// Integrates with Worker Portal and Grievance System

class QRCodeService {
    constructor() {
        this.db = window.Firebase?.db;
        this.storage = window.Firebase?.storage;
        this.baseUrl = window.location.origin;
        this.qrCodeCache = new Map();
        
        this.initializeQRService();
    }

    async initializeQRService() {
        try {
            // Load QR code library if not already loaded
            await this.loadQRCodeLibrary();
            
            console.log('✅ QR Code Service initialized');
        } catch (error) {
            console.error('❌ Error initializing QR Code Service:', error);
        }
    }

    async loadQRCodeLibrary() {
        if (typeof QRCode === 'undefined') {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
    }

    async generateGrievanceQR(factoryId, department = null, options = {}) {
        try {
            const payload = {
                type: 'grievance',
                factoryId: factoryId,
                department: department,
                timestamp: Date.now(),
                nonce: this.generateNonce(),
                version: '1.0'
            };

            // Add optional parameters
            if (options.language) payload.language = options.language;
            if (options.expires) payload.expires = options.expires;
            if (options.metadata) payload.metadata = options.metadata;

            const url = `${this.baseUrl}/worker-portal.html?data=${encodeURIComponent(JSON.stringify(payload))}`;
            
            // Generate QR code
            const qrCodeDataURL = await this.generateQRCodeDataURL(url, options);
            
            // Store QR code metadata
            await this.storeQRCodeMetadata(payload, url, qrCodeDataURL);
            
            return {
                qrCode: qrCodeDataURL,
                url: url,
                payload: payload,
                caseId: null // Will be generated when grievance is submitted
            };
        } catch (error) {
            console.error('Error generating grievance QR:', error);
            throw new Error('Failed to generate grievance QR code');
        }
    }

    async generateCaseTrackingQR(caseId, options = {}) {
        try {
            const payload = {
                type: 'tracking',
                caseId: caseId,
                timestamp: Date.now(),
                nonce: this.generateNonce(),
                version: '1.0'
            };

            // Add optional parameters
            if (options.language) payload.language = options.language;
            if (options.expires) payload.expires = options.expires;

            const url = `${this.baseUrl}/worker-portal.html?case=${encodeURIComponent(JSON.stringify(payload))}`;
            
            // Generate QR code
            const qrCodeDataURL = await this.generateQRCodeDataURL(url, options);
            
            // Store QR code metadata
            await this.storeQRCodeMetadata(payload, url, qrCodeDataURL);
            
            return {
                qrCode: qrCodeDataURL,
                url: url,
                payload: payload
            };
        } catch (error) {
            console.error('Error generating case tracking QR:', error);
            throw new Error('Failed to generate case tracking QR code');
        }
    }

    async generateFactoryQR(factoryId, options = {}) {
        try {
            const payload = {
                type: 'factory',
                factoryId: factoryId,
                timestamp: Date.now(),
                nonce: this.generateNonce(),
                version: '1.0'
            };

            // Add optional parameters
            if (options.departments) payload.departments = options.departments;
            if (options.language) payload.language = options.language;
            if (options.expires) payload.expires = options.expires;

            const url = `${this.baseUrl}/worker-portal.html?factory=${encodeURIComponent(JSON.stringify(payload))}`;
            
            // Generate QR code
            const qrCodeDataURL = await this.generateQRCodeDataURL(url, options);
            
            // Store QR code metadata
            await this.storeQRCodeMetadata(payload, url, qrCodeDataURL);
            
            return {
                qrCode: qrCodeDataURL,
                url: url,
                payload: payload
            };
        } catch (error) {
            console.error('Error generating factory QR:', error);
            throw new Error('Failed to generate factory QR code');
        }
    }

    async generateQRCodeDataURL(text, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const qr = new QRCode(document.createElement('div'), {
                    text: text,
                    width: options.width || 256,
                    height: options.height || 256,
                    colorDark: options.colorDark || '#000000',
                    colorLight: options.colorLight || '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });

                // Get the canvas element
                const canvas = qr.querySelector('canvas');
                if (canvas) {
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                } else {
                    reject(new Error('Failed to generate QR code canvas'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    async storeQRCodeMetadata(payload, url, qrCodeDataURL) {
        try {
            const metadata = {
                id: this.generateQRId(),
                payload: payload,
                url: url,
                qrCodeDataURL: qrCodeDataURL,
                createdAt: new Date().toISOString(),
                expiresAt: payload.expires ? new Date(payload.expires).toISOString() : null,
                usageCount: 0,
                lastUsed: null
            };

            // Store in database if Firebase is available
            if (this.db) {
                await this.db.collection('qrCodes').doc(metadata.id).set(metadata);
            } else {
                // Store in localStorage as fallback
                const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
                existingQRCodes.push(metadata);
                localStorage.setItem('qrCodes', JSON.stringify(existingQRCodes));
            }

            // Cache the QR code
            this.qrCodeCache.set(metadata.id, metadata);

            return metadata.id;
        } catch (error) {
            console.error('Error storing QR code metadata:', error);
        }
    }

    async trackQRCodeUsage(qrCodeId) {
        try {
            if (this.db) {
                await this.db.collection('qrCodes').doc(qrCodeId).update({
                    usageCount: firebase.firestore.FieldValue.increment(1),
                    lastUsed: new Date().toISOString()
                });
            } else {
                // Update in localStorage
                const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
                const qrCodeIndex = existingQRCodes.findIndex(qr => qr.id === qrCodeId);
                if (qrCodeIndex !== -1) {
                    existingQRCodes[qrCodeIndex].usageCount++;
                    existingQRCodes[qrCodeIndex].lastUsed = new Date().toISOString();
                    localStorage.setItem('qrCodes', JSON.stringify(existingQRCodes));
                }
            }
        } catch (error) {
            console.error('Error tracking QR code usage:', error);
        }
    }

    generateNonce() {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    generateQRId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `QR-${timestamp}-${random}`.toUpperCase();
    }

    async validateQRCode(qrCodeId) {
        try {
            let qrCode = null;

            if (this.db) {
                const doc = await this.db.collection('qrCodes').doc(qrCodeId).get();
                if (doc.exists) {
                    qrCode = doc.data();
                }
            } else {
                const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
                qrCode = existingQRCodes.find(qr => qr.id === qrCodeId);
            }

            if (!qrCode) {
                return { valid: false, reason: 'QR code not found' };
            }

            // Check if QR code has expired
            if (qrCode.expiresAt && new Date() > new Date(qrCode.expiresAt)) {
                return { valid: false, reason: 'QR code has expired' };
            }

            return { valid: true, qrCode: qrCode };
        } catch (error) {
            console.error('Error validating QR code:', error);
            return { valid: false, reason: 'Validation error' };
        }
    }

    async generateQRCodePDF(qrCodes, options = {}) {
        try {
            // This would integrate with a PDF generation library
            // For now, return a simple HTML representation
            const html = this.generateQRCodeHTML(qrCodes, options);
            return html;
        } catch (error) {
            console.error('Error generating QR code PDF:', error);
            throw new Error('Failed to generate QR code PDF');
        }
    }

    generateQRCodeHTML(qrCodes, options = {}) {
        const title = options.title || 'QR Codes - Angkor Compliance';
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>${title}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .qr-container { display: inline-block; margin: 20px; text-align: center; }
                    .qr-code { border: 1px solid #ccc; padding: 10px; }
                    .qr-label { margin-top: 10px; font-size: 12px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>${title}</h1>
                    <p>Generated on ${new Date().toLocaleString()}</p>
                </div>
        `;

        qrCodes.forEach(qrCode => {
            html += `
                <div class="qr-container">
                    <div class="qr-code">
                        <img src="${qrCode.qrCode}" alt="QR Code" width="200" height="200">
                    </div>
                    <div class="qr-label">
                        <strong>${qrCode.payload.type.toUpperCase()}</strong><br>
                        ${qrCode.payload.factoryId ? `Factory: ${qrCode.payload.factoryId}` : ''}
                        ${qrCode.payload.caseId ? `Case: ${qrCode.payload.caseId}` : ''}
                        ${qrCode.payload.department ? `Dept: ${qrCode.payload.department}` : ''}
                    </div>
                </div>
            `;
        });

        html += `
                <div class="footer">
                    <p>Angkor Compliance Platform - QR Code Generation</p>
                </div>
            </body>
            </html>
        `;

        return html;
    }

    async generateBulkQRCodes(factories, options = {}) {
        try {
            const results = [];

            for (const factory of factories) {
                const qrCode = await this.generateFactoryQR(factory.id, {
                    departments: factory.departments,
                    language: options.language,
                    expires: options.expires
                });
                results.push(qrCode);
            }

            return results;
        } catch (error) {
            console.error('Error generating bulk QR codes:', error);
            throw new Error('Failed to generate bulk QR codes');
        }
    }

    async getQRCodeAnalytics(qrCodeId) {
        try {
            let qrCode = null;

            if (this.db) {
                const doc = await this.db.collection('qrCodes').doc(qrCodeId).get();
                if (doc.exists) {
                    qrCode = doc.data();
                }
            } else {
                const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
                qrCode = existingQRCodes.find(qr => qr.id === qrCodeId);
            }

            if (!qrCode) {
                return null;
            }

            return {
                id: qrCode.id,
                type: qrCode.payload.type,
                usageCount: qrCode.usageCount || 0,
                lastUsed: qrCode.lastUsed,
                createdAt: qrCode.createdAt,
                expiresAt: qrCode.expiresAt,
                isExpired: qrCode.expiresAt ? new Date() > new Date(qrCode.expiresAt) : false
            };
        } catch (error) {
            console.error('Error getting QR code analytics:', error);
            return null;
        }
    }

    async deleteQRCode(qrCodeId) {
        try {
            if (this.db) {
                await this.db.collection('qrCodes').doc(qrCodeId).delete();
            } else {
                const existingQRCodes = JSON.parse(localStorage.getItem('qrCodes') || '[]');
                const filteredQRCodes = existingQRCodes.filter(qr => qr.id !== qrCodeId);
                localStorage.setItem('qrCodes', JSON.stringify(filteredQRCodes));
            }

            // Remove from cache
            this.qrCodeCache.delete(qrCodeId);

            return true;
        } catch (error) {
            console.error('Error deleting QR code:', error);
            return false;
        }
    }
}

// Global QR Code Service instance
window.QRCodeService = QRCodeService;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.qrCodeService = new QRCodeService();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QRCodeService;
}
