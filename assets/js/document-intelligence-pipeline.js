/**
 * Document Intelligence Pipeline
 * Implements OCR → Layout analysis → Entity extraction → Validation → Indexing
 * As specified in Enterprise Blueprint v2 Section D.3
 */

class DocumentIntelligencePipeline {
    constructor() {
        this.db = window.Firebase?.db;
        this.storage = window.Firebase?.storage;
        this.openAI = window.OpenAI;
        this.standardsRegistry = window.standardsRegistry;
        this.isProcessing = false;
        this.supportedFormats = ['pdf', 'jpg', 'jpeg', 'png', 'tiff', 'docx'];
    }

    /**
     * Main document processing pipeline
     */
    async processDocument(file, metadata = {}) {
        try {
            this.isProcessing = true;
            console.log('🚀 Starting document processing pipeline...');

            // Step 1: Validate and prepare document
            const validation = await this.validateDocument(file);
            if (!validation.isValid) {
                throw new Error(`Document validation failed: ${validation.error}`);
            }

            // Step 2: Upload to storage
            const storagePath = await this.uploadToStorage(file, metadata);

            // Step 3: OCR Processing
            const ocrResult = await this.performOCR(file);

            // Step 4: Layout Analysis
            const layoutAnalysis = await this.analyzeLayout(ocrResult);

            // Step 5: AI Entity Extraction
            const entities = await this.extractEntities(layoutAnalysis, metadata);

            // Step 6: Validate extracted data
            const validatedData = await this.validateEntities(entities);

            // Step 7: Create document record
            const documentRecord = await this.createDocumentRecord({
                file,
                storagePath,
                ocrResult,
                layoutAnalysis,
                entities: validatedData,
                metadata
            });

            // Step 8: Index document for search
            await this.indexDocument(documentRecord);

            // Step 9: Link to related documents and standards
            const links = await this.linkDocument(documentRecord);

            console.log('✅ Document processing completed successfully');
            return {
                success: true,
                documentId: documentRecord.id,
                entities: validatedData,
                links: links,
                confidence: ocrResult.confidence
            };

        } catch (error) {
            console.error('❌ Document processing failed:', error);
            throw error;
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * Validate document before processing
     */
    async validateDocument(file) {
        const maxSize = 50 * 1024 * 1024; // 50MB
        const extension = file.name.split('.').pop().toLowerCase();

        if (file.size > maxSize) {
            return { isValid: false, error: 'File size exceeds 50MB limit' };
        }

        if (!this.supportedFormats.includes(extension)) {
            return { isValid: false, error: `Unsupported file format: ${extension}` };
        }

        return { isValid: true };
    }

    /**
     * Upload document to Firebase Storage
     */
    async uploadToStorage(file, metadata) {
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storagePath = `documents/${metadata.factoryId || 'general'}/${fileName}`;

        const storageRef = this.storage.ref(storagePath);
        await storageRef.put(file);

        return storagePath;
    }

    /**
     * Perform OCR on document
     */
    async performOCR(file) {
        console.log('📄 Performing OCR...');

        // For now, use a simplified OCR approach
        // In production, integrate with Tesseract.js or cloud OCR services
        const ocrResult = {
            text: await this.extractTextFromFile(file),
            confidence: 0.85,
            language: 'en',
            pages: 1
        };

        return ocrResult;
    }

    /**
     * Extract text from file (simplified)
     */
    async extractTextFromFile(file) {
        // This is a placeholder - in production, use proper OCR
        return `Sample extracted text from ${file.name}. This would contain the actual OCR result.`;
    }

    /**
     * Analyze document layout
     */
    async analyzeLayout(ocrResult) {
        console.log('🔍 Analyzing document layout...');

        // Analyze structure, headers, tables, etc.
        const layout = {
            sections: this.identifySections(ocrResult.text),
            headers: this.extractHeaders(ocrResult.text),
            tables: this.extractTables(ocrResult.text),
            lists: this.extractLists(ocrResult.text)
        };

        return layout;
    }

    /**
     * Extract entities using AI
     */
    async extractEntities(layoutAnalysis, metadata) {
        console.log('🤖 Extracting entities with AI...');

        const prompt = this.buildEntityExtractionPrompt(layoutAnalysis, metadata);
        
        try {
            const response = await this.openAI.makeServerRequest('extractEntities', {
                prompt: prompt,
                document: layoutAnalysis,
                entityTypes: ['requirements', 'dates', 'owners', 'costs', 'deadlines', 'standards', 'nonConformities']
            });

            return this.normalizeEntities(response.entities);
        } catch (error) {
            console.warn('⚠️ AI extraction failed, using fallback:', error);
            return this.fallbackEntityExtraction(layoutAnalysis);
        }
    }

    /**
     * Build prompt for entity extraction
     */
    buildEntityExtractionPrompt(layoutAnalysis, metadata) {
        return `
        Extract compliance-related entities from this document:
        
        Document Type: ${metadata.category || 'Unknown'}
        Factory: ${metadata.factoryId || 'Unknown'}
        
        Content:
        ${JSON.stringify(layoutAnalysis, null, 2)}
        
        Extract the following entities:
        - Requirements: Compliance requirements mentioned
        - Dates: Important dates, deadlines, expiry dates
        - Owners: Responsible persons or departments
        - Costs: Financial amounts or budget items
        - Deadlines: Time-sensitive items
        - Standards: Compliance standards referenced
        - NonConformities: Issues or violations mentioned
        
        Return as structured JSON with confidence scores.
        `;
    }

    /**
     * Normalize extracted entities
     */
    normalizeEntities(entities) {
        const normalized = {
            requirements: [],
            dates: [],
            owners: [],
            costs: [],
            deadlines: [],
            standards: [],
            nonConformities: []
        };

        for (const [type, items] of Object.entries(entities)) {
            if (normalized[type]) {
                normalized[type] = items.map(item => ({
                    text: item.text || item,
                    confidence: item.confidence || 0.8,
                    source: item.source || 'ai_extraction',
                    normalized: this.normalizeEntityText(item.text || item, type)
                }));
            }
        }

        return normalized;
    }

    /**
     * Fallback entity extraction
     */
    fallbackEntityExtraction(layoutAnalysis) {
        // Simple regex-based extraction as fallback
        const text = JSON.stringify(layoutAnalysis);
        
        return {
            requirements: this.extractRequirements(text),
            dates: this.extractDates(text),
            owners: this.extractOwners(text),
            costs: this.extractCosts(text),
            deadlines: this.extractDeadlines(text),
            standards: this.extractStandards(text),
            nonConformities: this.extractNonConformities(text)
        };
    }

    /**
     * Validate extracted entities
     */
    async validateEntities(entities) {
        console.log('✅ Validating extracted entities...');

        const validated = {};

        for (const [type, items] of Object.entries(entities)) {
            validated[type] = items.filter(item => {
                // Basic validation rules
                if (type === 'dates') {
                    return this.isValidDate(item.text);
                }
                if (type === 'costs') {
                    return this.isValidCost(item.text);
                }
                return item.confidence > 0.5; // Minimum confidence threshold
            });
        }

        return validated;
    }

    /**
     * Create document record in Firestore
     */
    async createDocumentRecord(data) {
        const documentRecord = {
            id: this.generateDocumentId(),
            fileName: data.file.name,
            fileSize: data.file.size,
            fileType: data.file.type,
            storagePath: data.storagePath,
            ocrResult: data.ocrResult,
            layoutAnalysis: data.layoutAnalysis,
            entities: data.entities,
            metadata: data.metadata,
            status: 'processed',
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: window.currentUser?.id || 'system',
            factoryId: data.metadata.factoryId || null,
            confidence: data.ocrResult.confidence
        };

        await this.db.collection('documents').doc(documentRecord.id).set(documentRecord);
        return documentRecord;
    }

    /**
     * Index document for search
     */
    async indexDocument(documentRecord) {
        console.log('🔍 Indexing document for search...');

        // Index for full-text search
        const searchIndex = {
            documentId: documentRecord.id,
            content: this.buildSearchContent(documentRecord),
            entities: this.flattenEntities(documentRecord.entities),
            metadata: documentRecord.metadata,
            indexedAt: new Date()
        };

        await this.db.collection('document_search_index').doc(documentRecord.id).set(searchIndex);

        // Add to vector index if RAG enhancement is available
        if (window.RAGEnhancement) {
            await window.RAGEnhancement.vectorIndex.addDocument({
                id: documentRecord.id,
                content: searchIndex.content,
                metadata: {
                    type: 'document',
                    category: documentRecord.metadata.category,
                    factoryId: documentRecord.factoryId
                }
            });
        }
    }

    /**
     * Link document to related items
     */
    async linkDocument(documentRecord) {
        console.log('🔗 Linking document to related items...');

        const links = {
            standards: [],
            requirements: [],
            relatedDocuments: [],
            audits: [],
            caps: []
        };

        // Link to standards
        if (documentRecord.entities.standards) {
            for (const standard of documentRecord.entities.standards) {
                const matchingStandards = await this.findMatchingStandards(standard.text);
                links.standards.push(...matchingStandards);
            }
        }

        // Link to requirements
        if (documentRecord.entities.requirements) {
            for (const requirement of documentRecord.entities.requirements) {
                const matchingRequirements = await this.findMatchingRequirements(requirement.text);
                links.requirements.push(...matchingRequirements);
            }
        }

        // Create graph connections
        await this.createGraphConnections(documentRecord.id, links);

        return links;
    }

    /**
     * Build search content from document
     */
    buildSearchContent(documentRecord) {
        const content = [
            documentRecord.ocrResult.text,
            ...Object.values(documentRecord.entities).flat().map(e => e.text)
        ].join(' ');

        return content.toLowerCase();
    }

    /**
     * Flatten entities for search indexing
     */
    flattenEntities(entities) {
        const flattened = [];
        for (const [type, items] of Object.entries(entities)) {
            for (const item of items) {
                flattened.push({
                    type: type,
                    text: item.text,
                    confidence: item.confidence,
                    normalized: item.normalized
                });
            }
        }
        return flattened;
    }

    /**
     * Find matching standards
     */
    async findMatchingStandards(standardText) {
        if (!this.standardsRegistry) return [];

        const standards = await this.standardsRegistry.getStandards();
        return standards.filter(standard => 
            standard.name.toLowerCase().includes(standardText.toLowerCase()) ||
            standard.nameKhmer.includes(standardText)
        );
    }

    /**
     * Find matching requirements
     */
    async findMatchingRequirements(requirementText) {
        if (!this.standardsRegistry) return [];

        const requirements = await this.standardsRegistry.getAllRequirements();
        return requirements.filter(req => 
            req.title.toLowerCase().includes(requirementText.toLowerCase()) ||
            req.titleKhmer.includes(requirementText)
        );
    }

    /**
     * Create graph connections
     */
    async createGraphConnections(documentId, links) {
        const connections = [];

        // Document to Standards connections
        for (const standard of links.standards) {
            connections.push({
                sourceId: documentId,
                sourceType: 'document',
                targetId: standard.id,
                targetType: 'standard',
                relationship: 'references',
                createdAt: new Date()
            });
        }

        // Document to Requirements connections
        for (const requirement of links.requirements) {
            connections.push({
                sourceId: documentId,
                sourceType: 'document',
                targetId: requirement.id,
                targetType: 'requirement',
                relationship: 'evidence_for',
                createdAt: new Date()
            });
        }

        // Save connections to Firestore
        for (const connection of connections) {
            await this.db.collection('document_graph').add(connection);
        }
    }

    // Utility methods for entity extraction
    identifySections(text) {
        // Identify document sections based on headers
        const sections = [];
        const lines = text.split('\n');
        let currentSection = { title: 'Introduction', content: [] };

        for (const line of lines) {
            if (line.match(/^[A-Z][A-Z\s]+$/)) {
                if (currentSection.content.length > 0) {
                    sections.push(currentSection);
                }
                currentSection = { title: line.trim(), content: [] };
            } else {
                currentSection.content.push(line);
            }
        }

        if (currentSection.content.length > 0) {
            sections.push(currentSection);
        }

        return sections;
    }

    extractHeaders(text) {
        return text.match(/^[A-Z][A-Z\s]+$/gm) || [];
    }

    extractTables(text) {
        // Simple table extraction - in production, use more sophisticated parsing
        return [];
    }

    extractLists(text) {
        return text.match(/^\s*[-•*]\s+.+$/gm) || [];
    }

    extractRequirements(text) {
        const requirements = text.match(/requirement[s]?\s*:?\s*([^.]+)/gi) || [];
        return requirements.map(req => ({ text: req, confidence: 0.8 }));
    }

    extractDates(text) {
        const datePatterns = [
            /\d{1,2}\/\d{1,2}\/\d{4}/g,
            /\d{4}-\d{2}-\d{2}/g,
            /\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/gi
        ];

        const dates = [];
        for (const pattern of datePatterns) {
            const matches = text.match(pattern) || [];
            dates.push(...matches.map(date => ({ text: date, confidence: 0.9 })));
        }

        return dates;
    }

    extractOwners(text) {
        const ownerPatterns = [
            /responsible\s+person[s]?\s*:?\s*([^.]+)/gi,
            /owner[s]?\s*:?\s*([^.]+)/gi,
            /assigned\s+to\s*:?\s*([^.]+)/gi
        ];

        const owners = [];
        for (const pattern of ownerPatterns) {
            const matches = text.match(pattern) || [];
            owners.push(...matches.map(owner => ({ text: owner, confidence: 0.8 })));
        }

        return owners;
    }

    extractCosts(text) {
        const costPatterns = [
            /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
            /USD\s*\d+(?:,\d{3})*(?:\.\d{2})?/gi,
            /cost[s]?\s*:?\s*\$?\d+(?:,\d{3})*(?:\.\d{2})?/gi
        ];

        const costs = [];
        for (const pattern of costPatterns) {
            const matches = text.match(pattern) || [];
            costs.push(...matches.map(cost => ({ text: cost, confidence: 0.9 })));
        }

        return costs;
    }

    extractDeadlines(text) {
        const deadlinePatterns = [
            /deadline[s]?\s*:?\s*([^.]+)/gi,
            /due\s+date[s]?\s*:?\s*([^.]+)/gi,
            /target\s+date[s]?\s*:?\s*([^.]+)/gi
        ];

        const deadlines = [];
        for (const pattern of deadlinePatterns) {
            const matches = text.match(pattern) || [];
            deadlines.push(...matches.map(deadline => ({ text: deadline, confidence: 0.8 })));
        }

        return deadlines;
    }

    extractStandards(text) {
        const standardPatterns = [
            /SMETA\s*\d+\.\d+/gi,
            /Higg\s+(FSLM|FEM)/gi,
            /SA8000/gi,
            /ISO\s*\d+/gi,
            /SLCP/gi
        ];

        const standards = [];
        for (const pattern of standardPatterns) {
            const matches = text.match(pattern) || [];
            standards.push(...matches.map(standard => ({ text: standard, confidence: 0.9 })));
        }

        return standards;
    }

    extractNonConformities(text) {
        const ncPatterns = [
            /non-conformity[ies]?\s*:?\s*([^.]+)/gi,
            /violation[s]?\s*:?\s*([^.]+)/gi,
            /issue[s]?\s*:?\s*([^.]+)/gi
        ];

        const ncs = [];
        for (const pattern of ncPatterns) {
            const matches = text.match(pattern) || [];
            ncs.push(...matches.map(nc => ({ text: nc, confidence: 0.8 })));
        }

        return ncs;
    }

    // Validation methods
    isValidDate(text) {
        const date = new Date(text);
        return !isNaN(date.getTime());
    }

    isValidCost(text) {
        return /\$\d+(?:,\d{3})*(?:\.\d{2})?/.test(text);
    }

    normalizeEntityText(text, type) {
        return text.trim().toLowerCase();
    }

    generateDocumentId() {
        return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get processing status
     */
    getProcessingStatus() {
        return {
            isProcessing: this.isProcessing,
            supportedFormats: this.supportedFormats
        };
    }
}

// Export for global use
window.DocumentIntelligencePipeline = DocumentIntelligencePipeline;

