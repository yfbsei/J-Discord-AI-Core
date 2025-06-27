// modules/core.js - Discord AI Core Framework Main Orchestration (FIXED)
import { DiscordClient } from './discord-client.js';
import { AIEngine } from './ai-engine.js';
import { CommandHandler } from './command-handler.js';
import { ServerManager } from './server-manager.js';
import { NLPEngine } from './nlp-engine.js';
import { EventSystem } from './event-system.js';

export class DiscordCore {
  constructor(config) {
    this.config = config;
    this.version = '1.0.0';
    this.codename = 'Genesis';

    // Initialize core modules
    this.client = new DiscordClient({
      intents: this.calculateIntents(config.intents || [])
    });
    this.ai = new AIEngine(config.togetherApiKey, config.openrouterApiKey);
    this.commands = new CommandHandler(this.client, this.ai);
    this.serverManager = new ServerManager(this.client, this.ai);
    this.nlp = new NLPEngine(this.ai);
    this.events = new EventSystem();

    // Core state
    this.isActive = false;
    this.botUser = null;

    // Intelligence configuration
    this.intelligence = {
      learningMode: config.aiConfig?.learningRate || 'high',
      decisionConfidence: config.aiConfig?.decisionConfidence || 0.8,
      autonomyLevel: config.aiConfig?.mode || 'adaptive'
    };

    // Performance metrics
    this.metrics = {
      commandsExecuted: 0,
      intelligentDecisions: 0,
      serversManaged: 0,
      usersHelped: 0,
      problemsPrevented: 0,
      startTime: Date.now()
    };

    // Learning system
    this.knowledge = {
      serverPatterns: new Map(),
      userPreferences: new Map(),
      successfulStrategies: new Map(),
      commandUsage: new Map()
    };
  }

  /**
   * Initialize Discord AI Core
   */
  async initialize() {
    console.log(`🧠 Discord AI Core ${this.version} "${this.codename}" initializing...`);

    try {
      // Validate configuration
      this.validateConfiguration();

      // Initialize AI systems
      await this.ai.initializeIntelligence();
      console.log(`🧠 AI intelligence systems: ONLINE`);

      // Initialize NLP engine
      await this.nlp.initialize();
      console.log(`🗣️ Natural language processing: READY`);

      // Login to Discord using BOT TOKEN
      this.botUser = await this.client.login(this.config.botToken);
      console.log(`🤖 Discord bot connection: ESTABLISHED`);

      // Setup event handlers
      this.setupEventHandlers();
      console.log(`📡 Event handlers: CONFIGURED`);

      // Register application commands
      await this.commands.registerCommands(this.config.guildIds);
      console.log(`⚡ Application commands: REGISTERED`);

      // Initialize server management
      await this.serverManager.initialize();
      console.log(`🏗️ Server management: ACTIVE`);

      // Start autonomous systems
      this.startAutonomousSystems();
      console.log(`🤖 Autonomous systems: RUNNING`);

      this.isActive = true;
      console.log(`✅ Discord AI Core ${this.version} is now ACTIVE`);

    } catch (error) {
      console.error('❌ Discord AI Core initialization failed:', error);
      throw error;
    }
  }

  /**
   * Validate configuration
   */
  validateConfiguration() {
    if (!this.config.botToken) {
      throw new Error('BOT_TOKEN is required - Get from https://discord.com/developers/applications');
    }

    if (!this.config.botToken.startsWith('Bot ')) {
      this.config.botToken = `Bot ${this.config.botToken}`;
    }

    if (!this.config.applicationId) {
      console.warn('⚠️ APPLICATION_ID not provided, some features may be limited');
    }

    if (!this.config.togetherApiKey && !this.config.openrouterApiKey) {
      console.warn('⚠️ No AI API keys provided, AI features will be limited');
    }
  }

  /**
   * Calculate Discord intents from string array
   */
  calculateIntents(intentStrings) {
    const INTENT_FLAGS = {
      'GUILDS': 1 << 0,
      'GUILD_MEMBERS': 1 << 1,
      'GUILD_MODERATION': 1 << 2,
      'GUILD_EMOJIS_AND_STICKERS': 1 << 3,
      'GUILD_INTEGRATIONS': 1 << 4,
      'GUILD_WEBHOOKS': 1 << 5,
      'GUILD_INVITES': 1 << 6,
      'GUILD_VOICE_STATES': 1 << 7,
      'GUILD_PRESENCES': 1 << 8,
      'GUILD_MESSAGES': 1 << 9,
      'GUILD_MESSAGE_REACTIONS': 1 << 10,
      'GUILD_MESSAGE_TYPING': 1 << 11,
      'DIRECT_MESSAGES': 1 << 12,
      'DIRECT_MESSAGE_REACTIONS': 1 << 13,
      'DIRECT_MESSAGE_TYPING': 1 << 14,
      'MESSAGE_CONTENT': 1 << 15,
      'GUILD_SCHEDULED_EVENTS': 1 << 16,
      'AUTO_MODERATION_CONFIGURATION': 1 << 20,
      'AUTO_MODERATION_EXECUTION': 1 << 21
    };

    let intents = 0;
    for (const intent of intentStrings) {
      if (INTENT_FLAGS[intent]) {
        intents |= INTENT_FLAGS[intent];
      }
    }

    return intents;
  }

  /**
   * Setup Discord event handlers
   */
  setupEventHandlers() {
    // Ready event
    this.client.on('ready', async () => {
      console.log(`🟢 Bot is ready! Logged in as ${this.botUser.username}`);

      // Set bot activity
      await this.client.setPresence({
        activities: [{
          name: 'with AI intelligence',
          type: 0 // Playing
        }],
        status: 'online'
      });
    });

    // Interaction handling (slash commands, buttons, etc.)
    this.client.on('interactionCreate', async (interaction) => {
      try {
        await this.handleInteraction(interaction);
        this.metrics.commandsExecuted++;
      } catch (error) {
        console.error('❌ Interaction handling failed:', error);
        await this.handleInteractionError(interaction, error);
      }
    });

    // Message events for natural language processing
    this.client.on('messageCreate', async (message) => {
      try {
        if (message.author.bot) return;
        await this.handleMessage(message);
      } catch (error) {
        console.error('❌ Message handling failed:', error);
      }
    });

    // Guild events for server management
    this.client.on('guildCreate', async (guild) => {
      console.log(`📈 Joined new guild: ${guild.name} (${guild.member_count} members)`);
      await this.serverManager.onGuildJoin(guild);
      this.metrics.serversManaged++;
    });

    this.client.on('guildDelete', async (guild) => {
      console.log(`📉 Left guild: ${guild.name}`);
      await this.serverManager.onGuildLeave(guild);
    });

    // Error handling
    this.client.on('error', async (error) => {
      console.error('❌ Discord client error:', error);
      await this.handleSystemError(error, { source: 'discord_client' });
    });

    // Reconnection handling
    this.client.on('disconnect', () => {
      console.log('🔄 Discord connection lost, attempting to reconnect...');
    });

    this.client.on('reconnect', () => {
      console.log('✅ Discord connection restored');
    });
  }

  /**
   * Handle Discord interactions (slash commands, buttons, etc.) - FIXED
   */
  async handleInteraction(interaction) {
    // FIX: Safely access user data with fallbacks
    const userName = interaction.user?.username ||
      interaction.member?.user?.username ||
      'Unknown User';

    const userId = interaction.user?.id ||
      interaction.member?.user?.id ||
      'unknown';

    console.log(`⚡ Interaction: ${interaction.type} from ${userName} (${userId})`);

    // Debug log the interaction structure
    console.log('🔍 Interaction data:', {
      type: interaction.type,
      id: interaction.id,
      hasUser: !!interaction.user,
      hasMember: !!interaction.member,
      hasData: !!interaction.data
    });

    // Route to appropriate handler
    try {
      switch (interaction.type) {
        case 2: // APPLICATION_COMMAND (slash commands)
          await this.commands.handleSlashCommand(interaction);
          break;

        case 3: // MESSAGE_COMPONENT (buttons, select menus)
          await this.commands.handleComponent(interaction);
          break;

        case 4: // APPLICATION_COMMAND_AUTOCOMPLETE
          await this.commands.handleAutocomplete(interaction);
          break;

        case 5: // MODAL_SUBMIT
          await this.commands.handleModal(interaction);
          break;

        default:
          console.log(`❓ Unknown interaction type: ${interaction.type}`);
          // Send acknowledgment for unknown types
          await this.client.api(`interactions/${interaction.id}/${interaction.token}/callback`, {
            method: 'POST',
            body: {
              type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
              data: {
                content: '❓ Unknown interaction type received.',
                flags: 64 // EPHEMERAL
              }
            }
          });
      }
    } catch (handlerError) {
      console.error('❌ Interaction handler error:', handlerError);
      throw handlerError;
    }
  }

  /**
   * Handle regular messages with natural language processing
   */
  async handleMessage(message) {
    // Skip if not mentioned or in DM
    const isMentioned = message.mentions?.users?.has?.(this.botUser?.id) || false;
    const isDM = message.channel?.type === 1;

    if (!isMentioned && !isDM) return;

    console.log(`💬 Processing message from ${message.author?.username}: "${message.content}"`);

    try {
      // Analyze message intent with NLP
      const intent = await this.nlp.analyzeIntent(
        message.content,
        message.author?.username || 'Unknown User',
        message.channel?.id,
        { guildId: message.guild?.id }
      );

      // Generate AI response based on intent
      const response = await this.ai.generateIntelligentResponse(
        message.content,
        message.author?.username || 'Unknown User',
        { intent, channel: message.channel }
      );

      // Send response
      if (response && response.trim()) {
        await this.client.sendMessage(message.channel.id, response);
      }

      this.metrics.intelligentDecisions++;

    } catch (error) {
      console.error('❌ Message processing failed:', error);
      try {
        await this.client.sendMessage(message.channel.id,
          'I encountered an issue processing your message, but I\'m learning from it!'
        );
      } catch (sendError) {
        console.error('❌ Failed to send error message:', sendError);
      }
    }
  }

  /**
   * Handle interaction errors gracefully - FIXED
   */
  async handleInteractionError(interaction, error) {
    const errorMessage = 'An error occurred while processing your request. The issue has been logged and will be addressed.';

    try {
      // FIX: Use Discord API directly instead of interaction methods
      await this.client.api(`interactions/${interaction.id}/${interaction.token}/callback`, {
        method: 'POST',
        body: {
          type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
          data: {
            content: errorMessage,
            flags: 64 // EPHEMERAL
          }
        }
      });
    } catch (replyError) {
      console.error('❌ Failed to send error response:', replyError);

      // Try fallback method - edit the original response
      try {
        await this.client.api(`webhooks/${this.client.user.id}/${interaction.token}/messages/@original`, {
          method: 'PATCH',
          body: {
            content: errorMessage,
            flags: 64
          }
        });
      } catch (fallbackError) {
        console.error('❌ Fallback error response also failed:', fallbackError);
      }
    }
  }

  /**
   * Start autonomous background systems
   */
  startAutonomousSystems() {
    console.log(`🤖 Starting autonomous systems...`);

    // Server health monitoring
    setInterval(async () => {
      await this.performServerHealthCheck();
    }, 300000); // Every 5 minutes

    // Predictive analytics
    setInterval(async () => {
      await this.performPredictiveAnalysis();
    }, 900000); // Every 15 minutes

    // Knowledge enhancement
    setInterval(async () => {
      await this.enhanceKnowledge();
    }, 1800000); // Every 30 minutes

    // Metrics reporting
    setInterval(async () => {
      this.reportMetrics();
    }, 3600000); // Every hour
  }

  /**
   * Perform server health check across all guilds
   */
  async performServerHealthCheck() {
    try {
      console.log('🏥 Performing server health checks...');

      for (const [guildId, guild] of this.client.guilds) {
        try {
          // Ensure guildId is a string
          const validGuildId = typeof guildId === 'string' ? guildId : String(guildId);

          const healthReport = await this.serverManager.analyzeServerHealth(validGuildId);

          if (healthReport.needsAttention && healthReport.issues.length > 0) {
            console.log(`⚠️ Issues detected in guild ${validGuildId}: ${healthReport.issues.length} problems`);
            // You could implement automated fixes here
            // await this.serverManager.addressHealthIssues(guild, healthReport.issues);
          } else {
            console.log(`✅ Guild ${validGuildId} health: ${healthReport.overallHealth || 'good'}`);
          }
        } catch (guildError) {
          console.error(`❌ Health check failed for guild ${guildId}:`, guildError.message);
        }
      }

    } catch (error) {
      console.error('❌ Server health check failed:', error);
    }
  }

  /**
   * Perform predictive analysis to prevent issues
   */
  async performPredictiveAnalysis() {
    try {
      console.log('🔮 Performing predictive analysis...');

      for (const [guildId, patterns] of this.knowledge.serverPatterns) {
        const predictions = await this.ai.predictServerIssues(patterns);

        for (const prediction of predictions.predictions || []) {
          if (prediction.probability > 0.8) {
            console.log(`🚨 High-risk prediction: ${prediction.description} (${prediction.probability})`);
            await this.serverManager.implementPreventiveMeasures(guildId, prediction);
            this.metrics.problemsPrevented++;
          }
        }
      }

    } catch (error) {
      console.error('❌ Predictive analysis failed:', error);
    }
  }

  /**
   * Enhance knowledge through continuous learning
   */
  async enhanceKnowledge() {
    try {
      console.log('🧠 Enhancing knowledge systems...');

      // Analyze successful command patterns
      const commandAnalysis = this.analyzeCommandPatterns();

      // Update AI models based on usage
      await this.ai.updateModelsFromUsage?.(commandAnalysis);

      // Optimize server management strategies
      await this.serverManager.optimizeStrategies(this.knowledge.serverPatterns);

    } catch (error) {
      console.error('❌ Knowledge enhancement failed:', error);
    }
  }

  /**
   * Analyze command usage patterns
   */
  analyzeCommandPatterns() {
    const patterns = {
      mostUsedCommands: [],
      userPreferences: new Map(),
      successRates: new Map(),
      errorPatterns: []
    };

    for (const [command, usage] of this.knowledge.commandUsage) {
      patterns.mostUsedCommands.push({
        command,
        count: usage.count,
        successRate: usage.successful / usage.count
      });
    }

    return patterns;
  }

  /**
   * Report performance metrics
   */
  reportMetrics() {
    const uptime = Date.now() - this.metrics.startTime;
    const uptimeHours = Math.floor(uptime / 1000 / 60 / 60);

    console.log('📊 Discord AI Core Metrics:');
    console.log(`   Uptime: ${uptimeHours} hours`);
    console.log(`   Commands executed: ${this.metrics.commandsExecuted}`);
    console.log(`   AI decisions: ${this.metrics.intelligentDecisions}`);
    console.log(`   Servers managed: ${this.metrics.serversManaged}`);
    console.log(`   Users helped: ${this.metrics.usersHelped}`);
    console.log(`   Problems prevented: ${this.metrics.problemsPrevented}`);
    console.log(`   Connected guilds: ${this.client.guilds.size}`);
  }

  /**
   * Handle system errors
   */
  async handleSystemError(error, context) {
    console.error(`🚨 System error:`, error);

    try {
      // Generate AI error analysis
      const errorAnalysis = await this.ai.analyzeSystemError(error, context);

      // Attempt self-healing if possible
      if (errorAnalysis.auto_resolvable) {
        await this.attemptSelfHealing(errorAnalysis);
      }

      // Log for learning
      this.logErrorForLearning(error, context, errorAnalysis);

    } catch (errorHandlingError) {
      console.error('❌ Error handling failed:', errorHandlingError);
    }
  }

  /**
   * Attempt self-healing from errors
   */
  async attemptSelfHealing(errorAnalysis) {
    console.log(`🔧 Attempting self-healing: ${errorAnalysis.resolution_steps?.[0] || 'unknown'}`);

    try {
      const strategy = errorAnalysis.resolution_steps?.[0] || '';

      if (strategy.includes('restart')) {
        await this.restartComponent(errorAnalysis.category);
      } else if (strategy.includes('cache')) {
        await this.clearSystemCache();
      } else if (strategy.includes('reconnect')) {
        await this.client.reconnect();
      }

      console.log(`✅ Self-healing completed`);

    } catch (healingError) {
      console.error('❌ Self-healing failed:', healingError);
    }
  }

  /**
   * Restart a specific component
   */
  async restartComponent(componentName) {
    console.log(`🔄 Restarting component: ${componentName}`);

    switch (componentName) {
      case 'ai':
        await this.ai.reinitialize();
        break;
      case 'nlp':
        await this.nlp.reinitialize();
        break;
      case 'commands':
        await this.commands.reinitialize();
        break;
      case 'serverManager':
        await this.serverManager.reinitialize();
        break;
    }
  }

  /**
   * Clear system cache
   */
  async clearSystemCache() {
    console.log(`🧹 Clearing system cache...`);

    this.knowledge.serverPatterns.clear();
    this.knowledge.userPreferences.clear();
    // Don't clear client caches as they're needed for operation
  }

  /**
   * Log error for learning
   */
  logErrorForLearning(error, context, errorAnalysis) {
    const errorData = {
      error: error.message,
      context,
      analysis: errorAnalysis,
      timestamp: Date.now()
    };

    // Store for future learning
    console.log('📚 Error logged for learning system');
  }

  /**
   * Get system statistics
   */
  getStats() {
    return {
      version: this.version,
      uptime: Date.now() - this.metrics.startTime,
      isActive: this.isActive,
      botUser: this.botUser?.username,
      guilds: this.client.guilds.size,
      metrics: this.metrics,
      intelligence: this.intelligence
    };
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Discord AI Core shutting down...');

    try {
      this.isActive = false;

      // Disconnect from Discord
      this.client.disconnect();

      // Shutdown AI systems
      await this.ai.shutdown();
      await this.nlp.shutdown();
      await this.serverManager.shutdown();

      // Final stats
      const finalStats = this.getStats();
      console.log('📊 Final Statistics:', finalStats);

      console.log('✅ Discord AI Core shutdown complete');

    } catch (error) {
      console.error('❌ Shutdown error:', error);
    }
  }
}