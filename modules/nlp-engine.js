// modules/nlp-engine.js - Discord AI Core Natural Language Processing Engine
/**
 * NLP Engine - Advanced natural language understanding
 * Processes natural language commands and conversations
 * Pure JavaScript implementation with AI integration
 */

export class NLPEngine {
  constructor(aiEngine) {
    this.ai = aiEngine;
    
    // NLP intelligence
    this.intentPatterns = new Map();
    this.contextMemory = new Map();
    this.conversationFlows = new Map();
    this.userProfiles = new Map();
    
    // Language understanding
    this.languageModels = {
      intentClassification: 'active',
      entityExtraction: 'active',
      sentimentAnalysis: 'active',
      contextualUnderstanding: 'active'
    };
    
    // Learning metrics
    this.metrics = {
      messagesAnalyzed: 0,
      intentsDetected: 0,
      contextualResponses: 0,
      learningCycles: 0,
      accuracyScore: 0.0
    };
    
    // NLP configuration
    this.config = {
      confidenceThreshold: 0.75,
      contextWindowSize: 5,
      learningRate: 0.8,
      adaptationSpeed: 'high',
      personalityConsistency: 0.9
    };
    
    // Initialize built-in patterns
    this.initializeBuiltInPatterns();
  }

  /**
   * Initialize natural language processing systems
   */
  async initialize() {
    console.log('🗣️ NLP Engine: Initializing natural language processing...');
    
    try {
      // Initialize language understanding models
      await this.initializeLanguageModels();
      
      // Load conversation patterns
      await this.loadConversationPatterns();
      
      // Initialize context tracking
      this.initializeContextTracking();
      
      console.log('✅ NLP Engine: Natural language processing ready');
      
    } catch (error) {
      console.error('❌ NLP Engine: Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize built-in intent patterns
   */
  initializeBuiltInPatterns() {
    console.log('🧠 NLP Engine: Loading built-in patterns...');
    
    // Admin command patterns
    this.intentPatterns.set('admin_commands', [
      {
        pattern: /dm (users?|everyone|all)/i,
        intent: 'mass_dm',
        confidence: 0.9,
        category: 'server_management'
      },
      {
        pattern: /(create|make|add) (channel|role)/i,
        intent: 'create_resource',
        confidence: 0.8,
        category: 'server_management'
      },
      {
        pattern: /(ban|kick|remove) (user|member)/i,
        intent: 'user_moderation',
        confidence: 0.9,
        category: 'moderation'
      },
      {
        pattern: /(change|update|set) (server|guild) (logo|icon|name)/i,
        intent: 'server_customization',
        confidence: 0.8,
        category: 'customization'
      },
      {
        pattern: /(organize|fix|improve|optimize) (server|channels|roles)/i,
        intent: 'server_improvement',
        confidence: 0.7,
        category: 'optimization'
      },
      {
        pattern: /(setup|configure|enable) (moderation|automation)/i,
        intent: 'automation_setup',
        confidence: 0.8,
        category: 'automation'
      }
    ]);
    
    // User support patterns
    this.intentPatterns.set('user_support', [
      {
        pattern: /(help|support|assist)/i,
        intent: 'general_help',
        confidence: 0.8,
        category: 'support'
      },
      {
        pattern: /(broken|not working|can't access|error)/i,
        intent: 'technical_issue',
        confidence: 0.9,
        category: 'technical_support'
      },
      {
        pattern: /(how do i|where is|how to)/i,
        intent: 'guidance_request',
        confidence: 0.7,
        category: 'guidance'
      },
      {
        pattern: /(permission denied|access denied|can't see)/i,
        intent: 'permission_issue',
        confidence: 0.9,
        category: 'permissions'
      }
    ]);
    
    // Conversation patterns
    this.intentPatterns.set('conversation', [
      {
        pattern: /(hello|hi|hey|greetings)/i,
        intent: 'greeting',
        confidence: 0.9,
        category: 'social'
      },
      {
        pattern: /(thanks|thank you|thx)/i,
        intent: 'gratitude',
        confidence: 0.8,
        category: 'social'
      },
      {
        pattern: /(what|who|when|where|why|how)/i,
        intent: 'question',
        confidence: 0.6,
        category: 'inquiry'
      }
    ]);
    
    console.log(`✅ Loaded ${this.intentPatterns.size} pattern categories`);
  }

  /**
   * Analyze intent with advanced NLP
   */
  async analyzeIntent(message, author, channelId, context = {}) {
    console.log(`🧠 NLP Engine: Analyzing intent for: "${message.substring(0, 50)}..."`);
    
    this.metrics.messagesAnalyzed++;
    
    try {
      // Multi-layer intent analysis
      const primaryAnalysis = await this.performPrimaryIntentAnalysis(message, author, context);
      const contextualAnalysis = await this.performContextualAnalysis(message, channelId, context);
      const sentimentAnalysis = await this.performSentimentAnalysis(message, author);
      const entityAnalysis = await this.performEntityExtraction(message, context);
      
      // Combine analyses for comprehensive understanding
      const intentResult = await this.synthesizeIntentAnalysis({
        primary: primaryAnalysis,
        contextual: contextualAnalysis,
        sentiment: sentimentAnalysis,
        entities: entityAnalysis,
        originalMessage: message,
        author,
        channelId
      });
      
      // Store conversation context
      this.storeConversationContext(channelId, author, message, intentResult);
      
      // Learn from this analysis
      await this.learnFromIntentAnalysis(message, intentResult, context);
      
      this.metrics.intentsDetected++;
      
      return intentResult;
      
    } catch (error) {
      console.error('❌ NLP Engine: Intent analysis failed:', error);
      
      // Fallback intent analysis
      return this.fallbackIntentAnalysis(message, author, channelId, context);
    }
  }

  /**
   * Perform primary intent analysis with AI
   */
  async performPrimaryIntentAnalysis(message, author, context) {
    const analysisPrompt = `
PRIMARY INTENT ANALYSIS

Message: "${message}"
Author: ${author}
Context: ${JSON.stringify(context, null, 2)}

As Discord AI Core's natural language intelligence, perform deep intent analysis:

1. Identify the primary intent and purpose
2. Determine the type of interaction this represents
3. Assess the urgency and importance
4. Identify any implicit requests or needs
5. Consider the author's likely emotional state
6. Evaluate the complexity of the request

Respond with detailed intent analysis in JSON:
{
  "primary_intent": "clear description of main intent",
  "intent_type": "admin_command|user_support|conversation|question|request|complaint|suggestion",
  "confidence": 0.95,
  "complexity": "simple|moderate|complex|multi_part",
  "urgency": "low|normal|high|urgent",
  "emotional_context": "neutral|frustrated|excited|confused|angry|happy",
  "implicit_needs": ["underlying needs not explicitly stated"],
  "action_required": true|false,
  "response_style": "professional|casual|empathetic|technical|creative",
  "priority_level": 1-10
}`;

    try {
      const response = await this.ai.processIntelligence(analysisPrompt, context, 800);
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Primary intent analysis failed:', error);
      return this.generateFallbackIntent(message, author);
    }
  }

  /**
   * Perform contextual analysis
   */
  async performContextualAnalysis(message, channelId, context) {
    const conversationHistory = this.getRecentHistory(channelId, 3);
    
    const contextPrompt = `
CONTEXTUAL ANALYSIS

Current Message: "${message}"
Recent Conversation: ${JSON.stringify(conversationHistory, null, 2)}
Channel Context: ${JSON.stringify(context, null, 2)}

Analyze how context affects the meaning and intent:

1. How does conversation history change the interpretation?
2. What context clues modify the intent?
3. Are there references to previous discussions?
4. What conversational patterns are emerging?
5. How should context influence the response?

Respond with contextual analysis in JSON:
{
  "context_influence": "how context changes interpretation",
  "conversation_flow": "natural|interrupted|continuing|new_topic",
  "references": ["what the message references from context"],
  "modified_intent": "how context changes the primary intent",
  "response_continuity": "how response should connect to context",
  "conversation_type": "ongoing|followup|new|clarification"
}`;

    try {
      const response = await this.ai.processIntelligence(contextPrompt, { channelId }, 600);
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Contextual analysis failed:', error);
      return {
        context_influence: 'minimal',
        conversation_flow: 'natural',
        modified_intent: 'none',
        conversation_type: 'new'
      };
    }
  }

  /**
   * Perform sentiment analysis
   */
  async performSentimentAnalysis(message, author) {
    const sentimentPrompt = `
SENTIMENT ANALYSIS

Message: "${message}"
Author: ${author}

Analyze the emotional tone and sentiment:

1. Overall emotional tone
2. Intensity of emotion
3. User's likely mental state
4. Communication style preferences
5. How to best respond to this sentiment

Respond with sentiment analysis in JSON:
{
  "primary_emotion": "neutral|happy|frustrated|angry|confused|excited|sad|anxious",
  "emotion_intensity": 0.1-1.0,
  "tone": "formal|casual|urgent|patient|demanding|polite",
  "communication_style": "direct|indirect|detailed|brief|technical|simple",
  "response_approach": "empathetic|professional|casual|technical|reassuring",
  "emotional_needs": ["what emotional needs to address"]
}`;

    try {
      const response = await this.ai.processIntelligence(sentimentPrompt, {}, 400);
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Sentiment analysis failed:', error);
      return {
        primary_emotion: 'neutral',
        emotion_intensity: 0.5,
        tone: 'casual',
        response_approach: 'professional'
      };
    }
  }

  /**
   * Perform entity extraction
   */
  async performEntityExtraction(message, context) {
    const entityPrompt = `
ENTITY EXTRACTION

Message: "${message}"
Context: ${JSON.stringify(context, null, 2)}

Extract relevant entities and their relationships:

1. Identify key entities (users, channels, roles, servers, etc.)
2. Extract action verbs and their targets
3. Identify quantities, timeframes, and specifications
4. Find implicit entities referenced by context
5. Map relationships between entities

Respond with entity analysis in JSON:
{
  "entities": [
    {
      "type": "user|channel|role|server|action|quantity|time|concept",
      "value": "extracted value",
      "confidence": 0.9,
      "context": "how this entity relates to the message"
    }
  ],
  "actions": [
    {
      "verb": "action verb",
      "target": "what the action applies to",
      "modifier": "how the action should be performed"
    }
  ],
  "relationships": ["how entities relate to each other"],
  "implicit_entities": ["entities implied but not explicitly mentioned"]
}`;

    try {
      const response = await this.ai.processIntelligence(entityPrompt, context, 600);
      return JSON.parse(response);
    } catch (error) {
      console.error('❌ Entity extraction failed:', error);
      return {
        entities: [],
        actions: [],
        relationships: [],
        implicit_entities: []
      };
    }
  }

  /**
   * Synthesize comprehensive intent analysis
   */
  async synthesizeIntentAnalysis(analyses) {
    const synthesisPrompt = `
INTENT SYNTHESIS

Primary Analysis: ${JSON.stringify(analyses.primary, null, 2)}
Contextual Analysis: ${JSON.stringify(analyses.contextual, null, 2)}
Sentiment Analysis: ${JSON.stringify(analyses.sentiment, null, 2)}
Entity Analysis: ${JSON.stringify(analyses.entities, null, 2)}

Synthesize all analyses into a comprehensive understanding:

1. Combine insights from all analysis layers
2. Resolve any conflicts between analyses
3. Determine the most appropriate response type
4. Identify the best action to take
5. Consider all contextual factors

Create final intent determination in JSON:
{
  "type": "admin_command|user_support|conversation|server_optimization_opportunity|learning_opportunity",
  "intent": "comprehensive intent description",
  "confidence": 0.95,
  "conversationType": "command|support|casual|technical|creative",
  "shouldRespond": true|false,
  "responseStyle": "professional|casual|empathetic|technical|creative",
  "actionRequired": true|false,
  "priority": "low|normal|high|urgent",
  "supportType": "technical|permissions|guidance|emotional",
  "optimizationType": "proactive|reactive|preventive",
  "originalMessage": "${analyses.originalMessage}",
  "channelId": "${analyses.channelId}",
  "reasoning": "why this interpretation is most accurate"
}`;

    try {
      const response = await this.ai.processIntelligence(synthesisPrompt, {}, 1000);
      const synthesized = JSON.parse(response);
      
      // Validate and enhance the result
      return this.validateAndEnhanceIntent(synthesized, analyses);
      
    } catch (error) {
      console.error('❌ Intent synthesis failed:', error);
      return this.createFallbackSynthesis(analyses);
    }
  }

  /**
   * Validate and enhance intent result
   */
  validateAndEnhanceIntent(synthesized, analyses) {
    // Ensure confidence is reasonable
    if (synthesized.confidence > 0.95) {
      synthesized.confidence = Math.min(0.95, synthesized.confidence);
    }
    
    // Add context from analyses
    synthesized.sentiment = analyses.sentiment.primary_emotion;
    synthesized.emotionalIntensity = analyses.sentiment.emotion_intensity;
    synthesized.conversationFlow = analyses.contextual.conversation_flow;
    synthesized.entities = analyses.entities.entities;
    
    // Enhance with additional intelligence
    synthesized.intelligenceLevel = this.calculateIntelligenceLevel(synthesized, analyses);
    synthesized.personalizedResponse = this.shouldPersonalizeResponse(synthesized, analyses);
    
    return synthesized;
  }

  /**
   * Calculate intelligence level needed for response
   */
  calculateIntelligenceLevel(synthesized, analyses) {
    let level = 'standard';
    
    if (synthesized.type === 'admin_command' && synthesized.priority === 'high') {
      level = 'advanced';
    } else if (analyses.primary.complexity === 'complex') {
      level = 'enhanced';
    } else if (analyses.sentiment.emotion_intensity > 0.8) {
      level = 'empathetic';
    }
    
    return level;
  }

  /**
   * Determine if response should be personalized
   */
  shouldPersonalizeResponse(synthesized, analyses) {
    return (
      synthesized.type === 'conversation' ||
      analyses.sentiment.emotion_intensity > 0.6 ||
      synthesized.conversationType === 'support'
    );
  }

  /**
   * Pattern matching for quick intent detection
   */
  detectPatternIntent(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, patterns] of this.intentPatterns) {
      for (const pattern of patterns) {
        if (pattern.pattern.test(message)) {
          return {
            intent: pattern.intent,
            confidence: pattern.confidence,
            category: pattern.category,
            type: category,
            method: 'pattern_matching'
          };
        }
      }
    }
    
    return null;
  }

  /**
   * Store conversation context for future reference
   */
  storeConversationContext(channelId, author, message, intentResult) {
    const contextKey = channelId;
    
    if (!this.contextMemory.has(contextKey)) {
      this.contextMemory.set(contextKey, []);
    }
    
    const history = this.contextMemory.get(contextKey);
    history.push({
      author,
      message: message.substring(0, 200), // Store first 200 chars
      intent: intentResult.intent,
      type: intentResult.type,
      timestamp: Date.now()
    });
    
    // Keep only recent context (last 10 messages)
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
  }

  /**
   * Get recent conversation history
   */
  getRecentHistory(channelId, limit = 5) {
    const history = this.contextMemory.get(channelId) || [];
    return history.slice(-limit);
  }

  /**
   * Check if user is authorized admin
   */
  isAuthorizedAdmin(author, context) {
    // Check against environment admin username
    const adminUsername = process.env.ADMIN_USERNAME?.toLowerCase();
    if (adminUsername && author.toLowerCase() === adminUsername) {
      return true;
    }
    
    // Check server owner
    if (context.serverInfo && context.serverInfo.ownerId === context.userId) {
      return true;
    }
    
    // Check administrator permissions
    if (context.permissions && (BigInt(context.permissions) & (1n << 3n)) !== 0n) {
      return true;
    }
    
    return false;
  }

  /**
   * Generate fallback intent when AI fails
   */
  generateFallbackIntent(message, author) {
    // Try pattern matching first
    const patternIntent = this.detectPatternIntent(message);
    if (patternIntent) {
      return patternIntent;
    }
    
    // Basic keyword analysis
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return {
        intent: 'help_request',
        confidence: 0.6,
        type: 'user_support',
        method: 'keyword_fallback'
      };
    }
    
    if (lowerMessage.includes('dm') || lowerMessage.includes('message')) {
      return {
        intent: 'communication_request',
        confidence: 0.5,
        type: 'admin_command',
        method: 'keyword_fallback'
      };
    }
    
    // Default to conversation
    return {
      intent: 'general_conversation',
      confidence: 0.3,
      type: 'conversation',
      method: 'default_fallback'
    };
  }

  /**
   * Create fallback synthesis when AI synthesis fails
   */
  createFallbackSynthesis(analyses) {
    return {
      type: 'conversation',
      intent: 'general_interaction',
      confidence: 0.5,
      conversationType: 'casual',
      shouldRespond: true,
      responseStyle: 'professional',
      actionRequired: false,
      priority: 'normal',
      originalMessage: analyses.originalMessage,
      channelId: analyses.channelId,
      reasoning: 'Fallback synthesis due to AI processing failure'
    };
  }

  /**
   * Learn from intent analysis to improve accuracy
   */
  async learnFromIntentAnalysis(message, intentResult, context) {
    try {
      const learningData = {
        message: message.substring(0, 100),
        intent: intentResult.intent,
        type: intentResult.type,
        confidence: intentResult.confidence,
        method: intentResult.method || 'ai_analysis',
        context: context.type || 'general',
        timestamp: Date.now(),
        success: true // Would be determined by user feedback
      };
      
      // Store learning pattern
      const patternKey = context.guildId || 'global';
      if (!this.conversationFlows.has(patternKey)) {
        this.conversationFlows.set(patternKey, []);
      }
      
      const flows = this.conversationFlows.get(patternKey);
      flows.push(learningData);
      
      // Keep recent flows
      if (flows.length > 100) {
        flows.splice(0, flows.length - 100);
      }
      
      // Analyze patterns every 20 interactions
      if (flows.length % 20 === 0) {
        await this.analyzeLearningPatterns(patternKey, flows);
      }
      
    } catch (error) {
      console.error('❌ Learning from intent analysis failed:', error);
    }
  }

  /**
   * Analyze learning patterns to improve NLP
   */
  async analyzeLearningPatterns(patternKey, flows) {
    try {
      console.log(`🧠 NLP Engine: Analyzing learning patterns for ${patternKey}`);
      
      // Calculate accuracy metrics
      const totalFlows = flows.length;
      const successfulFlows = flows.filter(f => f.success).length;
      const accuracyRate = successfulFlows / totalFlows;
      
      // Analyze confidence distribution
      const avgConfidence = flows.reduce((sum, f) => sum + f.confidence, 0) / totalFlows;
      
      // Update accuracy score
      this.metrics.accuracyScore = accuracyRate;
      this.metrics.learningCycles++;
      
      console.log(`📊 NLP Learning: ${(accuracyRate * 100).toFixed(1)}% accuracy, ${avgConfidence.toFixed(2)} avg confidence`);
      
      // Adapt configuration based on performance
      if (accuracyRate > 0.85 && avgConfidence > 0.8) {
        this.config.confidenceThreshold = Math.min(0.9, this.config.confidenceThreshold + 0.05);
      } else if (accuracyRate < 0.6) {
        this.config.confidenceThreshold = Math.max(0.5, this.config.confidenceThreshold - 0.05);
      }
      
    } catch (error) {
      console.error('❌ Learning pattern analysis failed:', error);
    }
  }

  /**
   * Initialize language models
   */
  async initializeLanguageModels() {
    console.log('🧠 NLP Engine: Initializing language models...');
    
    // Initialize each language understanding component
    this.languageModels.intentClassification = 'active';
    this.languageModels.entityExtraction = 'active';
    this.languageModels.sentimentAnalysis = 'active';
    this.languageModels.contextualUnderstanding = 'active';
    
    console.log('✅ NLP Engine: Language models initialized');
  }

  /**
   * Load conversation patterns
   */
  async loadConversationPatterns() {
    console.log('📚 NLP Engine: Loading conversation patterns...');
    
    // In a real implementation, this would load from persistent storage
    console.log('✅ NLP Engine: Conversation patterns loaded');
  }

  /**
   * Initialize context tracking
   */
  initializeContextTracking() {
    console.log('🔍 NLP Engine: Initializing context tracking...');
    
    // Clear existing context
    this.contextMemory.clear();
    this.conversationFlows.clear();
    this.userProfiles.clear();
    
    console.log('✅ NLP Engine: Context tracking initialized');
  }

  /**
   * Process user feedback to improve NLP
   */
  async processUserFeedback(messageId, feedback, correctIntent = null) {
    try {
      // Find the original analysis
      let originalAnalysis = null;
      for (const flows of this.conversationFlows.values()) {
        originalAnalysis = flows.find(f => f.messageId === messageId);
        if (originalAnalysis) break;
      }
      
      if (originalAnalysis) {
        // Update success status based on feedback
        originalAnalysis.success = feedback === 'positive';
        
        // If correct intent provided, learn from it
        if (correctIntent) {
          originalAnalysis.correctIntent = correctIntent;
          await this.learnFromCorrection(originalAnalysis, correctIntent);
        }
        
        console.log(`📝 NLP Learning: Processed ${feedback} feedback for message ${messageId}`);
      }
      
    } catch (error) {
      console.error('❌ User feedback processing failed:', error);
    }
  }

  /**
   * Learn from user corrections
   */
  async learnFromCorrection(originalAnalysis, correctIntent) {
    try {
      // Create corrective learning pattern
      const correctionPattern = {
        originalMessage: originalAnalysis.message,
        wrongIntent: originalAnalysis.intent,
        correctIntent: correctIntent,
        confidence: originalAnalysis.confidence,
        timestamp: Date.now()
      };
      
      // Store correction for future learning
      console.log(`🔄 NLP Learning: Intent correction - ${originalAnalysis.intent} → ${correctIntent}`);
      
    } catch (error) {
      console.error('❌ Learning from correction failed:', error);
    }
  }

  /**
   * Get NLP engine health status
   */
  getHealthStatus() {
    return {
      isHealthy: this.metrics.accuracyScore > 0.7,
      metrics: this.metrics,
      languageModels: this.languageModels,
      config: this.config,
      contextMemorySize: this.contextMemory.size,
      conversationFlowsSize: this.conversationFlows.size,
      intentPatternsSize: this.intentPatterns.size
    };
  }

  /**
   * Update NLP configuration
   */
  async updateConfiguration(newConfig) {
    console.log('⚙️ NLP Engine: Updating configuration...');
    
    this.config = { ...this.config, ...newConfig };
    
    console.log('✅ NLP Engine: Configuration updated');
  }

  /**
   * Update pattern recognition from enhancement
   */
  async updatePatternRecognition(parameters) {
    console.log('🔄 NLP Engine: Updating pattern recognition...');
    
    try {
      // Apply pattern recognition improvements
      if (parameters.newPatterns) {
        for (const [category, patterns] of Object.entries(parameters.newPatterns)) {
          this.intentPatterns.set(category, patterns);
        }
      }
      
      // Update confidence thresholds
      if (parameters.confidenceAdjustments) {
        this.config.confidenceThreshold = parameters.confidenceAdjustments.threshold;
      }
      
      console.log('✅ NLP Engine: Pattern recognition updated');
      
    } catch (error) {
      console.error('❌ Pattern recognition update failed:', error);
    }
  }

  /**
   * Reinitialize NLP engine
   */
  async reinitialize() {
    console.log('🔄 NLP Engine: Reinitializing...');
    
    try {
      await this.initialize();
      console.log('✅ NLP Engine: Reinitialization completed');
    } catch (error) {
      console.error('❌ NLP Engine: Reinitialization failed:', error);
      throw error;
    }
  }

  /**
   * Emergency shutdown
   */
  async emergencyShutdown() {
    console.log('🚨 NLP Engine: Emergency shutdown...');
    
    // Clear all memory
    this.contextMemory.clear();
    this.conversationFlows.clear();
    this.userProfiles.clear();
    this.intentPatterns.clear();
    
    console.log('✅ NLP Engine: Emergency shutdown completed');
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 NLP Engine: Graceful shutdown...');
    
    try {
      // Save learning data
      const finalMetrics = {
        ...this.metrics,
        uptime: Date.now(),
        contextMemorySize: this.contextMemory.size,
        learningPatternsSize: this.conversationFlows.size
      };
      
      console.log('📊 NLP Engine Final Metrics:', finalMetrics);
      
      // Clear memory
      this.contextMemory.clear();
      this.conversationFlows.clear();
      this.userProfiles.clear();
      
      console.log('✅ NLP Engine: Graceful shutdown completed');
      
    } catch (error) {
      console.error('❌ NLP Engine shutdown error:', error);
      await this.emergencyShutdown();
    }
  }
}
    