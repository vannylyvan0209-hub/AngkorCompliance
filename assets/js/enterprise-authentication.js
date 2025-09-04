// Enterprise Authentication System for Angkor Compliance Platform
// Implements SSO (SAML/OIDC), SCIM provisioning, and passkeys as outlined in the vision document

class EnterpriseAuthenticationSystem {
    constructor() {
        this.db = window.Firebase?.db;
        this.auth = window.Firebase?.auth;
        this.currentUser = null;
        this.ssoProviders = new Map();
        this.scimConfig = null;
        this.passkeyConfig = null;
        this.isInitialized = false;
        
        this.initializeEnterpriseAuth();
    }

    async initializeEnterpriseAuth() {
        try {
            console.log('🔐 Initializing Enterprise Authentication System...');
            
            // Initialize SSO providers
            await this.initializeSSOProviders();
            
            // Initialize SCIM configuration
            await this.initializeSCIM();
            
            // Initialize passkey system
            await this.initializePasskeys();
            
            // Set up authentication listeners
            this.setupAuthListeners();
            
            this.isInitialized = true;
            console.log('✅ Enterprise Authentication System initialized');
            
        } catch (error) {
            console.error('❌ Failed to initialize Enterprise Authentication System:', error);
            this.isInitialized = false;
        }
    }

    // SSO Provider Initialization
    async initializeSSOProviders() {
        // Azure AD (OIDC)
        this.ssoProviders.set('azure', {
            id: 'azure',
            name: 'Microsoft Azure AD',
            type: 'oidc',
            config: {
                clientId: process.env.AZURE_CLIENT_ID,
                tenantId: process.env.AZURE_TENANT_ID,
                authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
                redirectUri: `${window.location.origin}/auth/callback`,
                scopes: ['openid', 'profile', 'email', 'User.Read'],
                responseType: 'code',
                responseMode: 'query'
            },
            enabled: false
        });

        // Google Workspace (OIDC)
        this.ssoProviders.set('google', {
            id: 'google',
            name: 'Google Workspace',
            type: 'oidc',
            config: {
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                discoveryUrl: 'https://accounts.google.com/.well-known/openid_configuration',
                redirectUri: `${window.location.origin}/auth/callback`,
                scopes: ['openid', 'profile', 'email'],
                responseType: 'code'
            },
            enabled: false
        });

        // Okta (SAML/OIDC)
        this.ssoProviders.set('okta', {
            id: 'okta',
            name: 'Okta',
            type: 'saml',
            config: {
                entryPoint: process.env.OKTA_ENTRY_POINT,
                issuer: process.env.OKTA_ISSUER,
                cert: process.env.OKTA_CERT,
                callbackUrl: `${window.location.origin}/auth/saml/callback`,
                logoutUrl: `${window.location.origin}/auth/logout`
            },
            enabled: false
        });

        // Load SSO configuration from database
        await this.loadSSOConfiguration();
    }

    // SCIM Configuration
    async initializeSCIM() {
        this.scimConfig = {
            enabled: false,
            endpoint: process.env.SCIM_ENDPOINT,
            token: process.env.SCIM_TOKEN,
            version: '2.0',
            features: {
                userProvisioning: true,
                userDeprovisioning: true,
                groupManagement: true,
                passwordSync: false
            },
            mappings: {
                user: {
                    'userName': 'email',
                    'name.givenName': 'firstName',
                    'name.familyName': 'lastName',
                    'emails[0].value': 'email',
                    'phoneNumbers[0].value': 'phone',
                    'title': 'role',
                    'active': 'isActive'
                },
                group: {
                    'displayName': 'name',
                    'members': 'users'
                }
            }
        };

        // Load SCIM configuration from database
        await this.loadSCIMConfiguration();
    }

    // Passkey Configuration
    async initializePasskeys() {
        this.passkeyConfig = {
            enabled: false,
            relyingParty: {
                name: 'Angkor Compliance Platform',
                id: window.location.hostname
            },
            userVerification: 'preferred',
            authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'preferred',
                requireResidentKey: false
            },
            timeout: 60000,
            attestation: 'direct'
        };

        // Load passkey configuration from database
        await this.loadPasskeyConfiguration();
    }

    // Load configurations from database
    async loadSSOConfiguration() {
        try {
            const configDoc = await this.db.collection('system_config').doc('sso').get();
            if (configDoc.exists) {
                const config = configDoc.data();
                for (const [providerId, providerConfig] of Object.entries(config.providers || {})) {
                    if (this.ssoProviders.has(providerId)) {
                        this.ssoProviders.get(providerId).enabled = providerConfig.enabled || false;
                        this.ssoProviders.get(providerId).config = {
                            ...this.ssoProviders.get(providerId).config,
                            ...providerConfig.config
                        };
                    }
                }
            }
        } catch (error) {
            console.error('❌ Failed to load SSO configuration:', error);
        }
    }

    async loadSCIMConfiguration() {
        try {
            const configDoc = await this.db.collection('system_config').doc('scim').get();
            if (configDoc.exists) {
                this.scimConfig = { ...this.scimConfig, ...configDoc.data() };
            }
        } catch (error) {
            console.error('❌ Failed to load SCIM configuration:', error);
        }
    }

    async loadPasskeyConfiguration() {
        try {
            const configDoc = await this.db.collection('system_config').doc('passkeys').get();
            if (configDoc.exists) {
                this.passkeyConfig = { ...this.passkeyConfig, ...configDoc.data() };
            }
        } catch (error) {
            console.error('❌ Failed to load passkey configuration:', error);
        }
    }

    // SSO Authentication Methods
    async initiateSSO(providerId) {
        try {
            const provider = this.ssoProviders.get(providerId);
            if (!provider || !provider.enabled) {
                throw new Error(`SSO provider ${providerId} not available`);
            }

            if (provider.type === 'oidc') {
                return await this.initiateOIDC(provider);
            } else if (provider.type === 'saml') {
                return await this.initiateSAML(provider);
            }

        } catch (error) {
            console.error('❌ SSO initiation failed:', error);
            throw error;
        }
    }

    async initiateOIDC(provider) {
        const params = new URLSearchParams({
            client_id: provider.config.clientId,
            redirect_uri: provider.config.redirectUri,
            response_type: provider.config.responseType,
            scope: provider.config.scopes.join(' '),
            state: this.generateState(),
            nonce: this.generateNonce()
        });

        if (provider.config.authority) {
            params.append('authority', provider.config.authority);
        }

        // Store state and nonce for verification
        sessionStorage.setItem('sso_state', params.get('state'));
        sessionStorage.setItem('sso_nonce', params.get('nonce'));

        // Redirect to OIDC provider
        const authUrl = `${provider.config.authority || 'https://accounts.google.com/o/oauth2/v2/auth'}?${params.toString()}`;
        window.location.href = authUrl;
    }

    async initiateSAML(provider) {
        // Generate SAML request
        const samlRequest = await this.generateSAMLRequest(provider);
        
        // Redirect to SAML provider
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = provider.config.entryPoint;
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'SAMLRequest';
        input.value = samlRequest;
        
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    }

    // SCIM Methods
    async provisionUser(userData) {
        if (!this.scimConfig.enabled) {
            throw new Error('SCIM provisioning not enabled');
        }

        try {
            const scimUser = this.mapToSCIMUser(userData);
            
            const response = await fetch(this.scimConfig.endpoint + '/Users', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.scimConfig.token}`,
                    'Content-Type': 'application/scim+json'
                },
                body: JSON.stringify(scimUser)
            });

            if (!response.ok) {
                throw new Error(`SCIM provisioning failed: ${response.statusText}`);
            }

            const result = await response.json();
            return result;

        } catch (error) {
            console.error('❌ SCIM user provisioning failed:', error);
            throw error;
        }
    }

    async deprovisionUser(userId) {
        if (!this.scimConfig.enabled) {
            throw new Error('SCIM provisioning not enabled');
        }

        try {
            const response = await fetch(`${this.scimConfig.endpoint}/Users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.scimConfig.token}`
                }
            });

            if (!response.ok) {
                throw new Error(`SCIM deprovisioning failed: ${response.statusText}`);
            }

            return { success: true };

        } catch (error) {
            console.error('❌ SCIM user deprovisioning failed:', error);
            throw error;
        }
    }

    // Passkey Methods
    async registerPasskey(userId) {
        if (!this.passkeyConfig.enabled) {
            throw new Error('Passkeys not enabled');
        }

        try {
            const user = await this.db.collection('users').doc(userId).get();
            const userData = user.data();

            const publicKeyOptions = {
                challenge: this.generateChallenge(),
                rp: this.passkeyConfig.relyingParty,
                user: {
                    id: userId,
                    name: userData.email,
                    displayName: userData.name || userData.email
                },
                pubKeyCredParams: [
                    { type: 'public-key', alg: -7 }, // ES256
                    { type: 'public-key', alg: -257 } // RS256
                ],
                authenticatorSelection: this.passkeyConfig.authenticatorSelection,
                timeout: this.passkeyConfig.timeout,
                attestation: this.passkeyConfig.attestation
            };

            const credential = await navigator.credentials.create({
                publicKey: publicKeyOptions
            });

            // Store passkey data
            await this.storePasskeyData(userId, credential);

            return { success: true, credential };

        } catch (error) {
            console.error('❌ Passkey registration failed:', error);
            throw error;
        }
    }

    async authenticateWithPasskey() {
        if (!this.passkeyConfig.enabled) {
            throw new Error('Passkeys not enabled');
        }

        try {
            const publicKeyOptions = {
                challenge: this.generateChallenge(),
                rpId: this.passkeyConfig.relyingParty.id,
                userVerification: this.passkeyConfig.userVerification,
                timeout: this.passkeyConfig.timeout
            };

            const assertion = await navigator.credentials.get({
                publicKey: publicKeyOptions
            });

            // Verify passkey and authenticate user
            const userId = await this.verifyPasskeyAssertion(assertion);
            return await this.authenticateUser(userId);

        } catch (error) {
            console.error('❌ Passkey authentication failed:', error);
            throw error;
        }
    }

    // Utility Methods
    generateState() {
        return Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    generateNonce() {
        return Array.from(crypto.getRandomValues(new Uint8Array(16)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    generateChallenge() {
        return crypto.getRandomValues(new Uint8Array(32));
    }

    mapToSCIMUser(userData) {
        const mapping = this.scimConfig.mappings.user;
        const scimUser = {
            schemas: ['urn:ietf:params:scim:schemas:core:2.0:User'],
            userName: userData[mapping.userName],
            name: {
                givenName: userData[mapping['name.givenName']],
                familyName: userData[mapping['name.familyName']]
            },
            emails: [{
                value: userData[mapping['emails[0].value']],
                primary: true
            }],
            active: userData[mapping.active]
        };

        if (userData[mapping['phoneNumbers[0].value']]) {
            scimUser.phoneNumbers = [{
                value: userData[mapping['phoneNumbers[0].value']],
                type: 'work'
            }];
        }

        return scimUser;
    }

    async storePasskeyData(userId, credential) {
        const passkeyData = {
            userId: userId,
            credentialId: Array.from(new Uint8Array(credential.rawId))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(''),
            publicKey: Array.from(new Uint8Array(credential.response.getPublicKey()))
                .map(b => b.toString(16).padStart(2, '0'))
                .join(''),
            signCount: credential.response.signCount,
            createdAt: new Date()
        };

        await this.db.collection('passkeys').doc(userId).set(passkeyData);
    }

    async verifyPasskeyAssertion(assertion) {
        // Verify the assertion and return user ID
        // This is a simplified implementation
        const credentialId = Array.from(new Uint8Array(assertion.rawId))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        const passkeyDoc = await this.db.collection('passkeys')
            .where('credentialId', '==', credentialId)
            .limit(1)
            .get();

        if (passkeyDoc.empty) {
            throw new Error('Invalid passkey');
        }

        return passkeyDoc.docs[0].data().userId;
    }

    async authenticateUser(userId) {
        // Create custom token for the user
        const customToken = await this.auth.createCustomToken(userId);
        return await this.auth.signInWithCustomToken(customToken);
    }

    setupAuthListeners() {
        this.auth.onAuthStateChanged(async (user) => {
            this.currentUser = user;
            if (user) {
                console.log('🔐 User authenticated:', user.email);
                await this.logAuthEvent('login', user.uid);
            } else {
                console.log('🔐 User signed out');
                await this.logAuthEvent('logout', null);
            }
        });
    }

    async logAuthEvent(event, userId) {
        try {
            await this.db.collection('auth_logs').add({
                event: event,
                userId: userId,
                timestamp: new Date(),
                ipAddress: await this.getClientIP(),
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error('❌ Failed to log auth event:', error);
        }
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // Configuration Methods
    async configureSSO(providerId, config) {
        try {
            const provider = this.ssoProviders.get(providerId);
            if (!provider) {
                throw new Error(`Unknown SSO provider: ${providerId}`);
            }

            provider.enabled = config.enabled;
            provider.config = { ...provider.config, ...config.config };

            // Save to database
            await this.saveSSOConfiguration();

            return { success: true };

        } catch (error) {
            console.error('❌ SSO configuration failed:', error);
            throw error;
        }
    }

    async configureSCIM(config) {
        try {
            this.scimConfig = { ...this.scimConfig, ...config };

            // Save to database
            await this.db.collection('system_config').doc('scim').set(this.scimConfig);

            return { success: true };

        } catch (error) {
            console.error('❌ SCIM configuration failed:', error);
            throw error;
        }
    }

    async configurePasskeys(config) {
        try {
            this.passkeyConfig = { ...this.passkeyConfig, ...config };

            // Save to database
            await this.db.collection('system_config').doc('passkeys').set(this.passkeyConfig);

            return { success: true };

        } catch (error) {
            console.error('❌ Passkey configuration failed:', error);
            throw error;
        }
    }

    async saveSSOConfiguration() {
        const config = {
            providers: {}
        };

        for (const [providerId, provider] of this.ssoProviders) {
            config.providers[providerId] = {
                enabled: provider.enabled,
                config: provider.config
            };
        }

        await this.db.collection('system_config').doc('sso').set(config);
    }

    // Getter Methods
    getSSOProviders() {
        return Array.from(this.ssoProviders.values());
    }

    getSCIMConfig() {
        return this.scimConfig;
    }

    getPasskeyConfig() {
        return this.passkeyConfig;
    }

    isSSOEnabled(providerId) {
        const provider = this.ssoProviders.get(providerId);
        return provider ? provider.enabled : false;
    }

    isSCIMEnabled() {
        return this.scimConfig.enabled;
    }

    isPasskeysEnabled() {
        return this.passkeyConfig.enabled;
    }
}

// Initialize and export
if (typeof window !== 'undefined') {
    window.enterpriseAuth = new EnterpriseAuthenticationSystem();
    console.log('🚀 Enterprise Authentication System loaded');
}
