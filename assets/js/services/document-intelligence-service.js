/**
 * 📄 Document Intelligence Service
 * 
 * AI-powered document processing and intelligence for the Angkor Compliance Platform.
 * Handles OCR, intelligent extraction, document classification, and evidence linking.
 * 
 * @author Angkor Compliance Team
 * @version 2.0.0
 */

import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    updateDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    serverTimestamp,
    writeBatch
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL, 
    deleteObject,
    listAll
} from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js';

class DocumentIntelligenceService {
    constructor() {
        this.db = getFirestore();
        this.storage = getStorage();
        this.processingQueue = new Map();
        this.supportedFormats = [
            'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
            'jpg', 'jpeg', 'png', 'tiff', 'bmp', 'gif'
        ];
        
        // Document categories for compliance
        this.documentCategories = {
            'reports': ['audit_reports', 'inspection_reports', 'incident_reports', 'compliance_reports'],
            'permits': ['environmental_permits', 'safety_permits', 'operating_permits', 'certifications'],
            'policies': ['safety_policies', 'hr_policies', 'environmental_policies', 'quality_policies'],
            'procedures': ['sop_documents', 'work_instructions', 'emergency_procedures', 'maintenance_procedures'],
            'certificates': ['training_certificates', 'compliance_certificates', 'audit_certificates'],
            'forms': ['incident_forms', 'inspection_forms', 'training_forms', 'audit_forms']
        };
        
        // Compliance standards mapping
        this.complianceStandards = {
            'smeta': 'SMETA (Sedex Members Ethical Trade Audit)',
            'sa8000': 'SA8000 Social Accountability',
            'iso9001': 'ISO 9001 Quality Management',
            'iso14001': 'ISO 14001 Environmental Management',
            'iso45001': 'ISO 45001 Occupational Health & Safety',
            'higg': 'Higg Index (Sustainable Apparel Coalition)',
            'slcp': 'Social & Labor Convergence Program',
            'primark': 'Primark Ethical Trade Program',
            'gap': 'GAP Inc. Vendor Compliance',
            'hm': 'H&M Sustainability Assessment'
        };
        
        console.log('📄 Document Intelligence Service initialized');
    }

    /**
     * 🔍 Analyze document and extract intelligence
     * @param {File} file - Document file to analyze
     * @param {Object} metadata - Additional document metadata
     * @returns {Promise<Object>} Document analysis results
     */
    async analyzeDocument(file, metadata = {}) {
        try {
            console.log('🔍 Starting document analysis:', file.name);
            
            // Validate file format
            if (!this.isSupportedFormat(file)) {
                throw new Error(`Unsupported file format: ${file.type}`);
            }

            // Generate unique document ID
            const documentId = this.generateDocumentId();
            
            // Upload file to storage
            const storageRef = await this.uploadDocument(file, documentId);
            
            // Create document record
            const documentData = {
                id: documentId,
                filename: file.name,
                originalName: file.name,
                fileSize: file.size,
                mimeType: file.type,
                storagePath: storageRef.fullPath,
                downloadURL: storageRef.downloadURL,
                status: 'processing',
                category: 'unknown',
                confidence: 0,
                extractedData: {},
                metadata: {
                    ...metadata,
                    uploadedAt: serverTimestamp(),
                    uploadedBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                    factoryId: metadata.factoryId || 'unknown',
                    organizationId: metadata.organizationId || 'unknown'
                },
                aiAnalysis: {
                    ocrText: '',
                    extractedEntities: [],
                    complianceMapping: [],
                    riskScore: 0,
                    confidence: 0,
                    processingTime: 0
                },
                version: 1,
                isActive: true
            };

            // Save to Firestore
            const docRef = await addDoc(collection(this.db, 'documents'), documentData);
            console.log('📄 Document saved to Firestore:', docRef.id);

            // Process document with AI
            const analysisResult = await this.processDocumentWithAI(documentId, file);
            
            // Update document with analysis results
            await this.updateDocumentAnalysis(documentId, analysisResult);
            
            console.log('✅ Document analysis completed:', documentId);
            return {
                documentId,
                analysis: analysisResult,
                status: 'completed'
            };

        } catch (error) {
            console.error('❌ Document analysis failed:', error);
            throw error;
        }
    }

    /**
     * 🤖 Process document with AI intelligence
     * @param {string} documentId - Document ID to process
     * @param {File} file - Original file for processing
     * @returns {Promise<Object>} AI processing results
     */
    async processDocumentWithAI(documentId, file) {
        const startTime = Date.now();
        
        try {
            console.log('🤖 Starting AI processing for document:', documentId);
            
            // Simulate AI processing steps
            const results = {
                ocrText: await this.performOCR(file),
                extractedEntities: await this.extractEntities(file),
                complianceMapping: await this.mapComplianceStandards(file),
                riskScore: await this.calculateRiskScore(file),
                confidence: await this.calculateConfidence(file),
                processingTime: Date.now() - startTime
            };

            // Add processing delay for realistic simulation
            await this.simulateProcessingDelay(2000);
            
            console.log('🤖 AI processing completed:', results);
            return results;

        } catch (error) {
            console.error('❌ AI processing failed:', error);
            throw error;
        }
    }

    /**
     * 📝 Perform OCR on document
     * @param {File} file - File to process
     * @returns {Promise<string>} Extracted text
     */
    async performOCR(file) {
        // Simulate OCR processing
        const mockTexts = {
            'pdf': 'This is a simulated PDF document containing compliance information for factory operations...',
            'doc': 'Document contains safety procedures and compliance requirements for workers...',
            'jpg': 'Image shows safety equipment and compliance signage in factory environment...',
            'xlsx': 'Spreadsheet contains audit results, compliance metrics, and action items...'
        };

        const fileType = file.type.split('/')[1] || 'pdf';
        const mockText = mockTexts[fileType] || 'Document contains compliance-related information...';
        
        return mockText;
    }

    /**
     * 🏷️ Extract entities from document
     * @param {File} file - File to process
     * @returns {Promise<Array>} Extracted entities
     */
    async extractEntities(file) {
        // Simulate entity extraction
        const entities = [
            {
                type: 'organization',
                value: 'Angkor Factory',
                confidence: 0.95,
                position: { page: 1, x: 100, y: 200 }
            },
            {
                type: 'date',
                value: '2024-01-15',
                confidence: 0.98,
                position: { page: 1, x: 300, y: 150 }
            },
            {
                type: 'compliance_standard',
                value: 'SMETA',
                confidence: 0.92,
                position: { page: 1, x: 150, y: 300 }
            },
            {
                type: 'risk_level',
                value: 'Medium',
                confidence: 0.87,
                position: { page: 1, x: 400, y: 250 }
            }
        ];

        return entities;
    }

    /**
     * 🎯 Map compliance standards
     * @param {File} file - File to process
     * @returns {Promise<Array>} Compliance mappings
     */
    async mapComplianceStandards(file) {
        // Simulate compliance mapping
        const mappings = [
            {
                standard: 'SMETA',
                requirements: ['ET1', 'ET2', 'ET3'],
                coverage: 0.85,
                confidence: 0.90
            },
            {
                standard: 'SA8000',
                requirements: ['SA1', 'SA2'],
                coverage: 0.70,
                confidence: 0.85
            }
        ];

        return mappings;
    }

    /**
     * ⚠️ Calculate risk score
     * @param {File} file - File to process
     * @returns {Promise<number>} Risk score (0-100)
     */
    async calculateRiskScore(file) {
        // Simulate risk calculation
        const baseScore = Math.floor(Math.random() * 40) + 20; // 20-60
        const fileTypeBonus = file.type.includes('pdf') ? 10 : 0;
        const sizeBonus = file.size > 1000000 ? 15 : 0;
        
        return Math.min(100, baseScore + fileTypeBonus + sizeBonus);
    }

    /**
     * 🎯 Calculate confidence score
     * @param {File} file - File to process
     * @returns {Promise<number>} Confidence score (0-1)
     */
    async calculateConfidence(file) {
        // Simulate confidence calculation
        const baseConfidence = 0.7;
        const fileTypeBonus = file.type.includes('pdf') ? 0.15 : 0;
        const sizeBonus = file.size < 5000000 ? 0.1 : 0;
        
        return Math.min(1, baseConfidence + fileTypeBonus + sizeBonus);
    }

    /**
     * 📤 Upload document to storage
     * @param {File} file - File to upload
     * @param {string} documentId - Unique document ID
     * @returns {Promise<Object>} Storage reference and URL
     */
    async uploadDocument(file, documentId) {
        try {
            const storageRef = ref(this.storage, `documents/${documentId}/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            
            return {
                fullPath: snapshot.ref.fullPath,
                downloadURL,
                size: snapshot.metadata.size
            };
        } catch (error) {
            console.error('❌ Document upload failed:', error);
            throw error;
        }
    }

    /**
     * 🔄 Update document analysis results
     * @param {string} documentId - Document ID to update
     * @param {Object} analysis - Analysis results
     */
    async updateDocumentAnalysis(documentId, analysis) {
        try {
            const docRef = doc(this.db, 'documents', documentId);
            await updateDoc(docRef, {
                'aiAnalysis': analysis,
                'status': 'completed',
                'metadata.updatedAt': serverTimestamp(),
                'metadata.lastProcessedBy': 'ai_service'
            });
            
            console.log('✅ Document analysis updated:', documentId);
        } catch (error) {
            console.error('❌ Failed to update document analysis:', error);
            throw error;
        }
    }

    /**
     * 📋 Get documents by category
     * @param {string} category - Document category
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Documents in category
     */
    async getDocumentsByCategory(category, options = {}) {
        try {
            const { factoryId, limit: limitCount = 50, orderBy: orderByField = 'metadata.uploadedAt' } = options;
            
            let q = query(
                collection(this.db, 'documents'),
                where('category', '==', category),
                where('isActive', '==', true),
                orderBy(orderByField, 'desc'),
                limit(limitCount)
            );

            if (factoryId) {
                q = query(q, where('metadata.factoryId', '==', factoryId));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
        } catch (error) {
            console.error('❌ Failed to get documents by category:', error);
            throw error;
        }
    }

    /**
     * 🔍 Search documents by content
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Array>} Search results
     */
    async searchDocuments(query, options = {}) {
        try {
            const { factoryId, category, limit: limitCount = 20 } = options;
            
            // Simple text search simulation
            // In production, this would use Firebase Algolia or similar search service
            let q = query(
                collection(this.db, 'documents'),
                where('isActive', '==', true),
                limit(limitCount)
            );

            if (factoryId) {
                q = query(q, where('metadata.factoryId', '==', factoryId));
            }

            if (category) {
                q = query(q, where('category', '==', category));
            }

            const snapshot = await getDocs(q);
            const documents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Simulate search filtering
            return documents.filter(doc => 
                doc.filename.toLowerCase().includes(query.toLowerCase()) ||
                doc.aiAnalysis?.ocrText?.toLowerCase().includes(query.toLowerCase()) ||
                doc.category.toLowerCase().includes(query.toLowerCase())
            );
            
        } catch (error) {
            console.error('❌ Document search failed:', error);
            throw error;
        }
    }

    /**
     * 📊 Get document statistics
     * @param {string} factoryId - Factory ID for filtering
     * @returns {Promise<Object>} Document statistics
     */
    async getDocumentStatistics(factoryId = null) {
        try {
            let q = query(collection(this.db, 'documents'), where('isActive', '==', true));
            
            if (factoryId) {
                q = query(q, where('metadata.factoryId', '==', factoryId));
            }

            const snapshot = await getDocs(q);
            const documents = snapshot.docs.map(doc => doc.data());
            
            const stats = {
                total: documents.length,
                byCategory: {},
                byStatus: {},
                byType: {},
                averageSize: 0,
                totalSize: 0
            };

            documents.forEach(doc => {
                // Category stats
                stats.byCategory[doc.category] = (stats.byCategory[doc.category] || 0) + 1;
                
                // Status stats
                stats.byStatus[doc.status] = (stats.byStatus[doc.status] || 0) + 1;
                
                // Type stats
                const fileType = doc.mimeType.split('/')[1] || 'unknown';
                stats.byType[fileType] = (stats.byType[fileType] || 0) + 1;
                
                // Size stats
                stats.totalSize += doc.fileSize || 0;
            });

            stats.averageSize = stats.total > 0 ? stats.totalSize / stats.total : 0;
            
            return stats;
            
        } catch (error) {
            console.error('❌ Failed to get document statistics:', error);
            throw error;
        }
    }

    /**
     * 🔗 Link document to compliance requirements
     * @param {string} documentId - Document ID
     * @param {Array} requirements - Array of requirement IDs
     * @returns {Promise<boolean>} Success status
     */
    async linkToRequirements(documentId, requirements) {
        try {
            const docRef = doc(this.db, 'documents', documentId);
            await updateDoc(docRef, {
                'complianceLinks': requirements,
                'metadata.updatedAt': serverTimestamp(),
                'metadata.lastLinkedBy': window.authService?.getCurrentUser()?.uid || 'unknown'
            });
            
            console.log('✅ Document linked to requirements:', documentId);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to link document to requirements:', error);
            throw error;
        }
    }

    /**
     * 🗑️ Delete document
     * @param {string} documentId - Document ID to delete
     * @returns {Promise<boolean>} Success status
     */
    async deleteDocument(documentId) {
        try {
            // Get document data first
            const docRef = doc(this.db, 'documents', documentId);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                throw new Error('Document not found');
            }

            const documentData = docSnap.data();
            
            // Delete from storage
            if (documentData.storagePath) {
                const storageRef = ref(this.storage, documentData.storagePath);
                await deleteObject(storageRef);
            }
            
            // Mark as deleted in Firestore
            await updateDoc(docRef, {
                'isActive': false,
                'metadata.deletedAt': serverTimestamp(),
                'metadata.deletedBy': window.authService?.getCurrentUser()?.uid || 'unknown'
            });
            
            console.log('✅ Document deleted:', documentId);
            return true;
            
        } catch (error) {
            console.error('❌ Failed to delete document:', error);
            throw error;
        }
    }

    /**
     * 🔄 Create document version
     * @param {string} documentId - Original document ID
     * @param {File} newFile - New version file
     * @returns {Promise<string>} New version ID
     */
    async createVersion(documentId, newFile) {
        try {
            // Get original document
            const originalDoc = await getDoc(doc(this.db, 'documents', documentId));
            if (!originalDoc.exists()) {
                throw new Error('Original document not found');
            }

            const originalData = originalDoc.data();
            
            // Create new version
            const versionId = this.generateDocumentId();
            const storageRef = await this.uploadDocument(newFile, versionId);
            
            const versionData = {
                ...originalData,
                id: versionId,
                filename: newFile.name,
                originalName: newFile.name,
                fileSize: newFile.size,
                mimeType: newFile.mimeType,
                storagePath: storageRef.fullPath,
                downloadURL: storageRef.downloadURL,
                version: (originalData.version || 1) + 1,
                parentDocumentId: documentId,
                metadata: {
                    ...originalData.metadata,
                    uploadedAt: serverTimestamp(),
                    uploadedBy: window.authService?.getCurrentUser()?.uid || 'unknown',
                    isVersion: true,
                    originalDocumentId: documentId
                }
            };

            // Save new version
            const versionRef = await addDoc(collection(this.db, 'documents'), versionData);
            
            // Update original document with version reference
            await updateDoc(doc(this.db, 'documents', documentId), {
                'versions': [...(originalData.versions || []), versionId],
                'metadata.updatedAt': serverTimestamp()
            });
            
            console.log('✅ Document version created:', versionId);
            return versionId;
            
        } catch (error) {
            console.error('❌ Failed to create document version:', error);
            throw error;
        }
    }

    // Utility methods
    isSupportedFormat(file) {
        const extension = file.name.split('.').pop().toLowerCase();
        return this.supportedFormats.includes(extension);
    }

    generateDocumentId() {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    async simulateProcessingDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 📋 Get document categories
     * @returns {Object} Available document categories
     */
    getDocumentCategories() {
        return this.documentCategories;
    }

    /**
     * 🎯 Get compliance standards
     * @returns {Object} Available compliance standards
     */
    getComplianceStandards() {
        return this.complianceStandards;
    }

    /**
     * 🔍 Get processing status
     * @param {string} documentId - Document ID
     * @returns {string} Processing status
     */
    getProcessingStatus(documentId) {
        return this.processingQueue.get(documentId) || 'unknown';
    }
}

// Export service
export default DocumentIntelligenceService;

// Global instance for backward compatibility
if (typeof window !== 'undefined') {
    window.documentIntelligenceService = new DocumentIntelligenceService();
}
