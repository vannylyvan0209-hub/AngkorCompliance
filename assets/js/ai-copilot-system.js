// AI Copilot System for Angkor Compliance Platform
// Implements advanced AI assistance with explainability and human oversight

class AICopilotSystem {
    constructor() {
        this.db = window.Firebase.db;
        this.openAI = window.openAI;
        this.isInitialized = false;
        this.conversationHistory = new Map();
        this.approvalQueue = new Map();
        this.sourceCache = new Map();
        
        // Initialize RAG Enhancement
        this.ragEnhancement = null;
        
        this.initializeCopilot();
    }

    async initializeCopilot() {
        try {
            // Initialize OpenAI integration
            if (this.openAI) {
                await this.openAI.checkConfiguration();
                this.isInitialized = this.openAI.isConfigured;
            }
            
            // Initialize RAG Enhancement
            if (window.RAGEnhancement) {
                this.ragEnhancement = new RAGEnhancement();
                await this.ragEnhancement.initialize();
                console.log('✅ RAG Enhancement initialized');
            }
            
            // Load knowledge base
            await this.loadKnowledgeBase();
            
            // Set up conversation tracking
            this.setupConversationTracking();
            
            console.log('✅ AI Copilot System initialized with RAG Enhancement');
        } catch (error) {
            console.error('❌ Error initializing AI Copilot:', error);
            this.isInitialized = false;
        }
    }

    // Main Copilot Interface
    async askCopilot(question, context = {}, userId = null) {
        try {
            if (!this.isInitialized) {
                throw new Error('AI Copilot not initialized. Please check OpenAI configuration.');
            }

            // Analyze question type and context
            const questionAnalysis = await this.analyzeQuestion(question, context);
            
            // Generate response with explainability
            const response = await this.generateResponse(question, questionAnalysis, context);
            
            // Add to conversation history
            if (userId) {
                this.addToConversationHistory(userId, question, response);
            }
            
            return response;
        } catch (error) {
            console.error('Error in AI Copilot:', error);
            return {
                answer: 'I apologize, but I encountered an error processing your request. Please try again or contact support.',
                confidence: 0,
                sources: [],
                requiresApproval: false,
                error: error.message
            };
        }
    }

    // Question Analysis and Classification
    async analyzeQuestion(question, context) {
        const analysis = {
            type: 'general',
            domain: 'compliance',
            complexity: 'medium',
            requiresApproval: false,
            suggestedActions: [],
            relatedStandards: [],
            riskLevel: 'low'
        };

        // Classify question type
        const questionLower = question.toLowerCase();
        
        // Enhanced question type detection with confidence scoring
        if (questionLower.includes('cap') || questionLower.includes('corrective action') || 
            questionLower.includes('generate') || questionLower.includes('create')) {
            analysis.type = 'cap_generation';
            analysis.domain = 'corrective_actions';
            analysis.confidence = 0.95;
            analysis.requiresApproval = true;
            analysis.suggestedActions = ['review_generated_cap', 'validate_actions', 'assign_responsibilities'];
        } 
        // Standard Inquiry
        else if (questionLower.includes('standard') || questionLower.includes('requirement') || 
                 questionLower.includes('compliance') || questionLower.includes('what is')) {
            analysis.type = 'standard_inquiry';
            analysis.domain = 'standards';
            analysis.confidence = 0.9;
            analysis.suggestedActions = ['search_standards', 'provide_explanation', 'link_requirements'];
        } 
        // Audit Preparation
        else if (questionLower.includes('audit') || questionLower.includes('checklist') || 
                 questionLower.includes('prepare') || questionLower.includes('readiness')) {
            analysis.type = 'audit_preparation';
            analysis.domain = 'auditing';
            analysis.confidence = 0.85;
            analysis.suggestedActions = ['generate_checklist', 'assess_readiness', 'identify_gaps'];
        } 
        // Evidence Management
        else if (questionLower.includes('evidence') || questionLower.includes('document') || 
                 questionLower.includes('upload') || questionLower.includes('find')) {
            analysis.type = 'evidence_management';
            analysis.domain = 'documents';
            analysis.confidence = 0.8;
            analysis.suggestedActions = ['search_documents', 'suggest_evidence_types', 'validate_evidence'];
        } 
        // Risk Assessment
        else if (questionLower.includes('risk') || questionLower.includes('assessment') || 
                 questionLower.includes('analyze') || questionLower.includes('evaluate')) {
            analysis.type = 'risk_assessment';
            analysis.domain = 'risk_management';
            analysis.confidence = 0.85;
            analysis.requiresApproval = true;
            analysis.suggestedActions = ['perform_risk_analysis', 'generate_report', 'suggest_mitigation'];
        }
        // Training and Meetings
        else if (questionLower.includes('training') || questionLower.includes('meeting') || 
                 questionLower.includes('agenda') || questionLower.includes('schedule')) {
            analysis.type = 'training_meeting';
            analysis.domain = 'training';
            analysis.confidence = 0.8;
            analysis.suggestedActions = ['generate_agenda', 'suggest_topics', 'create_schedule'];
        }
        // Permit Management
        else if (questionLower.includes('permit') || questionLower.includes('certificate') || 
                 questionLower.includes('expiry') || questionLower.includes('renewal')) {
            analysis.type = 'permit_management';
            analysis.domain = 'permits';
            analysis.confidence = 0.9;
            analysis.suggestedActions = ['check_expiry', 'generate_renewal_checklist', 'alert_stakeholders'];
        }
        // Grievance Management
        else if (questionLower.includes('grievance') || questionLower.includes('case')) {
            analysis.type = 'grievance_assistance';
            analysis.domain = 'grievances';
            analysis.confidence = 0.8;
            analysis.suggestedActions = ['review_case', 'suggest_resolution', 'track_progress'];
        }

        // Determine complexity and risk level
        analysis.complexity = this.assessComplexity(question, context);
        analysis.riskLevel = this.assessRiskLevel(question, context);
        
        // Identify related standards
        analysis.relatedStandards = await this.identifyRelatedStandards(question);
        
        // Suggest actions
        analysis.suggestedActions = this.suggestActions(analysis);

        return analysis;
    }

    // Response Generation with Explainability and RAG Enhancement
    async generateResponse(question, analysis, context) {
        try {
            let ragResults = null;
            let enhancedPrompt = this.buildPrompt(question, analysis, context);
            
            // Use RAG Enhancement if available
            if (this.ragEnhancement) {
                try {
                    // Perform hybrid search
                    const language = context.language || 'en';
                    ragResults = await this.ragEnhancement.hybridSearch(question, language, context);
                    
                    // Enhance prompt with RAG results
                    enhancedPrompt = this.enhancePromptWithRAG(enhancedPrompt, ragResults, analysis);
                    
                    console.log('✅ RAG Enhancement applied to response generation');
                } catch (ragError) {
                    console.warn('⚠️ RAG Enhancement failed, using fallback:', ragError);
                }
            }
            
            // Generate AI response
            const aiResponse = await this.openAI.makeServerRequest('generateCopilotResponse', {
                prompt: enhancedPrompt,
                analysis,
                context,
                ragResults: ragResults ? ragResults.results : null
            });

            // Enhance with sources and citations
            const enhancedResponse = await this.enhanceWithSources(aiResponse, analysis, ragResults);
            
            // Add confidence scoring
            const confidenceScore = this.calculateConfidence(enhancedResponse, analysis, ragResults);
            
            // Check if approval is required
            const requiresApproval = this.checkApprovalRequired(analysis, confidenceScore);

            return {
                answer: enhancedResponse.answer,
                confidence: confidenceScore,
                sources: enhancedResponse.sources,
                citations: enhancedResponse.citations,
                relatedStandards: analysis.relatedStandards,
                suggestedActions: analysis.suggestedActions,
                requiresApproval,
                approvalReason: requiresApproval ? this.getApprovalReason(analysis) : null,
                ragMetrics: ragResults ? ragResults.searchMetrics : null,
                metadata: {
                    questionType: analysis.type,
                    domain: analysis.domain,
                    complexity: analysis.complexity,
                    riskLevel: analysis.riskLevel,
                    ragEnhanced: !!ragResults,
                    generatedAt: new Date().toISOString()
                }
            };
        } catch (error) {
            console.error('Error generating response:', error);
            throw error;
        }
    }

    // Source Enhancement and Citations
    async enhanceWithSources(aiResponse, analysis) {
        const sources = [];
        const citations = [];

        try {
            // Search for relevant documents
            const relevantDocs = await this.searchRelevantDocuments(aiResponse.answer, analysis);
            
            // Search for relevant standards
            const relevantStandards = await this.searchRelevantStandards(aiResponse.answer, analysis);
            
            // Search for relevant policies
            const relevantPolicies = await this.searchRelevantPolicies(aiResponse.answer, analysis);

            // Search for relevant requirements
            const relevantRequirements = await this.searchRelevantRequirements(aiResponse.answer, analysis);

            // Search for relevant audit frameworks
            const relevantFrameworks = await this.searchRelevantFrameworks(aiResponse.answer, analysis);

            // Combine and rank sources
            const allSources = [
                ...relevantDocs.map(doc => ({ ...doc, type: 'document', weight: 0.3 })),
                ...relevantStandards.map(std => ({ ...std, type: 'standard', weight: 0.4 })),
                ...relevantPolicies.map(policy => ({ ...policy, type: 'policy', weight: 0.2 })),
                ...relevantRequirements.map(req => ({ ...req, type: 'requirement', weight: 0.35 })),
                ...relevantFrameworks.map(framework => ({ ...framework, type: 'framework', weight: 0.25 }))
            ];

            // Rank sources by relevance and type
            const rankedSources = this.rankSourcesByRelevance(allSources, aiResponse.answer, analysis);
            
            // Take top 5 most relevant sources
            const topSources = rankedSources.slice(0, 5);

            // Generate citations with confidence scoring
            topSources.forEach((source, index) => {
                const citation = `[${index + 1}]`;
                const confidence = this.calculateSourceConfidence(source, analysis);
                
                citations.push({
                    id: citation,
                    source: source,
                    relevance: source.relevanceScore,
                    confidence: confidence,
                    type: source.type,
                    lastVerified: source.lastUpdated || new Date().toISOString()
                });
                
                sources.push({
                    id: source.id,
                    title: source.title,
                    type: source.type,
                    url: source.url,
                    relevance: source.relevanceScore,
                    confidence: confidence,
                    lastUpdated: source.lastUpdated,
                    description: source.description || '',
                    version: source.version || '1.0'
                });
            });

            // Add inline citations to answer with confidence indicators
            let enhancedAnswer = aiResponse.answer;
            citations.forEach(citation => {
                const confidenceIndicator = citation.confidence > 0.8 ? '✓' : citation.confidence > 0.6 ? '~' : '?';
                const regex = new RegExp(`\\b${citation.source.title}\\b`, 'gi');
                enhancedAnswer = enhancedAnswer.replace(regex, `${citation.source.title} ${citation.id}${confidenceIndicator}`);
            });

            // Add source summary at the end
            if (sources.length > 0) {
                enhancedAnswer += '\n\n**Sources:**\n';
                sources.forEach((source, index) => {
                    const confidenceIndicator = source.confidence > 0.8 ? '✓' : source.confidence > 0.6 ? '~' : '?';
                    enhancedAnswer += `${index + 1}. ${source.title} (${source.type}) ${confidenceIndicator}\n`;
                });
            }

            return {
                answer: enhancedAnswer,
                sources,
                citations,
                sourceSummary: {
                    totalSources: sources.length,
                    averageConfidence: sources.reduce((sum, s) => sum + s.confidence, 0) / sources.length,
                    sourceTypes: [...new Set(sources.map(s => s.type))],
                    lastUpdated: Math.max(...sources.map(s => new Date(s.lastUpdated).getTime()))
                }
            };
        } catch (error) {
            console.error('Error enhancing with sources:', error);
            return {
                answer: aiResponse.answer,
                sources: [],
                citations: [],
                sourceSummary: {
                    totalSources: 0,
                    averageConfidence: 0,
                    sourceTypes: [],
                    lastUpdated: null
                }
            };
        }
    }

    // CAP Generation with Human Oversight
    async generateCAP(issueDescription, context = {}) {
        try {
            // Analyze issue
            const issueAnalysis = await this.analyzeIssue(issueDescription, context);
            
            // Generate CAP draft
            const capDraft = await this.openAI.makeServerRequest('generateCAP', {
                issueDescription,
                analysis: issueAnalysis,
                context
            });

            // Enhance with SMART criteria
            const enhancedCAP = await this.enhanceCAPWithSMART(capDraft, issueAnalysis);
            
            // Add to approval queue
            const approvalId = this.addToApprovalQueue(enhancedCAP, 'cap_generation', context.userId);
            
            return {
                cap: enhancedCAP,
                approvalId,
                requiresApproval: true,
                approvalReason: 'CAP generation requires human review before implementation',
                metadata: {
                    issueType: issueAnalysis.type,
                    severity: issueAnalysis.severity,
                    estimatedCost: enhancedCAP.estimatedCost,
                    timeline: enhancedCAP.timeline
                }
            };
        } catch (error) {
            console.error('Error generating CAP:', error);
            throw error;
        }
    }

    // Audit Report Generation
    async generateAuditReport(auditData, findings, context = {}) {
        try {
            // Analyze audit data
            const auditAnalysis = await this.analyzeAuditData(auditData, findings);
            
            // Generate report
            const report = await this.openAI.makeServerRequest('generateAuditReport', {
                auditData,
                findings,
                analysis: auditAnalysis,
                context
            });

            // Enhance with compliance scoring
            const enhancedReport = await this.enhanceReportWithCompliance(report, auditAnalysis);
            
            return {
                report: enhancedReport,
                requiresApproval: false,
                metadata: {
                    auditType: auditAnalysis.type,
                    complianceScore: enhancedReport.complianceScore,
                    riskLevel: enhancedReport.riskLevel,
                    recommendations: enhancedReport.recommendations.length
                }
            };
        } catch (error) {
            console.error('Error generating audit report:', error);
            throw error;
        }
    }

    // Training Content Generation
    async generateTrainingContent(topic, audience, context = {}) {
        try {
            // Analyze training needs
            const trainingAnalysis = await this.analyzeTrainingNeeds(topic, audience, context);
            
            // Generate content
            const content = await this.openAI.makeServerRequest('generateTrainingContent', {
                topic,
                audience,
                analysis: trainingAnalysis,
                context
            });

            // Enhance with interactive elements
            const enhancedContent = await this.enhanceTrainingContent(content, trainingAnalysis);
            
            return {
                content: enhancedContent,
                requiresApproval: false,
                metadata: {
                    topic,
                    audience,
                    duration: enhancedContent.estimatedDuration,
                    difficulty: enhancedContent.difficulty,
                    interactiveElements: enhancedContent.interactiveElements.length
                }
            };
        } catch (error) {
            console.error('Error generating training content:', error);
            throw error;
        }
    }

    // Helper Methods
    assessComplexity(question, context) {
        const wordCount = question.split(' ').length;
        const hasTechnicalTerms = /(standard|requirement|compliance|audit|cap|grievance)/i.test(question);
        const hasContext = Object.keys(context).length > 0;
        
        if (wordCount > 50 || hasTechnicalTerms && hasContext) return 'high';
        if (wordCount > 25 || hasTechnicalTerms) return 'medium';
        return 'low';
    }

    assessRiskLevel(question, context) {
        const highRiskTerms = /(violation|incident|emergency|critical|urgent)/i;
        const mediumRiskTerms = /(issue|problem|concern|warning)/i;
        
        if (highRiskTerms.test(question)) return 'high';
        if (mediumRiskTerms.test(question)) return 'medium';
        return 'low';
    }

    async identifyRelatedStandards(question) {
        const standards = ['SMETA', 'Higg', 'SA8000', 'ISO 9001', 'ISO 14001', 'ISO 45001'];
        const related = [];
        
        standards.forEach(standard => {
            if (question.toLowerCase().includes(standard.toLowerCase())) {
                related.push(standard);
            }
        });
        
        return related;
    }

    suggestActions(analysis) {
        const actions = [];
        
        switch (analysis.type) {
            case 'cap_generation':
                actions.push('Review generated CAP for accuracy');
                actions.push('Assign responsible parties');
                actions.push('Set implementation timeline');
                break;
            case 'audit_assistance':
                actions.push('Review audit checklist');
                actions.push('Prepare evidence binder');
                actions.push('Schedule audit preparation meeting');
                break;
            case 'risk_assessment':
                actions.push('Review risk factors');
                actions.push('Implement mitigation strategies');
                actions.push('Schedule follow-up assessment');
                break;
        }
        
        return actions;
    }

    buildPrompt(question, analysis, context) {
        return `As an AI compliance assistant for the Angkor Compliance Platform, please provide a comprehensive answer to the following question:

Question: ${question}

Context: ${JSON.stringify(context)}
Question Type: ${analysis.type}
Domain: ${analysis.domain}
Complexity: ${analysis.complexity}

Please provide:
1. A clear, accurate answer
2. Relevant compliance standards and requirements
3. Practical recommendations
4. Any necessary warnings or considerations

Focus on being helpful, accurate, and actionable while maintaining compliance with relevant standards.`;
    }

    calculateConfidence(response, analysis) {
        let confidence = 0.8; // Base confidence
        
        // Adjust based on complexity
        if (analysis.complexity === 'high') confidence -= 0.1;
        if (analysis.complexity === 'low') confidence += 0.1;
        
        // Adjust based on sources
        if (response.sources && response.sources.length > 0) {
            confidence += Math.min(response.sources.length * 0.05, 0.2);
        }
        
        // Adjust based on risk level
        if (analysis.riskLevel === 'high') confidence -= 0.1;
        
        return Math.max(0, Math.min(1, confidence));
    }

    checkApprovalRequired(analysis, confidence) {
        return analysis.requiresApproval || 
               analysis.riskLevel === 'high' || 
               confidence < 0.7 ||
               analysis.type === 'cap_generation';
    }

    getApprovalReason(analysis) {
        if (analysis.type === 'cap_generation') {
            return 'CAP generation requires human review before implementation';
        }
        if (analysis.riskLevel === 'high') {
            return 'High-risk content requires approval';
        }
        return 'Content requires human review for accuracy';
    }

    // Document and source search methods
    async searchRelevantDocuments(answer, analysis) {
        // Implementation would search your document database
        return [];
    }

    async searchRelevantStandards(answer, analysis) {
        // Implementation would search standards database
        return [];
    }

    async searchRelevantPolicies(answer, analysis) {
        // Implementation would search policies database
        return [];
    }

    rankSourcesByRelevance(sources, answer) {
        // Implementation would rank sources by relevance to answer
        return sources.sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // CAP enhancement methods
    async analyzeIssue(issueDescription, context) {
        return {
            type: 'general',
            severity: 'medium',
            urgency: 'normal',
            affectedAreas: []
        };
    }

    async enhanceCAPWithSMART(capDraft, analysis) {
        return {
            ...capDraft,
            smart: {
                specific: true,
                measurable: true,
                achievable: true,
                relevant: true,
                timeBound: true
            }
        };
    }

    // Audit analysis methods
    async analyzeAuditData(auditData, findings) {
        return {
            type: 'comprehensive',
            severity: 'medium',
            complianceAreas: []
        };
    }

    async enhanceReportWithCompliance(report, analysis) {
        return {
            ...report,
            complianceScore: 85,
            riskLevel: 'medium'
        };
    }

    // Training analysis methods
    async analyzeTrainingNeeds(topic, audience, context) {
        return {
            type: 'compliance',
            level: 'intermediate',
            duration: '2 hours'
        };
    }

    async enhanceTrainingContent(content, analysis) {
        return {
            ...content,
            interactiveElements: [],
            estimatedDuration: '2 hours',
            difficulty: 'intermediate'
        };
    }

    // Conversation tracking
    setupConversationTracking() {
        // Implementation for conversation tracking
    }

    addToConversationHistory(userId, question, response) {
        if (!this.conversationHistory.has(userId)) {
            this.conversationHistory.set(userId, []);
        }
        
        this.conversationHistory.get(userId).push({
            question,
            response,
            timestamp: new Date().toISOString()
        });
    }

    addToApprovalQueue(content, type, userId) {
        const approvalId = `approval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        this.approvalQueue.set(approvalId, {
            content,
            type,
            userId,
            status: 'pending',
            createdAt: new Date().toISOString()
        });
        
        return approvalId;
    }

    async loadKnowledgeBase() {
        // Implementation to load knowledge base
    }

    // RAG Enhancement Methods
    enhancePromptWithRAG(prompt, ragResults, analysis) {
        if (!ragResults || !ragResults.results || ragResults.results.length === 0) {
            return prompt;
        }

        let enhancedPrompt = prompt + '\n\nRelevant Information from Knowledge Base:\n';
        
        // Add top RAG results to prompt
        const topResults = ragResults.results.slice(0, 5);
        for (let i = 0; i < topResults.length; i++) {
            const result = topResults[i];
            enhancedPrompt += `\n${i + 1}. ${result.title || result.id}:\n`;
            enhancedPrompt += `   Content: ${result.content || result.description}\n`;
            enhancedPrompt += `   Confidence: ${(result.confidence * 100).toFixed(1)}%\n`;
            enhancedPrompt += `   Relevance: ${(result.relevance * 100).toFixed(1)}%\n`;
            if (result.explanation) {
                enhancedPrompt += `   Explanation: ${result.explanation}\n`;
            }
        }

        enhancedPrompt += '\nPlease use this relevant information to provide a comprehensive and accurate response.';
        
        return enhancedPrompt;
    }

    async enhanceWithSources(aiResponse, analysis, ragResults) {
        const enhancedResponse = {
            answer: aiResponse.answer || aiResponse.response,
            sources: [],
            citations: []
        };

        // Add RAG results as sources
        if (ragResults && ragResults.results) {
            for (const result of ragResults.results.slice(0, 3)) {
                enhancedResponse.sources.push({
                    id: result.id,
                    title: result.title || result.id,
                    type: result.type || 'standard',
                    confidence: result.confidence,
                    relevance: result.relevance,
                    explanation: result.explanation
                });

                enhancedResponse.citations.push({
                    source: result.id,
                    text: result.title || result.id,
                    confidence: result.confidence
                });
            }
        }

        // Add existing sources if available
        if (aiResponse.sources) {
            enhancedResponse.sources.push(...aiResponse.sources);
        }

        return enhancedResponse;
    }

    calculateConfidence(enhancedResponse, analysis, ragResults) {
        let confidence = 0.7; // Base confidence

        // Boost confidence based on RAG results
        if (ragResults && ragResults.results && ragResults.results.length > 0) {
            const avgRAGConfidence = ragResults.results.reduce((sum, r) => sum + r.confidence, 0) / ragResults.results.length;
            confidence += avgRAGConfidence * 0.2;
        }

        // Boost confidence based on analysis
        if (analysis.confidence) {
            confidence += analysis.confidence * 0.1;
        }

        // Boost confidence based on number of sources
        if (enhancedResponse.sources && enhancedResponse.sources.length > 0) {
            confidence += Math.min(enhancedResponse.sources.length * 0.05, 0.1);
        }

        return Math.min(confidence, 1.0);
    }

    // Generate SMART CAP using RAG
    async generateSMARTCAPWithRAG(nonConformity, context) {
        if (!this.ragEnhancement) {
            throw new Error('RAG Enhancement not available');
        }

        // Search for relevant requirements
        const searchResults = await this.ragEnhancement.hybridSearch(
            nonConformity.description, 
            context.language || 'en', 
            context
        );

        // Generate SMART CAP
        const smartCAP = await this.ragEnhancement.generateSMARTCAP(nonConformity, searchResults.results);

        return {
            ...smartCAP,
            searchMetrics: searchResults.searchMetrics,
            sources: searchResults.results.slice(0, 5).map(r => ({
                id: r.id,
                title: r.title || r.id,
                type: r.type,
                confidence: r.confidence
            }))
        };
    }
}

// Initialize the AI Copilot globally
window.AICopilot = new AICopilotSystem();
