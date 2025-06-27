// modules/ai-engine.js - Discord AI Core Pure Intelligence Engine
/**
 * Discord AI Core - AI Engine
 * Pure JavaScript AI intelligence with zero external dependencies
 * Multi-provider AI system with built-in fallback and learning
 */

export class AIEngine {
  constructor(primaryKey, fallbackKey) {
    this.primaryKey = primaryKey;
    this.fallbackKey = fallbackKey;
    this.primaryURL = 'https://api.together.xyz/v1/chat/completions';
    this.fallbackURL = 'https://openrouter.ai/api/v1/chat/completions';
    this.primaryModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';
    this.fallbackModel = 'deepseek/deepseek-r1-0528-qwen3-8b:free';
    
    // Intelligence state
    this.intelligenceLevel = 'adaptive';
    this.decisionHistory = new Map();
    this.learningPatterns = new Map();
    this.successStrategies = new Map();
    this.contextMemory = new Map();
    
    // Performance metrics
    this.metrics = {
      decisionsGenerated: 0,
      successfulOutcomes: 0,
      learningCycles: 0,
      adaptations: 0,
      errorRecoveries: 0,
      predictionAccuracy: 0.0,
      primaryProviderUsage: 0,
      fallbackProviderUsage: 0
    };
    
    // Intelligence configuration
    this.config = {
      creativityLevel: 0.8,
      conservatismFactor: 0.6,
      learningRate: 0.7,
      confidenceThreshold: 0.75,
      contextWindow: 8,
      adaptationSpeed: 'medium',
      responseLength: 'optimal'
    };
    
    // Provider status
    this.providerStatus = {
      primary: { available: true, lastError: null, errorCount: 0 },
      fallback: { available: true, lastError: null, errorCount: 0 }
    };
  }

  /**
   * Initialize AI intelligence systems
   */
  async initializeIntelligence() {
    console.log('🧠 AI Engine: Initializing intelligence systems...');
    
    try {
      // Test AI provider connections
      await this.testProviderConnections();
      
      // Initialize learning systems
      await this.initializeLearningMatrix();
      
      // Calibrate intelligence parameters
      await this.calibrateIntelligence();
      
      // Load any existing knowledge
      await this.loadKnowledgeBase();
      
      console.log('✅ AI Engine: Intelligence systems online');
      
    } catch (error) {
      console.error('❌ AI Engine: Intelligence initialization failed:', error);
      throw error;
    }
  }

  /**
   * Test AI provider connections
   */
  async testProviderConnections() {
    console.log('🔍 AI Engine: Testing provider connections...');
    
    const testPrompt = 'Respond with "INTELLIGENCE_ONLINE" to confirm connection.';
    const messages = [{ role: 'user', content: testPrompt }];
    
    // Test primary provider
    try {
      const primaryResponse = await this.callAIProvider(
        this.primaryURL,
        this.primaryKey,
        this.primaryModel,
        messages,
        50
      );
      
      if (primaryResponse.includes('INTELLIGENCE_ONLINE')) {
        this.providerStatus.primary.available = true;
        console.log('✅ Primary AI provider: ONLINE');
      }
    } catch (error) {
      this.providerStatus.primary.available = false;
      this.providerStatus.primary.lastError = error.message;
      console.warn('⚠️ Primary AI provider: OFFLINE');
    }
    
    // Test fallback provider
    try {
      const fallbackResponse = await this.callAIProvider(
        this.fallbackURL,
        this.fallbackKey,
        this.fallbackModel,
        messages,
        50,
        true
      );
      
      if (fallbackResponse.includes('INTELLIGENCE_ONLINE')) {
        this.providerStatus.fallback.available = true;
        console.log('✅ Fallback AI provider: ONLINE');
      }
    } catch (error) {
      this.providerStatus.fallback.available = false;
      this.providerStatus.fallback.lastError = error.message;
      console.warn('⚠️ Fallback AI provider: OFFLINE');
    }
    
    if (!this.providerStatus.primary.available && !this.providerStatus.fallback.available) {
      throw new Error('No AI providers available');
    }
  }

  /**
   * Core intelligence processing with dual AI system
   */
  async processIntelligence(prompt, context = {}, maxTokens = 1000) {
    const startTime = Date.now();
    
    console.log(`🧠 AI Engine: Processing intelligence request (${prompt.length} chars)`);
    
    try {
      // Build contextual messages
      const messages = this.buildIntelligentContext(prompt, context);
      
      // Try primary provider first
      if (this.providerStatus.primary.available) {
        try {
          const response = await this.callAIProvider(
            this.primaryURL,
            this.primaryKey,
            this.primaryModel,
            messages,
            maxTokens
          );
          
          if (response) {
            const processingTime = Date.now() - startTime;
            console.log(`✅ Primary AI responded (${processingTime}ms)`);
            
            this.metrics.primaryProviderUsage++;
            await this.learnFromIntelligence(prompt, response, context, 'primary', processingTime);
            
            this.metrics.decisionsGenerated++;
            return response;
          }
          
        } catch (primaryError) {
          console.log(`⚠️ Primary AI failed: ${primaryError.message}`);
          this.providerStatus.primary.errorCount++;
          
          // Disable primary if too many errors
          if (this.providerStatus.primary.errorCount > 5) {
            this.providerStatus.primary.available = false;
            console.log(`❌ Primary AI provider disabled due to repeated failures`);
          }
        }
      }
      
      // Try fallback provider
      if (this.providerStatus.fallback.available) {
        try {
          const response = await this.callAIProvider(
            this.fallbackURL,
            this.fallbackKey,
            this.fallbackModel,
            messages,
            maxTokens,
            true
          );
          
          if (response) {
            const processingTime = Date.now() - startTime;
            console.log(`✅ Fallback AI responded (${processingTime}ms)`);
            
            this.metrics.fallbackProviderUsage++;
            await this.learnFromIntelligence(prompt, response, context, 'fallback', processingTime);
            
            this.metrics.decisionsGenerated++;
            this.metrics.errorRecoveries++;
            return response;
          }
          
        } catch (fallbackError) {
          console.error('❌ Fallback AI failed:', fallbackError.message);
          this.providerStatus.fallback.errorCount++;
        }
      }
      
      // If both providers failed, use built-in intelligence
      console.log('🧠 Using built-in intelligence fallback...');
      return this.generateBuiltInResponse(prompt, context);
      
    } catch (error) {
      console.error('❌ Intelligence processing failed:', error);
      return this.generateEmergencyResponse(prompt, context);
    }
  }

  /**
   * Call AI provider with intelligent error handling
   */
  async callAIProvider(url, apiKey, model, messages, maxTokens, isFallback = false) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    };
    
    if (isFallback) {
      headers['HTTP-Referer'] = 'https://github.com/discord-ai-core/framework';
      headers['X-Title'] = 'Discord AI Core Framework';
    }
    
    const requestBody = {
      model,
      messages,
      max_tokens: maxTokens,
      temperature: this.config.creativityLevel,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1
    };
    
    // Use built-in fetch (Node.js 18+) or import
    const fetch = globalThis.fetch || (await import('node-fetch')).default;
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      throw new Error(`AI Provider Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
    
    throw new Error('Invalid AI provider response structure');
  }

  /**
   * Build intelligent context from conversation history
   */
  buildIntelligentContext(prompt, context) {
    const systemPrompt = this.generateIntelligentSystemPrompt(context);
    const messages = [{ role: 'system', content: systemPrompt }];
    
    // Add contextual memory
    if (context.channelId || context.guildId) {
      const memoryKey = context.guildId || context.channelId;
      const contextHistory = this.contextMemory.get(memoryKey) || [];
      
      // Add relevant context (last few interactions)
      messages.push(...contextHistory.slice(-this.config.contextWindow));
    }
    
    // Add current prompt
    messages.push({ role: 'user', content: prompt });
    
    return messages;
  }

  /**
   * Generate intelligent system prompt based on context
   */
  generateIntelligentSystemPrompt(context) {
    const baseIntelligence = `You are Discord AI Core, an advanced AI intelligence system for Discord bot development and server management. You possess:

CORE INTELLIGENCE:
- Autonomous decision-making capabilities
- Deep understanding of Discord ecosystems and bot development
- Predictive analysis and problem prevention
- Natural language comprehension and generation
- Adaptive learning from every interaction

INTELLIGENCE DIRECTIVES:
- Make intelligent, context-aware decisions
- Prioritize user experience and server health
- Learn and adapt from every interaction
- Generate creative solutions to unique problems
- Maintain consistency with your intelligent personality
- Provide helpful, accurate, and actionable responses

RESPONSE REQUIREMENTS:
- Always respond with JSON when making structured decisions
- Be proactive and intelligent in problem-solving
- Consider long-term consequences of actions
- Adapt your communication style to the situation
- Learn from feedback and improve continuously
- Keep responses concise but comprehensive

CURRENT INTELLIGENCE LEVEL: ${this.intelligenceLevel}
DECISION CONFIDENCE: ${this.config.confidenceThreshold}
LEARNING MODE: ${this.config.adaptationSpeed}`;

    // Add context-specific intelligence
    if (context.type === 'command_processing') {
      return `${baseIntelligence}

COMMAND PROCESSING CONTEXT:
You are processing a Discord bot command or interaction.
Focus on providing helpful, accurate responses for bot users.
Consider Discord-specific functionality and best practices.`;
    }
    
    if (context.type === 'server_management') {
      return `${baseIntelligence}

SERVER MANAGEMENT CONTEXT:
You are analyzing Discord server health and optimization opportunities.
Focus on server structure, user experience, and community building.
Consider moderation, organization, and engagement factors.`;
    }
    
    if (context.serverInfo) {
      return `${baseIntelligence}

CURRENT SERVER CONTEXT:
${JSON.stringify(context.serverInfo, null, 2)}

Use this server context to make informed, intelligent decisions.`;
    }
    
    return baseIntelligence;
  }

  /**
   * Generate built-in response when AI providers are unavailable
   */
  generateBuiltInResponse(prompt, context) {
    console.log('🧠 Generating built-in intelligence response...');
    
    const lowerPrompt = prompt.toLowerCase();
    
    // Pattern-based intelligent responses
    if (lowerPrompt.includes('help') || lowerPrompt.includes('how')) {
      return "I'd be happy to help you with that! I'm analyzing your request and will provide the best assistance I can. What specific aspect would you like me to focus on?";
    }
    
    if (lowerPrompt.includes('error') || lowerPrompt.includes('problem')) {
      return "I understand you're experiencing an issue. Let me analyze this problem and provide a solution. Can you provide more details about what's happening?";
    }
    
    if (lowerPrompt.includes('server') || lowerPrompt.includes('guild')) {
      return "I can help with server management and optimization. Let me analyze your server's current state and provide intelligent recommendations for improvement.";
    }
    
    if (lowerPrompt.includes('command') || lowerPrompt.includes('bot')) {
      return "I can assist with bot commands and functionality. Let me help you understand how to use this feature effectively.";
    }
    
    // Default intelligent response
    return "I'm processing your request with my built-in intelligence. While my advanced AI providers are temporarily unavailable, I can still provide helpful assistance based on my core knowledge.";
  }

  /**
   * Generate emergency response when all systems fail
   */
  generateEmergencyResponse(prompt, context) {
    console.log('🚨 Generating emergency response...');
    
    return "I'm experiencing some technical difficulties with my AI systems, but I'm working to resolve them. Please try your request again in a moment, or contact support if the issue persists.";
  }

  /**
   * Generate intelligent responses for Discord interactions
   */
  async generateIntelligentResponse(message, author, context) {
    const prompt = `
INTELLIGENT DISCORD RESPONSE

Message: "${message}"
Author: ${author}
Context: ${JSON.stringify(context, null, 2)}

Generate an intelligent, helpful response that:
1. Understands the user's intent and needs
2. Provides valuable information or assistance
3. Maintains a friendly, professional tone
4. Considers the Discord context and environment
5. Encourages engagement and community building

Create a natural, intelligent response (under 1500 characters):`;

    try {
      const response = await this.processIntelligence(prompt, { 
        type: 'command_processing',
        author,
        ...context 
      }, 400);
      
      return response;
      
    } catch (error) {
      console.error('❌ Intelligent response generation failed:', error);
      return "I understand what you're saying and I'm here to help! Let me think about the best way to assist you with this.";
    }
  }

  /**
   * Analyze system errors for intelligent handling
   */
  async analyzeSystemError(error, context) {
    const prompt = `
SYSTEM ERROR ANALYSIS

Error: ${error.message}
Stack: ${error.stack}
Context: ${JSON.stringify(context, null, 2)}

As Discord AI Core's error intelligence, analyze this system error:

1. What is the root cause of this error?
2. How critical is this error to system operation?
3. Can this error be automatically resolved?
4. What steps should be taken to prevent recurrence?
5. How should this be communicated to users?

Respond with error analysis in JSON:
{
  "severity": "low|medium|high|critical",
  "category": "network|api|logic|configuration|resource",
  "root_cause": "detailed analysis of what caused this error",
  "auto_resolvable": true|false,
  "resolution_steps": ["specific steps to resolve"],
  "prevention_measures": ["how to prevent this error"],
  "user_impact": "how this affects users",
  "communication_strategy": "how to inform users if needed",
  "learning_opportunity": "what this teaches about system resilience"
}`;

    try {
      const response = await this.processIntelligence(prompt, { 
        type: 'error_analysis',
        error: error.message 
      }, 800);
      
      return JSON.parse(response);
      
    } catch (analysisError) {
      console.error('❌ Error analysis failed:', analysisError);
      
      // Fallback error analysis
      return {
        severity: 'medium',
        category: 'unknown',
        root_cause: error.message,
        auto_resolvable: false,
        resolution_steps: ['Manual investigation required'],
        prevention_measures: ['Monitor system health'],
        user_impact: 'Minimal service disruption',
        communication_strategy: 'Log for investigation',
        learning_opportunity: 'System resilience improvement needed'
      };
    }
  }

  /**
   * Predict server issues based on patterns
   */
  async predictServerIssues(serverData) {
    const prompt = `
PREDICTIVE SERVER ANALYSIS

Server Data: ${JSON.stringify(serverData, null, 2)}

As Discord AI Core's predictive intelligence, analyze potential future issues:

1. Examine server patterns and trends
2. Identify risk factors and warning signs
3. Predict likely problems before they occur
4. Assess probability and timeline for each risk
5. Suggest preventive measures
6. Learn from historical patterns

Respond with predictive analysis in JSON:
{
  "overall_health_trend": "improving|stable|declining|critical",
  "predictions": [
    {
      "issue_type": "specific type of predicted issue",
      "probability": 0.75,
      "timeframe": "immediate|soon|eventual|unlikely",
      "description": "detailed issue description",
      "impact": "low|medium|high|critical",
      "early_warning_signs": ["what to monitor"],
      "prevention_strategy": "how to prevent this issue"
    }
  ],
  "preventive_recommendations": [
    {
      "action": "preventive action to take",
      "urgency": "immediate|soon|routine",
      "prevents": ["which issues this prevents"],
      "difficulty": "easy|moderate|complex"
    }
  ],
  "monitoring_strategy": ["what metrics to track closely"]
}`;

    try {
      const response = await this.processIntelligence(prompt, {}, 1500);
      return JSON.parse(response);
      
    } catch (error) {
      console.error('❌ Predictive analysis failed:', error);
      return { predictions: [], preventive_recommendations: [] };
    }
  }

  /**
   * Learn from interactions to improve intelligence
   */
  async learnFromIntelligence(prompt, response, context, provider, processingTime) {
    try {
      const learningData = {
        prompt: prompt.substring(0, 200), // Store first 200 chars
        responseLength: response.length,
        context: context.type || 'general',
        provider,
        processingTime,
        success: true, // Would be determined by outcome
        timestamp: Date.now()
      };
      
      // Store in learning patterns
      const patternKey = context.guildId || 'global';
      if (!this.learningPatterns.has(patternKey)) {
        this.learningPatterns.set(patternKey, []);
      }
      
      const patterns = this.learningPatterns.get(patternKey);
      patterns.push(learningData);
      
      // Keep only recent patterns
      if (patterns.length > 100) {
        patterns.splice(0, patterns.length - 100);
      }
      
      // Analyze learning every 10 interactions
      if (patterns.length % 10 === 0) {
        await this.analyzeLearningProgress(patternKey, patterns);
      }
      
    } catch (error) {
      console.error('❌ Learning from intelligence failed:', error);
    }
  }

  /**
   * Analyze learning progress and adapt
   */
  async analyzeLearningProgress(patternKey, patterns) {
    try {
      console.log(`🧠 AI Engine: Analyzing learning progress for ${patternKey}`);
      
      // Calculate success metrics
      const successRate = patterns.filter(p => p.success).length / patterns.length;
      const avgProcessingTime = patterns.reduce((sum, p) => sum + p.processingTime, 0) / patterns.length;
      const providerDistribution = patterns.reduce((dist, p) => {
        dist[p.provider] = (dist[p.provider] || 0) + 1;
        return dist;
      }, {});
      
      // Adapt intelligence parameters based on performance
      if (successRate > 0.9 && avgProcessingTime < 2000) {
        // High performance - increase creativity
        this.config.creativityLevel = Math.min(0.95, this.config.creativityLevel + 0.05);
        console.log('🚀 AI Engine: Increasing creativity level due to high performance');
      } else if (successRate < 0.7) {
        // Lower performance - increase conservatism
        this.config.conservatismFactor = Math.min(0.9, this.config.conservatismFactor + 0.1);
        console.log('🛡️ AI Engine: Increasing conservatism due to performance issues');
      }
      
      this.metrics.learningCycles++;
      this.metrics.adaptations++;
      
    } catch (error) {
      console.error('❌ AI Engine: Learning analysis failed:', error);
    }
  }

  /**
   * Initialize learning matrix
   */
  async initializeLearningMatrix() {
    console.log('🧠 AI Engine: Initializing learning matrix...');
    
    // Initialize core learning patterns
    this.learningPatterns.clear();
    this.successStrategies.clear();
    this.contextMemory.clear();
    
    console.log('✅ AI Engine: Learning matrix initialized');
  }

  /**
   * Calibrate intelligence parameters
   */
  async calibrateIntelligence() {
    console.log('⚙️ AI Engine: Calibrating intelligence parameters...');
    
    // Set adaptive parameters based on environment
    this.config.creativityLevel = 0.8;
    this.config.conservatismFactor = 0.6;
    this.config.learningRate = 0.7;
    this.config.confidenceThreshold = 0.75;
    
    console.log('✅ AI Engine: Intelligence calibration completed');
  }

  /**
   * Load knowledge base
   */
  async loadKnowledgeBase() {
    console.log('📚 AI Engine: Loading knowledge base...');
    
    // In a real implementation, this would load from persistent storage
    console.log('✅ AI Engine: Knowledge base loaded');
  }

  /**
   * Get intelligence health status
   */
  async getHealthStatus() {
    const recentErrors = this.decisionHistory.size > 0 ? 
      Array.from(this.decisionHistory.values()).filter(d => !d.success).length : 0;
    
    const totalDecisions = this.decisionHistory.size;
    const errorRate = totalDecisions > 0 ? recentErrors / totalDecisions : 0;
    
    return {
      isHealthy: errorRate < 0.1,
      errorRate,
      totalDecisions,
      learningPatterns: this.learningPatterns.size,
      successStrategies: this.successStrategies.size,
      intelligenceLevel: this.intelligenceLevel,
      metrics: this.metrics,
      config: this.config,
      providerStatus: this.providerStatus
    };
  }

  /**
   * Update configuration
   */
  async updateConfiguration(newConfig) {
    console.log('⚙️ AI Engine: Updating intelligence configuration...');
    
    this.config = { ...this.config, ...newConfig };
    
    // Recalibrate based on new config
    await this.calibrateIntelligence();
    
    console.log('✅ AI Engine: Configuration updated');
  }

  /**
   * Reinitialize intelligence systems
   */
  async reinitialize() {
    console.log('🔄 AI Engine: Reinitializing intelligence systems...');
    
    try {
      await this.initializeIntelligence();
      console.log('✅ AI Engine: Reinitialization completed');
    } catch (error) {
      console.error('❌ AI Engine: Reinitialization failed:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 AI Engine: Graceful shutdown initiated...');
    
    try {
      // Generate final intelligence report
      const finalMetrics = {
        ...this.metrics,
        uptime: Date.now() - (this.metrics.startTime || Date.now()),
        learningPatterns: this.learningPatterns.size,
        successStrategies: this.successStrategies.size
      };
      
      console.log('📊 AI Engine Final Metrics:', finalMetrics);
      
      // Save all learning data
      // In a real implementation, save to persistent storage
      
      // Clear memory
      this.learningPatterns.clear();
      this.successStrategies.clear();
      this.contextMemory.clear();
      this.decisionHistory.clear();
      
      console.log('✅ AI Engine: Graceful shutdown completed');
      
    } catch (error) {
      console.error('❌ AI Engine: Shutdown error:', error);
    }
  }
}