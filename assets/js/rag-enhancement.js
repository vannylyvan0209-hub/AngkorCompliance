/**
 * RAG Enhancement for AI Copilot
 * Implements hybrid search (BM25 + vector) across multilingual corpora
 * with standards-aware reranking for compliance queries
 */

class RAGEnhancement {
    constructor() {
        this.bm25Index = new BM25Index();
        this.vectorIndex = new VectorIndex();
        this.multilingualCorpora = new MultilingualCorpora();
        this.standardsRegistry = new StandardsRegistry();
        this.confidenceThreshold = 0.7;
    }

    /**
     * Initialize RAG system with standards data
     */
    async initialize() {
        console.log('🚀 Initializing RAG Enhancement...');
        
        try {
            // Load standards and requirements into search indices
            await this.loadStandardsIntoIndices();
            
            // Initialize vector embeddings for multilingual support
            await this.initializeVectorEmbeddings();
            
            // Setup BM25 index with Khmer and English content
            await this.setupBM25Index();
            
            console.log('✅ RAG Enhancement initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing RAG Enhancement:', error);
        }
    }

    /**
     * Load standards and requirements into search indices
     */
    async loadStandardsIntoIndices() {
        const standards = await this.standardsRegistry.getAllStandards();
        const requirements = await this.standardsRegistry.getAllRequirements();

        // Add standards to indices
        for (const standard of standards) {
            await this.bm25Index.addDocument({
                id: standard.id,
                title: standard.name,
                titleKhmer: standard.nameKhmer,
                content: standard.description,
                contentKhmer: standard.descriptionKhmer,
                type: 'standard',
                category: standard.category,
                organization: standard.organization
            });

            await this.vectorIndex.addDocument({
                id: standard.id,
                content: `${standard.name} ${standard.description} ${standard.nameKhmer} ${standard.descriptionKhmer}`,
                metadata: {
                    type: 'standard',
                    category: standard.category,
                    organization: standard.organization
                }
            });
        }

        // Add requirements to indices
        for (const requirement of requirements) {
            await this.bm25Index.addDocument({
                id: requirement.id,
                title: requirement.title,
                titleKhmer: requirement.titleKhmer,
                content: requirement.description,
                contentKhmer: requirement.descriptionKhmer,
                type: 'requirement',
                standardId: requirement.standardId,
                category: requirement.category,
                priority: requirement.priority
            });

            await this.vectorIndex.addDocument({
                id: requirement.id,
                content: `${requirement.title} ${requirement.description} ${requirement.titleKhmer} ${requirement.descriptionKhmer}`,
                metadata: {
                    type: 'requirement',
                    standardId: requirement.standardId,
                    category: requirement.category,
                    priority: requirement.priority
                }
            });
        }
    }

    /**
     * Perform hybrid search with standards-aware reranking
     */
    async hybridSearch(query, language = 'en', context = {}) {
        try {
            // Analyze query intent
            const queryAnalysis = await this.analyzeQuery(query, language);
            
            // BM25 search
            const bm25Results = await this.bm25Index.search(query, {
                language: language,
                limit: 20
            });

            // Vector search
            const vectorResults = await this.vectorIndex.search(query, {
                language: language,
                limit: 20
            });

            // Standards-aware reranking
            const rerankedResults = await this.rerankByStandards(
                bm25Results, 
                vectorResults, 
                queryAnalysis,
                context
            );

            // Enhance results with confidence scores and explanations
            const enhancedResults = await this.enhanceResults(rerankedResults, queryAnalysis);

            return {
                results: enhancedResults,
                queryAnalysis: queryAnalysis,
                searchMetrics: {
                    bm25Count: bm25Results.length,
                    vectorCount: vectorResults.length,
                    rerankedCount: enhancedResults.length,
                    confidence: this.calculateOverallConfidence(enhancedResults)
                }
            };

        } catch (error) {
            console.error('❌ Error in hybrid search:', error);
            throw error;
        }
    }

    /**
     * Analyze query intent and context
     */
    async analyzeQuery(query, language) {
        const analysis = {
            language: language,
            intent: 'general',
            entities: [],
            standards: [],
            requirements: [],
            confidence: 0.8
        };

        // Detect query intent
        const intentKeywords = {
            'standard': ['standard', 'ស្តង់ដារ', 'compliance', 'audit'],
            'requirement': ['requirement', 'តម្រូវការ', 'need', 'must'],
            'cap': ['cap', 'corrective action', 'ការសកម្មភាពកែតម្រូវ', 'improvement'],
            'evidence': ['evidence', 'ភស្តុតាង', 'proof', 'document'],
            'audit': ['audit', 'ការត្រួតពិនិត្យ', 'inspection', 'review']
        };

        for (const [intent, keywords] of Object.entries(intentKeywords)) {
            if (keywords.some(keyword => query.toLowerCase().includes(keyword.toLowerCase()))) {
                analysis.intent = intent;
                break;
            }
        }

        // Extract entities (standards, requirements, etc.)
        const standards = await this.standardsRegistry.getAllStandards();
        for (const standard of standards) {
            if (query.toLowerCase().includes(standard.name.toLowerCase()) ||
                query.toLowerCase().includes(standard.nameKhmer.toLowerCase())) {
                analysis.standards.push(standard.id);
            }
        }

        return analysis;
    }

    /**
     * Rerank results based on standards relevance
     */
    async rerankByStandards(bm25Results, vectorResults, queryAnalysis, context) {
        const allResults = [...bm25Results, ...vectorResults];
        const scoredResults = [];

        for (const result of allResults) {
            let score = result.score || 0;

            // Boost score for standards mentioned in query
            if (queryAnalysis.standards.includes(result.standardId)) {
                score *= 1.5;
            }

            // Boost score for matching intent
            if (result.type === queryAnalysis.intent) {
                score *= 1.3;
            }

            // Boost score for high-priority requirements
            if (result.priority === 'critical') {
                score *= 1.2;
            }

            // Context-based boosting
            if (context.factoryId && result.factoryId === context.factoryId) {
                score *= 1.1;
            }

            scoredResults.push({
                ...result,
                finalScore: score
            });
        }

        // Sort by final score and remove duplicates
        const uniqueResults = this.removeDuplicates(scoredResults);
        return uniqueResults.sort((a, b) => b.finalScore - a.finalScore).slice(0, 10);
    }

    /**
     * Enhance results with confidence scores and explanations
     */
    async enhanceResults(results, queryAnalysis) {
        const enhancedResults = [];

        for (const result of results) {
            const confidence = this.calculateConfidence(result, queryAnalysis);
            
            enhancedResults.push({
                ...result,
                confidence: confidence,
                explanation: this.generateExplanation(result, queryAnalysis),
                sourceType: result.type,
                relevance: this.calculateRelevance(result, queryAnalysis)
            });
        }

        return enhancedResults;
    }

    /**
     * Calculate confidence score for a result
     */
    calculateConfidence(result, queryAnalysis) {
        let confidence = result.finalScore || 0.5;

        // Boost confidence for exact matches
        if (queryAnalysis.standards.includes(result.standardId)) {
            confidence += 0.2;
        }

        // Boost confidence for high-priority items
        if (result.priority === 'critical') {
            confidence += 0.1;
        }

        // Boost confidence for recent/active items
        if (result.status === 'active') {
            confidence += 0.05;
        }

        return Math.min(confidence, 1.0);
    }

    /**
     * Generate explanation for why a result is relevant
     */
    generateExplanation(result, queryAnalysis) {
        const explanations = [];

        if (queryAnalysis.standards.includes(result.standardId)) {
            explanations.push('Directly matches the standard you mentioned');
        }

        if (result.type === queryAnalysis.intent) {
            explanations.push(`Addresses your ${queryAnalysis.intent} question`);
        }

        if (result.priority === 'critical') {
            explanations.push('High-priority compliance requirement');
        }

        if (result.category) {
            explanations.push(`Related to ${result.category} compliance`);
        }

        return explanations.join('. ');
    }

    /**
     * Calculate relevance score
     */
    calculateRelevance(result, queryAnalysis) {
        let relevance = 0.5;

        // Intent matching
        if (result.type === queryAnalysis.intent) {
            relevance += 0.3;
        }

        // Standard matching
        if (queryAnalysis.standards.includes(result.standardId)) {
            relevance += 0.4;
        }

        // Priority consideration
        if (result.priority === 'critical') {
            relevance += 0.2;
        }

        return Math.min(relevance, 1.0);
    }

    /**
     * Remove duplicate results
     */
    removeDuplicates(results) {
        const seen = new Set();
        return results.filter(result => {
            const key = `${result.id}-${result.type}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    /**
     * Calculate overall confidence for search results
     */
    calculateOverallConfidence(results) {
        if (results.length === 0) return 0;
        
        const totalConfidence = results.reduce((sum, result) => sum + result.confidence, 0);
        return totalConfidence / results.length;
    }

    /**
     * Generate SMART CAP suggestions based on search results
     */
    async generateSMARTCAP(nonConformity, searchResults) {
        const cap = {
            actions: [],
            rootCause: '',
            timeline: {},
            verification: []
        };

        // Generate SMART actions based on relevant requirements
        for (const result of searchResults.filter(r => r.type === 'requirement')) {
            const action = await this.generateSMARTAction(result, nonConformity);
            if (action) {
                cap.actions.push(action);
            }
        }

        // Generate root cause analysis
        cap.rootCause = await this.performRootCauseAnalysis(nonConformity, searchResults);

        // Create timeline
        cap.timeline = await this.createTimeline(cap.actions);

        // Design verification methods
        cap.verification = await this.designVerificationMethods(cap.actions);

        return cap;
    }

    /**
     * Generate SMART action for a requirement
     */
    async generateSMARTAction(requirement, nonConformity) {
        return {
            id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            title: `Address ${requirement.title}`,
            description: `Implement corrective action for ${requirement.title}`,
            specific: `Ensure compliance with ${requirement.title} requirements`,
            measurable: 'Achieve 100% compliance verification',
            achievable: 'Within current resource constraints',
            relevant: `Directly addresses the non-conformity: ${nonConformity.description}`,
            timeBound: 'Complete within 30 days',
            owner: 'TBD',
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            status: 'pending',
            requirementId: requirement.id
        };
    }

    /**
     * Perform root cause analysis
     */
    async performRootCauseAnalysis(nonConformity, searchResults) {
        const analysis = {
            immediateCause: nonConformity.description,
            underlyingCauses: [],
            rootCauses: [],
            recommendations: []
        };

        // Analyze based on relevant requirements
        for (const result of searchResults.filter(r => r.type === 'requirement')) {
            if (result.priority === 'critical') {
                analysis.rootCauses.push(`Lack of compliance with ${result.title}`);
                analysis.recommendations.push(`Strengthen ${result.title} implementation`);
            }
        }

        return analysis;
    }

    /**
     * Create timeline for CAP actions
     */
    async createTimeline(actions) {
        const timeline = {
            phases: [],
            milestones: [],
            totalDuration: 0
        };

        let currentDate = new Date();
        let totalDays = 0;

        for (const action of actions) {
            const phase = {
                actionId: action.id,
                title: action.title,
                startDate: new Date(currentDate),
                endDate: new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days per action
                duration: 7,
                status: 'planned'
            };

            timeline.phases.push(phase);
            timeline.milestones.push({
                date: phase.endDate,
                description: `Complete ${action.title}`,
                type: 'completion'
            });

            currentDate = new Date(phase.endDate.getTime() + 24 * 60 * 60 * 1000); // 1 day gap
            totalDays += 8; // 7 days + 1 day gap
        }

        timeline.totalDuration = totalDays;
        return timeline;
    }

    /**
     * Design verification methods
     */
    async designVerificationMethods(actions) {
        const verificationMethods = [];

        for (const action of actions) {
            verificationMethods.push({
                actionId: action.id,
                method: 'Document Review',
                description: `Review updated documentation for ${action.title}`,
                frequency: 'Upon completion',
                responsible: 'Quality Manager'
            });

            verificationMethods.push({
                actionId: action.id,
                method: 'Site Inspection',
                description: `Conduct on-site verification of ${action.title} implementation`,
                frequency: 'Within 7 days of completion',
                responsible: 'Auditor'
            });
        }

        return verificationMethods;
    }
}

// BM25 Index Implementation
class BM25Index {
    constructor() {
        this.documents = [];
        this.avgDocLength = 0;
        this.k1 = 1.2;
        this.b = 0.75;
    }

    async addDocument(doc) {
        this.documents.push(doc);
        this.updateAvgDocLength();
    }

    async search(query, options = {}) {
        const queryTerms = this.tokenize(query, options.language);
        const results = [];

        for (const doc of this.documents) {
            const score = this.calculateBM25Score(doc, queryTerms);
            if (score > 0) {
                results.push({
                    ...doc,
                    score: score
                });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, options.limit || 10);
    }

    tokenize(text, language) {
        // Simple tokenization - in production, use proper NLP libraries
        return text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(term => term.length > 2);
    }

    calculateBM25Score(doc, queryTerms) {
        let score = 0;
        const docTerms = this.tokenize(`${doc.title} ${doc.content} ${doc.titleKhmer} ${doc.contentKhmer}`);

        for (const queryTerm of queryTerms) {
            const tf = docTerms.filter(term => term === queryTerm).length;
            const idf = this.calculateIDF(queryTerm);
            const numerator = tf * (this.k1 + 1);
            const denominator = tf + this.k1 * (1 - this.b + this.b * (docTerms.length / this.avgDocLength));
            
            score += idf * (numerator / denominator);
        }

        return score;
    }

    calculateIDF(term) {
        const docsWithTerm = this.documents.filter(doc => {
            const docText = `${doc.title} ${doc.content} ${doc.titleKhmer} ${doc.contentKhmer}`;
            return docText.toLowerCase().includes(term.toLowerCase());
        }).length;

        return Math.log((this.documents.length - docsWithTerm + 0.5) / (docsWithTerm + 0.5));
    }

    updateAvgDocLength() {
        const totalLength = this.documents.reduce((sum, doc) => {
            const docText = `${doc.title} ${doc.content} ${doc.titleKhmer} ${doc.contentKhmer}`;
            return sum + this.tokenize(docText).length;
        }, 0);
        
        this.avgDocLength = totalLength / this.documents.length;
    }
}

// Vector Index Implementation (simplified)
class VectorIndex {
    constructor() {
        this.documents = [];
    }

    async addDocument(doc) {
        this.documents.push(doc);
    }

    async search(query, options = {}) {
        // Simplified vector search - in production, use proper vector embeddings
        const queryTerms = query.toLowerCase().split(/\s+/);
        const results = [];

        for (const doc of this.documents) {
            const score = this.calculateSimilarity(doc.content, queryTerms);
            if (score > 0.1) {
                results.push({
                    ...doc,
                    score: score
                });
            }
        }

        return results
            .sort((a, b) => b.score - a.score)
            .slice(0, options.limit || 10);
    }

    calculateSimilarity(content, queryTerms) {
        const contentTerms = content.toLowerCase().split(/\s+/);
        let matches = 0;

        for (const queryTerm of queryTerms) {
            if (contentTerms.includes(queryTerm)) {
                matches++;
            }
        }

        return matches / queryTerms.length;
    }
}

// Multilingual Corpora Management
class MultilingualCorpora {
    constructor() {
        this.corpora = {
            en: [],
            km: []
        };
    }

    async addToCorpus(text, language) {
        if (this.corpora[language]) {
            this.corpora[language].push(text);
        }
    }

    async searchCorpus(query, language) {
        const corpus = this.corpora[language] || [];
        const results = [];

        for (const text of corpus) {
            if (text.toLowerCase().includes(query.toLowerCase())) {
                results.push(text);
            }
        }

        return results;
    }
}

// Export for global use
window.RAGEnhancement = RAGEnhancement;
window.BM25Index = BM25Index;
window.VectorIndex = VectorIndex;
window.MultilingualCorpora = MultilingualCorpora;

