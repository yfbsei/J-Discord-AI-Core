// modules/event-system.js - Discord AI Core Event Handling & Middleware System
/**
 * Event System - Advanced event handling and middleware
 * Manages all Discord events, custom events, and middleware processing
 * Pure JavaScript implementation with intelligent event routing
 */

export class EventSystem {
  constructor() {
    // Event storage
    this.eventListeners = new Map();
    this.middlewareStack = new Map();
    this.eventQueue = [];
    this.customEvents = new Map();
    
    // Event processing
    this.eventMetrics = new Map();
    this.errorHandlers = new Map();
    this.eventFilters = new Map();
    
    // Performance tracking
    this.metrics = {
      eventsProcessed: 0,
      eventsQueued: 0,
      middlewareExecutions: 0,
      errorEvents: 0,
      averageProcessingTime: 0,
      lastProcessedEvent: null
    };
    
    // Configuration
    this.config = {
      maxQueueSize: 1000,
      processingTimeout: 30000, // 30 seconds
      enableMetrics: true,
      enableFiltering: true,
      concurrentEvents: 10,
      retryAttempts: 3
    };
    
    // Event processing state
    this.isProcessing = false;
    this.processingQueue = [];
    this.activeEvents = new Set();
    
    // Initialize built-in events
    this.initializeBuiltInEvents();
  }

  /**
   * Initialize built-in event handlers
   */
  initializeBuiltInEvents() {
    console.log('📡 Event System: Initializing built-in events...');
    
    // Discord Gateway events
    this.registerBuiltInEvent('ready', this.handleReady.bind(this));
    this.registerBuiltInEvent('messageCreate', this.handleMessageCreate.bind(this));
    this.registerBuiltInEvent('interactionCreate', this.handleInteractionCreate.bind(this));
    this.registerBuiltInEvent('guildCreate', this.handleGuildCreate.bind(this));
    this.registerBuiltInEvent('guildDelete', this.handleGuildDelete.bind(this));
    this.registerBuiltInEvent('guildMemberAdd', this.handleGuildMemberAdd.bind(this));
    this.registerBuiltInEvent('guildMemberRemove', this.handleGuildMemberRemove.bind(this));
    this.registerBuiltInEvent('channelCreate', this.handleChannelCreate.bind(this));
    this.registerBuiltInEvent('channelDelete', this.handleChannelDelete.bind(this));
    this.registerBuiltInEvent('roleCreate', this.handleRoleCreate.bind(this));
    this.registerBuiltInEvent('roleDelete', this.handleRoleDelete.bind(this));
    this.registerBuiltInEvent('error', this.handleError.bind(this));
    this.registerBuiltInEvent('disconnect', this.handleDisconnect.bind(this));
    this.registerBuiltInEvent('reconnect', this.handleReconnect.bind(this));
    
    // Custom AI Core events
    this.registerBuiltInEvent('aiDecision', this.handleAIDecision.bind(this));
    this.registerBuiltInEvent('serverOptimization', this.handleServerOptimization.bind(this));
    this.registerBuiltInEvent('userSupport', this.handleUserSupport.bind(this));
    this.registerBuiltInEvent('healthCheck', this.handleHealthCheck.bind(this));
    this.registerBuiltInEvent('learningUpdate', this.handleLearningUpdate.bind(this));
    
    console.log(`✅ Registered ${this.eventListeners.size} built-in events`);
  }

  /**
   * Register a built-in event handler
   */
  registerBuiltInEvent(eventName, handler) {
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    
    this.eventListeners.get(eventName).push({
      handler,
      priority: 1,
      type: 'built-in',
      id: `builtin_${eventName}_${Date.now()}`
    });
  }

  /**
   * Register custom event listener
   */
  on(eventName, handler, options = {}) {
    console.log(`📡 Event System: Registering listener for '${eventName}'`);
    
    if (!this.eventListeners.has(eventName)) {
      this.eventListeners.set(eventName, []);
    }
    
    const listener = {
      handler,
      priority: options.priority || 5,
      type: 'custom',
      id: options.id || `custom_${eventName}_${Date.now()}`,
      once: options.once || false,
      filter: options.filter || null,
      timeout: options.timeout || this.config.processingTimeout
    };
    
    this.eventListeners.get(eventName).push(listener);
    
    // Sort by priority (lower number = higher priority)
    this.eventListeners.get(eventName).sort((a, b) => a.priority - b.priority);
    
    return listener.id;
  }

  /**
   * Register one-time event listener
   */
  once(eventName, handler, options = {}) {
    return this.on(eventName, handler, { ...options, once: true });
  }

  /**
   * Remove event listener
   */
  off(eventName, listenerId) {
    if (!this.eventListeners.has(eventName)) return false;
    
    const listeners = this.eventListeners.get(eventName);
    const index = listeners.findIndex(l => l.id === listenerId);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      console.log(`📡 Event System: Removed listener ${listenerId} for '${eventName}'`);
      return true;
    }
    
    return false;
  }

  /**
   * Add middleware for event processing
   */
  use(eventName, middleware, options = {}) {
    console.log(`🔧 Event System: Adding middleware for '${eventName}'`);
    
    if (!this.middlewareStack.has(eventName)) {
      this.middlewareStack.set(eventName, []);
    }
    
    const middlewareItem = {
      middleware,
      priority: options.priority || 5,
      id: options.id || `middleware_${eventName}_${Date.now()}`,
      type: options.type || 'pre' // pre, post, error
    };
    
    this.middlewareStack.get(eventName).push(middlewareItem);
    
    // Sort by priority
    this.middlewareStack.get(eventName).sort((a, b) => a.priority - b.priority);
    
    return middlewareItem.id;
  }

  /**
   * Emit event
   */
  async emit(eventName, ...args) {
    const eventData = {
      name: eventName,
      args,
      timestamp: Date.now(),
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    console.log(`📡 Event System: Emitting '${eventName}' (${eventData.id})`);
    
    try {
      // Add to processing queue
      if (this.eventQueue.length >= this.config.maxQueueSize) {
        console.warn(`⚠️ Event queue full, dropping event: ${eventName}`);
        this.metrics.eventsQueued--;
        return false;
      }
      
      this.eventQueue.push(eventData);
      this.metrics.eventsQueued++;
      
      // Start processing if not already running
      if (!this.isProcessing) {
        await this.processEventQueue();
      }
      
      return true;
      
    } catch (error) {
      console.error(`❌ Event emission failed for '${eventName}':`, error);
      await this.handleEventError(eventName, error, eventData);
      return false;
    }
  }

  /**
   * Process event queue
   */
  async processEventQueue() {
    if (this.isProcessing || this.eventQueue.length === 0) return;
    
    this.isProcessing = true;
    
    try {
      while (this.eventQueue.length > 0 && this.processingQueue.length < this.config.concurrentEvents) {
        const eventData = this.eventQueue.shift();
        this.processingQueue.push(this.processEvent(eventData));
      }
      
      if (this.processingQueue.length > 0) {
        await Promise.allSettled(this.processingQueue);
        this.processingQueue = [];
      }
      
    } catch (error) {
      console.error('❌ Event queue processing failed:', error);
    } finally {
      this.isProcessing = false;
      
      // Continue processing if more events in queue
      if (this.eventQueue.length > 0) {
        setImmediate(() => this.processEventQueue());
      }
    }
  }

  /**
   * Process individual event
   */
  async processEvent(eventData) {
    const startTime = Date.now();
    const { name, args, id } = eventData;
    
    try {
      this.activeEvents.add(id);
      
      // Apply event filters
      if (this.config.enableFiltering && !await this.applyEventFilters(name, args)) {
        console.log(`🚫 Event filtered: ${name} (${id})`);
        return;
      }
      
      // Execute pre-middleware
      await this.executeMiddleware(name, 'pre', args);
      
      // Execute event listeners
      await this.executeEventListeners(name, args);
      
      // Execute post-middleware
      await this.executeMiddleware(name, 'post', args);
      
      // Update metrics
      const processingTime = Date.now() - startTime;
      this.updateEventMetrics(name, processingTime);
      
      console.log(`✅ Event processed: ${name} (${id}) in ${processingTime}ms`);
      
    } catch (error) {
      console.error(`❌ Event processing failed: ${name} (${id})`, error);
      
      // Execute error middleware
      await this.executeMiddleware(name, 'error', [error, ...args]);
      
      // Handle event error
      await this.handleEventError(name, error, eventData);
      
      this.metrics.errorEvents++;
      
    } finally {
      this.activeEvents.delete(id);
    }
  }

  /**
   * Execute event listeners
   */
  async executeEventListeners(eventName, args) {
    const listeners = this.eventListeners.get(eventName) || [];
    
    for (const listener of listeners) {
      try {
        // Apply listener filter if present
        if (listener.filter && !await listener.filter(...args)) {
          continue;
        }
        
        // Execute listener with timeout
        await Promise.race([
          listener.handler(...args),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Listener timeout')), listener.timeout)
          )
        ]);
        
        // Remove one-time listeners
        if (listener.once) {
          this.off(eventName, listener.id);
        }
        
      } catch (error) {
        console.error(`❌ Listener error for '${eventName}' (${listener.id}):`, error);
        
        // Continue with other listeners
        continue;
      }
    }
  }

  /**
   * Execute middleware
   */
  async executeMiddleware(eventName, type, args) {
    const middlewares = this.middlewareStack.get(eventName) || [];
    const relevantMiddlewares = middlewares.filter(m => m.type === type);
    
    for (const middleware of relevantMiddlewares) {
      try {
        await middleware.middleware(...args);
        this.metrics.middlewareExecutions++;
      } catch (error) {
        console.error(`❌ Middleware error for '${eventName}' (${middleware.id}):`, error);
        
        // Continue with other middleware
        continue;
      }
    }
  }

  /**
   * Apply event filters
   */
  async applyEventFilters(eventName, args) {
    const filters = this.eventFilters.get(eventName) || [];
    
    for (const filter of filters) {
      try {
        if (!await filter(...args)) {
          return false;
        }
      } catch (error) {
        console.error(`❌ Event filter error for '${eventName}':`, error);
        // On filter error, allow event through
        continue;
      }
    }
    
    return true;
  }

  /**
   * Add event filter
   */
  addFilter(eventName, filter) {
    if (!this.eventFilters.has(eventName)) {
      this.eventFilters.set(eventName, []);
    }
    
    this.eventFilters.get(eventName).push(filter);
    console.log(`🚫 Event System: Added filter for '${eventName}'`);
  }

  /**
   * Handle event errors
   */
  async handleEventError(eventName, error, eventData) {
    try {
      // Emit error event
      const errorHandlers = this.errorHandlers.get(eventName) || [];
      
      for (const handler of errorHandlers) {
        try {
          await handler(error, eventData);
        } catch (handlerError) {
          console.error('❌ Error handler failed:', handlerError);
        }
      }
      
      // Emit generic error event
      if (eventName !== 'error') {
        this.emit('error', error, eventData);
      }
      
    } catch (errorHandlingError) {
      console.error('❌ Error handling failed:', errorHandlingError);
    }
  }

  /**
   * Add error handler for specific event
   */
  onError(eventName, handler) {
    if (!this.errorHandlers.has(eventName)) {
      this.errorHandlers.set(eventName, []);
    }
    
    this.errorHandlers.get(eventName).push(handler);
    console.log(`🚨 Event System: Added error handler for '${eventName}'`);
  }

  /**
   * Update event metrics
   */
  updateEventMetrics(eventName, processingTime) {
    if (!this.config.enableMetrics) return;
    
    // Update general metrics
    this.metrics.eventsProcessed++;
    this.metrics.lastProcessedEvent = eventName;
    
    // Update average processing time
    this.metrics.averageProcessingTime = 
      (this.metrics.averageProcessingTime * (this.metrics.eventsProcessed - 1) + processingTime) / 
      this.metrics.eventsProcessed;
    
    // Update event-specific metrics
    if (!this.eventMetrics.has(eventName)) {
      this.eventMetrics.set(eventName, {
        count: 0,
        totalTime: 0,
        averageTime: 0,
        errors: 0,
        lastProcessed: 0
      });
    }
    
    const eventMetric = this.eventMetrics.get(eventName);
    eventMetric.count++;
    eventMetric.totalTime += processingTime;
    eventMetric.averageTime = eventMetric.totalTime / eventMetric.count;
    eventMetric.lastProcessed = Date.now();
  }

  // ===== BUILT-IN EVENT HANDLERS =====

  /**
   * Handle Discord ready event
   */
  async handleReady(user) {
    console.log(`🟢 Event System: Bot ready as ${user.username}`);
    
    // Emit custom ready event
    await this.emit('botReady', user);
  }

  /**
   * Handle message create event
   */
  async handleMessageCreate(message) {
    if (message.author.bot) return;
    
    console.log(`💬 Event System: Message from ${message.author.username}`);
    
    // Emit enhanced message events
    await this.emit('userMessage', message);
    
    // Check for admin mentions
    if (message.mentions && message.mentions.users) {
      await this.emit('botMention', message);
    }
    
    // Check for specific patterns
    if (message.content.toLowerCase().includes('help')) {
      await this.emit('helpRequest', message);
    }
  }

  /**
   * Handle interaction create event
   */
  async handleInteractionCreate(interaction) {
    console.log(`⚡ Event System: Interaction ${interaction.type} from ${interaction.user.username}`);
    
    // Emit specific interaction events
    switch (interaction.type) {
      case 2: // APPLICATION_COMMAND
        await this.emit('slashCommand', interaction);
        break;
      case 3: // MESSAGE_COMPONENT
        await this.emit('buttonClick', interaction);
        break;
      case 4: // APPLICATION_COMMAND_AUTOCOMPLETE
        await this.emit('autocomplete', interaction);
        break;
      case 5: // MODAL_SUBMIT
        await this.emit('modalSubmit', interaction);
        break;
    }
    
    // General interaction event
    await this.emit('userInteraction', interaction);
  }

  /**
   * Handle guild create event
   */
  async handleGuildCreate(guild) {
    console.log(`📈 Event System: Joined guild ${guild.name}`);
    
    await this.emit('guildJoined', guild);
    await this.emit('serverAnalysisNeeded', guild);
  }

  /**
   * Handle guild delete event
   */
  async handleGuildDelete(guild) {
    console.log(`📉 Event System: Left guild ${guild.name}`);
    
    await this.emit('guildLeft', guild);
    await this.emit('cleanupRequired', guild);
  }

  /**
   * Handle guild member add event
   */
  async handleGuildMemberAdd(member) {
    console.log(`👤➕ Event System: Member joined ${member.guild.name}`);
    
    await this.emit('memberJoined', member);
    await this.emit('welcomeNeeded', member);
  }

  /**
   * Handle guild member remove event
   */
  async handleGuildMemberRemove(member) {
    console.log(`👤➖ Event System: Member left ${member.guild.name}`);
    
    await this.emit('memberLeft', member);
    await this.emit('farewellNeeded', member);
  }

  /**
   * Handle channel create event
   */
  async handleChannelCreate(channel) {
    console.log(`📁➕ Event System: Channel created ${channel.name}`);
    
    await this.emit('channelCreated', channel);
    await this.emit('serverStructureChanged', channel.guild_id);
  }

  /**
   * Handle channel delete event
   */
  async handleChannelDelete(channel) {
    console.log(`📁➖ Event System: Channel deleted ${channel.name}`);
    
    await this.emit('channelDeleted', channel);
    await this.emit('serverStructureChanged', channel.guild_id);
  }

  /**
   * Handle role create event
   */
  async handleRoleCreate(role) {
    console.log(`👑➕ Event System: Role created ${role.name}`);
    
    await this.emit('roleCreated', role);
    await this.emit('serverStructureChanged', role.guild_id);
  }

  /**
   * Handle role delete event
   */
  async handleRoleDelete(role) {
    console.log(`👑➖ Event System: Role deleted ${role.name}`);
    
    await this.emit('roleDeleted', role);
    await this.emit('serverStructureChanged', role.guild_id);
  }

  /**
   * Handle error event
   */
  async handleError(error) {
    console.error(`🚨 Event System: Error occurred:`, error);
    
    await this.emit('systemError', error);
  }

  /**
   * Handle disconnect event
   */
  async handleDisconnect(code) {
    console.log(`🔌 Event System: Disconnected (${code})`);
    
    await this.emit('connectionLost', code);
  }

  /**
   * Handle reconnect event
   */
  async handleReconnect() {
    console.log(`🔄 Event System: Reconnected`);
    
    await this.emit('connectionRestored');
  }

  // ===== CUSTOM AI CORE EVENT HANDLERS =====

  /**
   * Handle AI decision event
   */
  async handleAIDecision(decision) {
    console.log(`🧠 Event System: AI Decision - ${decision.type}`);
    
    // Log AI decisions for learning
    await this.emit('learningData', {
      type: 'ai_decision',
      data: decision
    });
  }

  /**
   * Handle server optimization event
   */
  async handleServerOptimization(optimization) {
    console.log(`⚡ Event System: Server Optimization - ${optimization.guildId}`);
    
    // Notify about optimization completion
    await this.emit('optimizationComplete', optimization);
  }

  /**
   * Handle user support event
   */
  async handleUserSupport(support) {
    console.log(`🆘 Event System: User Support - ${support.category}`);
    
    // Escalate urgent support requests
    if (support.urgency === 'urgent') {
      await this.emit('urgentSupport', support);
    }
  }

  /**
   * Handle health check event
   */
  async handleHealthCheck(health) {
    console.log(`🏥 Event System: Health Check - ${health.status}`);
    
    // Alert on health issues
    if (health.status === 'unhealthy') {
      await this.emit('healthAlert', health);
    }
  }

  /**
   * Handle learning update event
   */
  async handleLearningUpdate(learning) {
    console.log(`📚 Event System: Learning Update - ${learning.type}`);
    
    // Process learning improvements
    await this.emit('learningImprovement', learning);
  }

  /**
   * Create custom event
   */
  createEvent(eventName, options = {}) {
    console.log(`🎯 Event System: Creating custom event '${eventName}'`);
    
    const customEvent = {
      name: eventName,
      created: Date.now(),
      options,
      emitCount: 0,
      listeners: []
    };
    
    this.customEvents.set(eventName, customEvent);
    
    return eventName;
  }

  /**
   * Schedule event
   */
  scheduleEvent(eventName, args, delay) {
    console.log(`⏰ Event System: Scheduling '${eventName}' in ${delay}ms`);
    
    setTimeout(() => {
      this.emit(eventName, ...args);
    }, delay);
  }

  /**
   * Batch emit events
   */
  async batchEmit(events) {
    console.log(`📦 Event System: Batch emitting ${events.length} events`);
    
    const promises = events.map(({ eventName, args }) => 
      this.emit(eventName, ...args)
    );
    
    return Promise.allSettled(promises);
  }

  /**
   * Get event statistics
   */
  getEventStats() {
    return {
      general: { ...this.metrics },
      eventMetrics: Object.fromEntries(this.eventMetrics),
      queueSize: this.eventQueue.length,
      activeEvents: this.activeEvents.size,
      registeredEvents: this.eventListeners.size,
      customEvents: this.customEvents.size,
      middlewareCount: this.middlewareStack.size
    };
  }

  /**
   * Get health status
   */
  getHealthStatus() {
    return {
      isHealthy: this.metrics.errorEvents / (this.metrics.eventsProcessed + 1) < 0.1,
      queueBacklog: this.eventQueue.length,
      averageProcessingTime: this.metrics.averageProcessingTime,
      errorRate: this.metrics.errorEvents / (this.metrics.eventsProcessed + 1),
      activeEvents: this.activeEvents.size,
      isProcessing: this.isProcessing
    };
  }

  /**
   * Update configuration
   */
  updateConfiguration(newConfig) {
    console.log('⚙️ Event System: Updating configuration...');
    
    this.config = { ...this.config, ...newConfig };
    
    console.log('✅ Event System: Configuration updated');
  }

  /**
   * Clear all events and reset
   */
  reset() {
    console.log('🔄 Event System: Resetting...');
    
    // Clear all data
    this.eventListeners.clear();
    this.middlewareStack.clear();
    this.eventQueue = [];
    this.customEvents.clear();
    this.eventMetrics.clear();
    this.errorHandlers.clear();
    this.eventFilters.clear();
    
    // Reset state
    this.isProcessing = false;
    this.processingQueue = [];
    this.activeEvents.clear();
    
    // Reset metrics
    this.metrics = {
      eventsProcessed: 0,
      eventsQueued: 0,
      middlewareExecutions: 0,
      errorEvents: 0,
      averageProcessingTime: 0,
      lastProcessedEvent: null
    };
    
    // Reinitialize built-in events
    this.initializeBuiltInEvents();
    
    console.log('✅ Event System: Reset completed');
  }

  /**
   * Emergency shutdown
   */
  async emergencyShutdown() {
    console.log('🚨 Event System: Emergency shutdown...');
    
    // Stop processing
    this.isProcessing = false;
    
    // Clear queues
    this.eventQueue = [];
    this.processingQueue = [];
    this.activeEvents.clear();
    
    console.log('✅ Event System: Emergency shutdown completed');
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Event System: Graceful shutdown...');
    
    try {
      // Process remaining events in queue
      if (this.eventQueue.length > 0) {
        console.log(`⏳ Processing ${this.eventQueue.length} remaining events...`);
        await this.processEventQueue();
      }
      
      // Wait for active events to complete
      let waitCount = 0;
      while (this.activeEvents.size > 0 && waitCount < 30) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        waitCount++;
      }
      
      // Generate final statistics
      const finalStats = this.getEventStats();
      console.log('📊 Event System Final Stats:', finalStats.general);
      
      // Clear all data
      this.reset();
      
      console.log('✅ Event System: Graceful shutdown completed');
      
    } catch (error) {
      console.error('❌ Event System shutdown error:', error);
      await this.emergencyShutdown();
    }
  }
}