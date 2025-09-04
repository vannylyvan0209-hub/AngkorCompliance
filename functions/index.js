const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

// Initialize Firebase Admin
admin.initializeApp();

// OpenAI API configuration
const OPENAI_API_KEY = functions.config().openai?.api_key || process.env.OPENAI_API_KEY;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Middleware to verify authentication
const authenticateUser = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No valid authorization token provided');
    }

    const token = authHeader.split('Bearer ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        return decodedToken;
    } catch (error) {
        throw new Error('Invalid authorization token');
    }
};

// Helper function to make OpenAI API requests
const makeOpenAIRequest = async (endpoint, data) => {
    if (!OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured on server');
    }

    const response = await fetch(`${OPENAI_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
};

// Store API key securely (admin only)
exports.storeOpenAIKey = functions.https.onCall(async (data, context) => {
    // Verify user is authenticated and is admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userRecord = await admin.auth().getUser(context.auth.uid);
    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'super-admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only super admins can configure API keys');
    }

    const { apiKey } = data;
    if (!apiKey || !apiKey.startsWith('sk-')) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid API key format');
    }

    try {
        // Store encrypted API key in Firestore
        await admin.firestore().collection('system_config').doc('openai').set({
            apiKey: apiKey, // In production, encrypt this
            configuredBy: context.auth.uid,
            configuredAt: admin.firestore.FieldValue.serverTimestamp(),
            lastUsed: null
        });

        return { success: true, message: 'API key stored successfully' };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to store API key');
    }
});

// Get API key status (admin only)
exports.getOpenAIStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'super-admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only super admins can view API status');
    }

    try {
        const configDoc = await admin.firestore().collection('system_config').doc('openai').get();
        return {
            configured: configDoc.exists,
            lastUsed: configDoc.exists ? configDoc.data().lastUsed : null,
            configuredAt: configDoc.exists ? configDoc.data().configuredAt : null
        };
    } catch (error) {
        throw new functions.https.HttpsError('internal', 'Failed to get API status');
    }
});

// Document Analysis API
exports.analyzeDocument = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { documentText, documentType = 'compliance' } = data;
    if (!documentText) {
        throw new functions.https.HttpsError('invalid-argument', 'Document text is required');
    }

    try {
        // Get API key from secure storage
        const configDoc = await admin.firestore().collection('system_config').doc('openai').get();
        if (!configDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'OpenAI API not configured');
        }

        const apiKey = configDoc.data().apiKey;
        if (!apiKey) {
            throw new functions.https.HttpsError('failed-precondition', 'OpenAI API key not found');
        }

        // Build prompt
        const prompt = `Please analyze the following ${documentType} document for compliance issues:

Document Content:
${documentText}

Please provide a structured analysis including:
1. Compliance Status (Compliant/Non-Compliant/Needs Review)
2. Identified Issues (list specific problems)
3. Risk Level (Low/Medium/High)
4. Recommendations (specific actions needed)
5. Priority Actions (immediate steps required)
6. Compliance Score (0-100)

Format the response as JSON with these fields.`;

        // Make OpenAI request
        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert compliance analyst specializing in factory and workplace compliance standards. Analyze documents for compliance issues, risks, and recommendations.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const analysis = result.choices[0].message.content;

        // Update last used timestamp
        await admin.firestore().collection('system_config').doc('openai').update({
            lastUsed: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log usage for analytics
        await admin.firestore().collection('ai_usage_logs').add({
            userId: context.auth.uid,
            function: 'analyzeDocument',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            tokensUsed: result.usage?.total_tokens || 0,
            cost: calculateCost(result.usage)
        });

        // Parse and return analysis
        try {
            return JSON.parse(analysis);
        } catch (error) {
            return {
                rawAnalysis: analysis,
                complianceStatus: extractComplianceStatus(analysis),
                issues: extractIssues(analysis),
                recommendations: extractRecommendations(analysis)
            };
        }

    } catch (error) {
        console.error('Document analysis failed:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// CAP Generation API
exports.generateCAP = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { issueDescription, complianceStandard } = data;
    if (!issueDescription || !complianceStandard) {
        throw new functions.https.HttpsError('invalid-argument', 'Issue description and compliance standard are required');
    }

    try {
        const configDoc = await admin.firestore().collection('system_config').doc('openai').get();
        if (!configDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'OpenAI API not configured');
        }

        const apiKey = configDoc.data().apiKey;
        const prompt = `Generate a detailed Corrective Action Plan (CAP) for the following compliance issue:

Issue Description: ${issueDescription}
Compliance Standard: ${complianceStandard}

Please provide a structured CAP including:
1. Root Cause Analysis
2. Corrective Actions (specific steps)
3. Preventive Actions
4. Timeline for Implementation
5. Responsible Parties
6. Success Criteria
7. Follow-up Schedule

Format as JSON with these fields.`;

        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert in workplace compliance and corrective action planning. Generate detailed, actionable CAPs.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.4,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const capContent = result.choices[0].message.content;

        // Update last used timestamp
        await admin.firestore().collection('system_config').doc('openai').update({
            lastUsed: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log usage
        await admin.firestore().collection('ai_usage_logs').add({
            userId: context.auth.uid,
            function: 'generateCAP',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            tokensUsed: result.usage?.total_tokens || 0,
            cost: calculateCost(result.usage)
        });

        try {
            return JSON.parse(capContent);
        } catch (error) {
            return {
                rawCAP: capContent,
                generatedAt: new Date().toISOString()
            };
        }

    } catch (error) {
        console.error('CAP generation failed:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Risk Assessment API
exports.assessRisk = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const { factoryData, complianceHistory } = data;
    if (!factoryData || !complianceHistory) {
        throw new functions.https.HttpsError('invalid-argument', 'Factory data and compliance history are required');
    }

    try {
        const configDoc = await admin.firestore().collection('system_config').doc('openai').get();
        if (!configDoc.exists) {
            throw new functions.https.HttpsError('failed-precondition', 'OpenAI API not configured');
        }

        const apiKey = configDoc.data().apiKey;
        const prompt = `Assess the compliance risk for a factory based on the following data:

Factory Data: ${JSON.stringify(factoryData)}
Compliance History: ${JSON.stringify(complianceHistory)}

Provide a comprehensive risk assessment including:
1. Overall Risk Score (1-10)
2. Risk Factors (specific concerns)
3. Risk Level (Low/Medium/High/Critical)
4. Mitigation Strategies
5. Monitoring Recommendations
6. Priority Areas

Format as JSON.`;

        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a risk assessment expert specializing in factory compliance and workplace safety.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`OpenAI API Error: ${errorData.error?.message || response.statusText}`);
        }

        const result = await response.json();
        const assessment = result.choices[0].message.content;

        // Update last used timestamp
        await admin.firestore().collection('system_config').doc('openai').update({
            lastUsed: admin.firestore.FieldValue.serverTimestamp()
        });

        // Log usage
        await admin.firestore().collection('ai_usage_logs').add({
            userId: context.auth.uid,
            function: 'assessRisk',
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            tokensUsed: result.usage?.total_tokens || 0,
            cost: calculateCost(result.usage)
        });

        return JSON.parse(assessment);

    } catch (error) {
        console.error('Risk assessment failed:', error);
        throw new functions.https.HttpsError('internal', error.message);
    }
});

// Get AI usage analytics (admin only)
exports.getAIUsageAnalytics = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
    }

    const userDoc = await admin.firestore().collection('users').doc(context.auth.uid).get();
    if (!userDoc.exists || userDoc.data().role !== 'super-admin') {
        throw new functions.https.HttpsError('permission-denied', 'Only super admins can view usage analytics');
    }

    try {
        const { startDate, endDate } = data;
        let query = admin.firestore().collection('ai_usage_logs');

        if (startDate && endDate) {
            query = query.where('timestamp', '>=', new Date(startDate))
                        .where('timestamp', '<=', new Date(endDate));
        }

        const snapshot = await query.get();
        const logs = [];
        let totalTokens = 0;
        let totalCost = 0;

        snapshot.forEach(doc => {
            const log = doc.data();
            logs.push(log);
            totalTokens += log.tokensUsed || 0;
            totalCost += log.cost || 0;
        });

        return {
            logs,
            summary: {
                totalRequests: logs.length,
                totalTokens,
                totalCost: totalCost.toFixed(4),
                averageTokensPerRequest: logs.length > 0 ? (totalTokens / logs.length).toFixed(2) : 0
            }
        };

    } catch (error) {
        console.error('Failed to get usage analytics:', error);
        throw new functions.https.HttpsError('internal', 'Failed to get usage analytics');
    }
});

// Helper functions
function calculateCost(usage) {
    if (!usage) return 0;
    
    // GPT-4 pricing (approximate)
    const inputCostPer1K = 0.03;
    const outputCostPer1K = 0.06;
    
    const inputCost = (usage.prompt_tokens / 1000) * inputCostPer1K;
    const outputCost = (usage.completion_tokens / 1000) * outputCostPer1K;
    
    return inputCost + outputCost;
}

function extractComplianceStatus(content) {
    const statusMatch = content.match(/Compliance Status[:\s]*(Compliant|Non-Compliant|Needs Review)/i);
    return statusMatch ? statusMatch[1] : 'Unknown';
}

function extractIssues(content) {
    const issuesMatch = content.match(/Issues?[:\s]*([\s\S]*?)(?=Recommendations|$)/i);
    return issuesMatch ? issuesMatch[1].trim() : '';
}

function extractRecommendations(content) {
    const recMatch = content.match(/Recommendations?[:\s]*([\s\S]*?)(?=Priority|$)/i);
    return recMatch ? recMatch[1].trim() : '';
}
