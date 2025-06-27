// tests/core-tests.js - Discord AI Core Framework Test Suite
/**
 * Comprehensive test suite for Discord AI Core framework
 * Tests all core modules, AI systems, and Discord integrations
 * Run with: node tests/core-tests.js
 */

import { DiscordCore } from '../modules/core.js';
import { DiscordClient } from '../modules/discord-client.js';
import { AIEngine } from '../modules/ai-engine.js';
import { CommandHandler } from '../modules/command-handler.js';
import { ServerManager } from '../modules/server-manager.js';
import { NLPEngine } from '../modules/nlp-engine.js';
import { EventSystem } from '../modules/event-system.js';
import dotenv from 'dotenv';

// Load test environment
dotenv.config({ path: '.env.test' });

class CoreTestSuite {
  constructor() {
    this.testResults = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      failures: [],
      startTime: Date.now()
    };
    
    this.testConfig = {
      timeout: 30000, // 30 seconds per test
      skipIntegrationTests: !process.env.BOT_TOKEN,
      skipAITests: !process.env.TOGETHER_API_KEY && !process.env.OPENROUTER_API_KEY,
      verbose: process.env.TEST_VERBOSE === 'true'
    };
    
    console.log('🧪 Discord AI Core - Test Suite Starting...\n');
    console.log('📋 Test Configuration:');
    console.log(`   • Integration Tests: ${this.testConfig.skipIntegrationTests ? '❌ SKIP (No BOT_TOKEN)' : '✅ ENABLED'}`);
    console.log(`   • AI Tests: ${this.testConfig.skipAITests ? '❌ SKIP (No AI Keys)' : '✅ ENABLED'}`);
    console.log(`   • Verbose Output: ${this.testConfig.verbose ? '✅ ON' : '❌ OFF'}`);
    console.log(`   • Test Timeout: ${this.testConfig.timeout}ms`);
    console.log('');
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log('🚀 Starting Core Framework Tests...\n');
    
    try {
      // Module instantiation tests
      await this.testModuleInstantiation();
      
      // Core framework tests
      await this.testCoreFramework();
      
      // Discord client tests
      await this.testDiscordClient();
      
      // AI engine tests
      await this.testAIEngine();
      
      // Command handler tests
      await this.testCommandHandler();
      
      // Server manager tests
      await this.testServerManager();
      
      // NLP engine tests
      await this.testNLPEngine();
      
      // Event system tests
      await this.testEventSystem();
      
      // Integration tests
      await this.testIntegration();
      
      // Performance tests
      await this.testPerformance();
      
      // Generate final report
      this.generateTestReport();
      
    } catch (error) {
      console.error('❌ Test suite failed:', error);
      process.exit(1);
    }
  }

  /**
   * Test module instantiation
   */
  async testModuleInstantiation() {
    console.log('📦 Testing Module Instantiation...');
    
    await this.test('DiscordCore instantiation', () => {
      const config = {
        botToken: 'test_token',
        togetherApiKey: 'test_key',
        openrouterApiKey: 'test_key'
      };
      const core = new DiscordCore(config);
      this.assert(core instanceof DiscordCore, 'DiscordCore should instantiate');
      this.assert(core.config.botToken === 'Bot test_token', 'Bot token should be prefixed');
      this.assert(core.version === '1.0.0', 'Version should be set');
    });
    
    await this.test('DiscordClient instantiation', () => {
      const client = new DiscordClient();
      this.assert(client instanceof DiscordClient, 'DiscordClient should instantiate');
      this.assert(typeof client.login === 'function', 'Should have login method');
      this.assert(typeof client.api === 'function', 'Should have api method');
    });
    
    await this.test('AIEngine instantiation', () => {
      const ai = new AIEngine('test_primary', 'test_fallback');
      this.assert(ai instanceof AIEngine, 'AIEngine should instantiate');
      this.assert(ai.primaryKey === 'test_primary', 'Primary key should be set');
      this.assert(ai.fallbackKey === 'test_fallback', 'Fallback key should be set');
    });
    
    await this.test('CommandHandler instantiation', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      this.assert(commands instanceof CommandHandler, 'CommandHandler should instantiate');
      this.assert(commands.commands instanceof Map, 'Should have commands map');
    });
    
    await this.test('ServerManager instantiation', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      this.assert(manager instanceof ServerManager, 'ServerManager should instantiate');
      this.assert(manager.serverIntelligence instanceof Map, 'Should have intelligence map');
    });
    
    await this.test('NLPEngine instantiation', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      this.assert(nlp instanceof NLPEngine, 'NLPEngine should instantiate');
      this.assert(nlp.intentPatterns instanceof Map, 'Should have intent patterns');
    });
    
    await this.test('EventSystem instantiation', () => {
      const events = new EventSystem();
      this.assert(events instanceof EventSystem, 'EventSystem should instantiate');
      this.assert(events.eventListeners instanceof Map, 'Should have event listeners');
    });
    
    console.log('✅ Module Instantiation Tests Complete\n');
  }

  /**
   * Test core framework functionality
   */
  async testCoreFramework() {
    console.log('🧠 Testing Core Framework...');
    
    await this.test('Configuration validation', () => {
      const config = {
        botToken: 'test_token',
        togetherApiKey: 'test_key'
      };
      const core = new DiscordCore(config);
      
      // Test configuration processing
      this.assert(core.config.botToken.startsWith('Bot '), 'Token should be prefixed');
      this.assert(core.intelligence.learningMode === 'high', 'Default learning mode should be set');
      this.assert(core.metrics.startTime > 0, 'Start time should be set');
    });
    
    await this.test('Intent calculation', () => {
      const core = new DiscordCore({});
      const intents = core.calculateIntents(['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']);
      
      // Check calculated intents
      this.assert(typeof intents === 'number', 'Intents should be a number');
      this.assert(intents > 0, 'Intents should be greater than 0');
      this.assert((intents & (1 << 0)) !== 0, 'GUILDS intent should be set');
      this.assert((intents & (1 << 9)) !== 0, 'GUILD_MESSAGES intent should be set');
      this.assert((intents & (1 << 15)) !== 0, 'MESSAGE_CONTENT intent should be set');
    });
    
    await this.test('Statistics tracking', () => {
      const core = new DiscordCore({});
      const initialStats = core.getStats();
      
      this.assert(typeof initialStats === 'object', 'Stats should be an object');
      this.assert(initialStats.version === '1.0.0', 'Version should be in stats');
      this.assert(typeof initialStats.uptime === 'number', 'Uptime should be a number');
      this.assert(typeof initialStats.metrics === 'object', 'Metrics should be an object');
    });
    
    await this.test('Error handling setup', () => {
      const core = new DiscordCore({});
      
      // Test error handler exists
      this.assert(typeof core.handleSystemError === 'function', 'Should have error handler');
      
      // Test graceful shutdown
      this.assert(typeof core.shutdown === 'function', 'Should have shutdown method');
    });
    
    console.log('✅ Core Framework Tests Complete\n');
  }

  /**
   * Test Discord client functionality
   */
  async testDiscordClient() {
    console.log('🤖 Testing Discord Client...');
    
    await this.test('API endpoint construction', () => {
      const client = new DiscordClient();
      this.assert(client.baseURL === 'https://discord.com/api/v10', 'Base URL should be correct');
      this.assert(client.apiVersion === '10', 'API version should be 10');
    });
    
    await this.test('Rate limiting setup', () => {
      const client = new DiscordClient();
      this.assert(client.rateLimits instanceof Map, 'Rate limits should be a Map');
      this.assert(Array.isArray(client.requestQueue), 'Request queue should be an array');
    });
    
    await this.test('Event emission setup', () => {
      const client = new DiscordClient();
      let eventEmitted = false;
      
      client.on('test', () => {
        eventEmitted = true;
      });
      
      client.emit('test');
      this.assert(eventEmitted, 'Client should emit events');
    });
    
    await this.test('Route key generation', () => {
      const client = new DiscordClient();
      const routeKey1 = client.getRouteKey('guilds/123/channels');
      const routeKey2 = client.getRouteKey('channels/456/messages');
      
      this.assert(routeKey1 === 'guilds/123', 'Guild route key should be correct');
      this.assert(routeKey2 === 'channels/456', 'Channel route key should be correct');
    });
    
    // Integration test (skip if no token)
    if (!this.testConfig.skipIntegrationTests) {
      await this.test('Discord authentication', async () => {
        const client = new DiscordClient();
        try {
          await client.login(process.env.BOT_TOKEN);
          this.assert(client.user !== null, 'User should be set after login');
          this.assert(typeof client.user.id === 'string', 'User ID should be string');
          client.disconnect();
        } catch (error) {
          throw new Error(`Authentication failed: ${error.message}`);
        }
      });
    } else {
      this.skip('Discord authentication (no BOT_TOKEN)');
    }
    
    console.log('✅ Discord Client Tests Complete\n');
  }

  /**
   * Test AI engine functionality
   */
  async testAIEngine() {
    console.log('🧠 Testing AI Engine...');
    
    await this.test('AI provider configuration', () => {
      const ai = new AIEngine('primary_key', 'fallback_key');
      
      this.assert(ai.primaryURL === 'https://api.together.xyz/v1/chat/completions', 'Primary URL should be correct');
      this.assert(ai.fallbackURL === 'https://openrouter.ai/api/v1/chat/completions', 'Fallback URL should be correct');
      this.assert(ai.primaryModel === 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', 'Primary model should be set');
      this.assert(ai.fallbackModel === 'deepseek/deepseek-r1-0528-qwen3-8b:free', 'Fallback model should be set');
    });
    
    await this.test('Intelligence metrics tracking', () => {
      const ai = new AIEngine('test', 'test');
      
      this.assert(typeof ai.metrics === 'object', 'Metrics should be an object');
      this.assert(ai.metrics.decisionsGenerated === 0, 'Initial decisions should be 0');
      this.assert(ai.metrics.successfulOutcomes === 0, 'Initial successes should be 0');
      this.assert(typeof ai.metrics.predictionAccuracy === 'number', 'Accuracy should be a number');
    });
    
    await this.test('Configuration management', () => {
      const ai = new AIEngine('test', 'test');
      
      this.assert(typeof ai.config === 'object', 'Config should be an object');
      this.assert(ai.config.creativityLevel === 0.8, 'Default creativity should be 0.8');
      this.assert(ai.config.confidenceThreshold === 0.75, 'Default confidence should be 0.75');
    });
    
    await this.test('Provider status tracking', () => {
      const ai = new AIEngine('test', 'test');
      
      this.assert(typeof ai.providerStatus === 'object', 'Provider status should be object');
      this.assert(ai.providerStatus.primary.available === true, 'Primary should start available');
      this.assert(ai.providerStatus.fallback.available === true, 'Fallback should start available');
    });
    
    await this.test('System prompt generation', () => {
      const ai = new AIEngine('test', 'test');
      const systemPrompt = ai.generateIntelligentSystemPrompt({ type: 'command_processing' });
      
      this.assert(typeof systemPrompt === 'string', 'System prompt should be string');
      this.assert(systemPrompt.includes('Discord AI Core'), 'Should mention Discord AI Core');
      this.assert(systemPrompt.includes('COMMAND PROCESSING'), 'Should include context type');
    });
    
    await this.test('Built-in response generation', () => {
      const ai = new AIEngine('test', 'test');
      const response = ai.generateBuiltInResponse('help me with something', {});
      
      this.assert(typeof response === 'string', 'Response should be string');
      this.assert(response.length > 0, 'Response should not be empty');
      this.assert(response.includes('help'), 'Should acknowledge help request');
    });
    
    // AI API test (skip if no keys)
    if (!this.testConfig.skipAITests) {
      await this.test('AI provider connection test', async () => {
        const ai = new AIEngine(process.env.TOGETHER_API_KEY, process.env.OPENROUTER_API_KEY);
        
        try {
          await ai.testProviderConnections();
          this.assert(ai.providerStatus.primary.available || ai.providerStatus.fallback.available, 
                     'At least one provider should be available');
        } catch (error) {
          throw new Error(`Provider test failed: ${error.message}`);
        }
      });
    } else {
      this.skip('AI provider connection test (no API keys)');
    }
    
    console.log('✅ AI Engine Tests Complete\n');
  }

  /**
   * Test command handler functionality
   */
  async testCommandHandler() {
    console.log('⚡ Testing Command Handler...');
    
    await this.test('Built-in commands initialization', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      this.assert(commands.commands.size > 0, 'Should have built-in commands');
      this.assert(commands.commands.has('ai'), 'Should have AI command');
      this.assert(commands.commands.has('server'), 'Should have server command');
      this.assert(commands.commands.has('admin'), 'Should have admin command');
      this.assert(commands.commands.has('help'), 'Should have help command');
      this.assert(commands.commands.has('status'), 'Should have status command');
    });
    
    await this.test('Command registration', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      // Test custom command addition
      commands.addCommand({
        name: 'test',
        description: 'Test command'
      });
      
      this.assert(commands.commands.has('test'), 'Should register custom command');
      
      const testCommand = commands.commands.get('test');
      this.assert(testCommand.name === 'test', 'Command name should match');
      this.assert(testCommand.description === 'Test command', 'Command description should match');
    });
    
    await this.test('Permission checking', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      // Test permission bit calculation
      const adminBit = commands.getPermissionBit('ADMINISTRATOR');
      const manageBit = commands.getPermissionBit('MANAGE_GUILD');
      
      this.assert(adminBit === (1n << 3n), 'Admin permission bit should be correct');
      this.assert(manageBit === (1n << 5n), 'Manage guild permission bit should be correct');
      
      // Test permission checking
      const mockInteraction = {
        member: {
          permissions: '8' // ADMINISTRATOR
        }
      };
      
      const hasAdmin = commands.hasPermission(mockInteraction, 'ADMINISTRATOR');
      this.assert(hasAdmin === true, 'Should detect admin permission');
    });
    
    await this.test('Option value extraction', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      const mockCommand = {
        options: [
          { name: 'message', value: 'test message' },
          { name: 'target', value: 'server' }
        ]
      };
      
      const messageValue = commands.getOptionValue(mockCommand, 'message');
      const targetValue = commands.getOptionValue(mockCommand, 'target');
      
      this.assert(messageValue === 'test message', 'Should extract message value');
      this.assert(targetValue === 'server', 'Should extract target value');
    });
    
    await this.test('Usage tracking', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      // Track some usage
      commands.trackCommandUsage('test', 'user123');
      commands.trackCommandUsage('test', 'user123');
      commands.trackCommandUsage('help', 'user456');
      
      this.assert(commands.commandUsage.size > 0, 'Should track command usage');
      
      const testUsage = commands.commandUsage.get('test_user123');
      this.assert(testUsage.count === 2, 'Should track multiple uses');
    });
    
    await this.test('Health status', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      const health = commands.getHealthStatus();
      
      this.assert(typeof health === 'object', 'Health should be object');
      this.assert(typeof health.isHealthy === 'boolean', 'Should have health status');
      this.assert(typeof health.metrics === 'object', 'Should have metrics');
      this.assert(typeof health.commandsRegistered === 'number', 'Should have command count');
    });
    
    console.log('✅ Command Handler Tests Complete\n');
  }

  /**
   * Test server manager functionality
   */
  async testServerManager() {
    console.log('🏗️ Testing Server Manager...');
    
    await this.test('Server intelligence caching', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      
      this.assert(manager.serverIntelligence instanceof Map, 'Should have intelligence cache');
      this.assert(manager.optimizationHistory instanceof Map, 'Should have optimization history');
      this.assert(manager.healthMonitoring instanceof Map, 'Should have health monitoring');
    });
    
    await this.test('Metrics tracking', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      
      this.assert(typeof manager.metrics === 'object', 'Metrics should be object');
      this.assert(manager.metrics.serversManaged === 0, 'Initial servers should be 0');
      this.assert(manager.metrics.optimizationsPerformed === 0, 'Initial optimizations should be 0');
      this.assert(manager.metrics.successRate === 0.0, 'Initial success rate should be 0');
    });
    
    await this.test('Channel structure analysis', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      
      const mockChannels = [
        { type: 4, name: 'Category 1' }, // Category
        { type: 0, name: 'general', parent_id: null }, // Text uncategorized
        { type: 0, name: 'random', parent_id: '123' }, // Text categorized
        { type: 2, name: 'voice', parent_id: '123' } // Voice categorized
      ];
      
      const analysis = manager.analyzeChannelStructure(mockChannels);
      
      this.assert(analysis.hasCategories === true, 'Should detect categories');
      this.assert(analysis.categoryCount === 1, 'Should count categories correctly');
      this.assert(analysis.uncategorizedChannels === 1, 'Should count uncategorized channels');
      this.assert(analysis.categorizedChannels === 2, 'Should count categorized channels');
    });
    
    await this.test('Role permission analysis', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      
      const mockRoles = [
        { name: 'Admin', permissions: '8' }, // ADMINISTRATOR
        { name: 'Mod', permissions: '6' }, // KICK_MEMBERS + BAN_MEMBERS  
        { name: 'User', permissions: '0' }
      ];
      
      const analysis = manager.analyzeRolePermissions(mockRoles);
      
      this.assert(analysis.adminRoles === 1, 'Should count admin roles');
      this.assert(analysis.totalRoles === 3, 'Should count total roles');
      this.assert(typeof analysis.hasProperHierarchy === 'boolean', 'Should analyze hierarchy');
    });
    
    await this.test('Success rate calculation', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      
      // Simulate some operations
      manager.metrics.autonomousDecisions = 10;
      
      // No failed operations
      const successRate1 = manager.calculateSuccessRate();
      this.assert(successRate1 === 1.0, 'Should calculate 100% success rate');
      
      // Add a failed operation
      manager.activeOperations.set('test', { status: 'failed' });
      const successRate2 = manager.calculateSuccessRate();
      this.assert(successRate2 < 1.0, 'Should calculate lower success rate with failures');
    });
    
    await this.test('Health status', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const manager = new ServerManager(client, ai);
      
      const health = manager.getHealthStatus();
      
      this.assert(typeof health === 'object', 'Health should be object');
      this.assert(typeof health.isHealthy === 'boolean', 'Should have health status');
      this.assert(typeof health.successRate === 'number', 'Should have success rate');
      this.assert(typeof health.serversManaged === 'number', 'Should have server count');
    });
    
    console.log('✅ Server Manager Tests Complete\n');
  }

  /**
   * Test NLP engine functionality
   */
  async testNLPEngine() {
    console.log('🗣️ Testing NLP Engine...');
    
    await this.test('Intent patterns initialization', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      
      this.assert(nlp.intentPatterns instanceof Map, 'Should have intent patterns');
      this.assert(nlp.intentPatterns.size > 0, 'Should have some patterns');
      this.assert(nlp.intentPatterns.has('admin_commands'), 'Should have admin patterns');
      this.assert(nlp.intentPatterns.has('user_support'), 'Should have support patterns');
      this.assert(nlp.intentPatterns.has('conversation'), 'Should have conversation patterns');
    });
    
    await this.test('Pattern matching', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      
      // Test admin command detection
      const dmIntent = nlp.detectPatternIntent('dm all users hello');
      this.assert(dmIntent !== null, 'Should detect DM intent');
      this.assert(dmIntent.intent === 'mass_dm', 'Should classify as mass DM');
      
      // Test help request detection
      const helpIntent = nlp.detectPatternIntent('I need help with something');
      this.assert(helpIntent !== null, 'Should detect help intent');
      this.assert(helpIntent.intent === 'general_help', 'Should classify as help request');
      
      // Test greeting detection
      const greetingIntent = nlp.detectPatternIntent('hello there');
      this.assert(greetingIntent !== null, 'Should detect greeting');
      this.assert(greetingIntent.intent === 'greeting', 'Should classify as greeting');
    });
    
    await this.test('Fallback intent generation', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      
      // Test keyword fallback
      const helpFallback = nlp.generateFallbackIntent('can you help me', 'testuser');
      this.assert(helpFallback.intent === 'help_request', 'Should fallback to help');
      this.assert(helpFallback.method === 'keyword_fallback', 'Should use keyword method');
      
      // Test default fallback
      const defaultFallback = nlp.generateFallbackIntent('random message', 'testuser');
      this.assert(defaultFallback.intent === 'general_conversation', 'Should fallback to conversation');
      this.assert(defaultFallback.method === 'default_fallback', 'Should use default method');
    });
    
    await this.test('Context memory management', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      
      // Store some context
      nlp.storeConversationContext('channel123', 'user1', 'hello', { intent: 'greeting' });
      nlp.storeConversationContext('channel123', 'user2', 'hi there', { intent: 'greeting' });
      
      // Retrieve context
      const history = nlp.getRecentHistory('channel123', 2);
      this.assert(Array.isArray(history), 'History should be array');
      this.assert(history.length === 2, 'Should retrieve requested amount');
      this.assert(history[0].author === 'user1', 'Should maintain order');
    });
    
    await this.test('Configuration management', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      
      this.assert(typeof nlp.config === 'object', 'Config should be object');
      this.assert(nlp.config.confidenceThreshold === 0.75, 'Default confidence should be 0.75');
      this.assert(nlp.config.contextWindowSize === 5, 'Default context window should be 5');
      
      // Test configuration update
      nlp.updateConfiguration({ confidenceThreshold: 0.8 });
      this.assert(nlp.config.confidenceThreshold === 0.8, 'Should update configuration');
    });
    
    await this.test('Health status', () => {
      const ai = new AIEngine('test', 'test');
      const nlp = new NLPEngine(ai);
      
      const health = nlp.getHealthStatus();
      
      this.assert(typeof health === 'object', 'Health should be object');
      this.assert(typeof health.isHealthy === 'boolean', 'Should have health status');
      this.assert(typeof health.metrics === 'object', 'Should have metrics');
      this.assert(typeof health.contextMemorySize === 'number', 'Should have memory size');
    });
    
    console.log('✅ NLP Engine Tests Complete\n');
  }

  /**
   * Test event system functionality
   */
  async testEventSystem() {
    console.log('📡 Testing Event System...');
    
    await this.test('Event listener registration', () => {
      const events = new EventSystem();
      
      let eventFired = false;
      const listenerId = events.on('test', () => {
        eventFired = true;
      });
      
      this.assert(typeof listenerId === 'string', 'Should return listener ID');
      this.assert(events.eventListeners.has('test'), 'Should register event');
      this.assert(events.eventListeners.get('test').length === 1, 'Should have one listener');
    });
    
    await this.test('Event emission and handling', async () => {
      const events = new EventSystem();
      
      let eventData = null;
      events.on('test', (data) => {
        eventData = data;
      });
      
      await events.emit('test', 'test data');
      
      // Wait for async processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.assert(eventData === 'test data', 'Should receive event data');
    });
    
    await this.test('One-time event listeners', async () => {
      const events = new EventSystem();
      
      let callCount = 0;
      events.once('test', () => {
        callCount++;
      });
      
      await events.emit('test');
      await events.emit('test');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.assert(callCount === 1, 'Should only fire once');
    });
    
    await this.test('Event listener removal', () => {
      const events = new EventSystem();
      
      const listenerId = events.on('test', () => {});
      this.assert(events.eventListeners.get('test').length === 1, 'Should have listener');
      
      const removed = events.off('test', listenerId);
      this.assert(removed === true, 'Should confirm removal');
      this.assert(events.eventListeners.get('test').length === 0, 'Should remove listener');
    });
    
    await this.test('Middleware execution', async () => {
      const events = new EventSystem();
      
      let middlewareExecuted = false;
      events.use('test', () => {
        middlewareExecuted = true;
      });
      
      events.on('test', () => {});
      
      await events.emit('test');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.assert(middlewareExecuted === true, 'Should execute middleware');
    });
    
    await this.test('Event filtering', async () => {
      const events = new EventSystem();
      
      let eventProcessed = false;
      
      // Add filter that blocks events
      events.addFilter('test', () => false);
      
      events.on('test', () => {
        eventProcessed = true;
      });
      
      await events.emit('test');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.assert(eventProcessed === false, 'Should filter out event');
    });
    
    await this.test('Error handling', async () => {
      const events = new EventSystem();
      
      let errorHandled = false;
      
      events.onError('test', (error) => {
        errorHandled = true;
      });
      
      events.on('test', () => {
        throw new Error('Test error');
      });
      
      await events.emit('test');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.assert(errorHandled === true, 'Should handle errors');
    });
    
    await this.test('Event metrics tracking', async () => {
      const events = new EventSystem();
      
      events.on('test', () => {});
      
      await events.emit('test');
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.assert(events.metrics.eventsProcessed > 0, 'Should track processed events');
      this.assert(events.eventMetrics.has('test'), 'Should track event-specific metrics');
    });
    
    await this.test('Health status', () => {
      const events = new EventSystem();
      
      const health = events.getHealthStatus();
      
      this.assert(typeof health === 'object', 'Health should be object');
      this.assert(typeof health.isHealthy === 'boolean', 'Should have health status');
      this.assert(typeof health.queueBacklog === 'number', 'Should have queue info');
      this.assert(typeof health.averageProcessingTime === 'number', 'Should have timing info');
    });
    
    console.log('✅ Event System Tests Complete\n');
  }

  /**
   * Test integration between modules
   */
  async testIntegration() {
    console.log('🔗 Testing Module Integration...');
    
    await this.test('Core framework initialization', async () => {
      const config = {
        botToken: 'test_token',
        togetherApiKey: 'test_key',
        openrouterApiKey: 'test_fallback',
        intents: ['GUILDS', 'GUILD_MESSAGES']
      };
      
      const core = new DiscordCore(config);
      
      // Test that all modules are properly instantiated
      this.assert(core.client instanceof DiscordClient, 'Should have Discord client');
      this.assert(core.ai instanceof AIEngine, 'Should have AI engine');
      this.assert(core.commands instanceof CommandHandler, 'Should have command handler');
      this.assert(core.serverManager instanceof ServerManager, 'Should have server manager');
      this.assert(core.nlp instanceof NLPEngine, 'Should have NLP engine');
      this.assert(core.events instanceof EventSystem, 'Should have event system');
      
      // Test module interconnections
      this.assert(core.commands.client === core.client, 'Commands should reference client');
      this.assert(core.commands.ai === core.ai, 'Commands should reference AI');
      this.assert(core.serverManager.client === core.client, 'Server manager should reference client');
      this.assert(core.nlp.ai === core.ai, 'NLP should reference AI');
    });
    
    await this.test('Event system integration', async () => {
      const config = {
        botToken: 'test_token',
        togetherApiKey: 'test_key'
      };
      
      const core = new DiscordCore(config);
      
      // Test event handler setup
      this.assert(typeof core.setupEventHandlers === 'function', 'Should have event setup');
      
      // Test that event system has built-in handlers
      const eventCount = core.events.eventListeners.size;
      this.assert(eventCount > 0, 'Should have registered event handlers');
    });
    
    await this.test('AI and NLP integration', async () => {
      const ai = new AIEngine('test_key', 'test_fallback');
      const nlp = new NLPEngine(ai);
      
      // Test that NLP can use AI engine
      this.assert(nlp.ai === ai, 'NLP should reference AI engine');
      
      // Test fallback response generation
      const response = nlp.generateFallbackIntent('test message', 'testuser');
      this.assert(typeof response === 'object', 'Should generate intent object');
      this.assert(typeof response.intent === 'string', 'Should have intent string');
    });
    
    await this.test('Command and server manager integration', () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      const serverManager = new ServerManager(client, ai);
      
      // Test that both can work with same client and AI
      this.assert(commands.client === serverManager.client, 'Should share client');
      this.assert(commands.ai === serverManager.ai, 'Should share AI engine');
      
      // Test command handler has server management commands
      this.assert(commands.commands.has('server'), 'Should have server command');
      this.assert(commands.commands.has('admin'), 'Should have admin command');
    });
    
    // Full integration test (skip if no tokens)
    if (!this.testConfig.skipIntegrationTests && !this.testConfig.skipAITests) {
      await this.test('Full framework integration', async () => {
        const config = {
          botToken: process.env.BOT_TOKEN,
          togetherApiKey: process.env.TOGETHER_API_KEY,
          openrouterApiKey: process.env.OPENROUTER_API_KEY,
          intents: ['GUILDS', 'GUILD_MESSAGES'],
          aiConfig: {
            mode: 'conservative',
            learningRate: 'low'
          }
        };
        
        const core = new DiscordCore(config);
        
        try {
          // Test initialization
          await core.initialize();
          
          this.assert(core.isActive === true, 'Core should be active');
          this.assert(core.botUser !== null, 'Should have bot user');
          
          // Test AI functionality
          const aiResponse = await core.ai.generateIntelligentResponse(
            'Hello, this is a test',
            'testuser',
            { type: 'test' }
          );
          
          this.assert(typeof aiResponse === 'string', 'Should get AI response');
          this.assert(aiResponse.length > 0, 'Response should not be empty');
          
          // Test graceful shutdown
          await core.shutdown();
          this.assert(core.isActive === false, 'Should shut down properly');
          
        } catch (error) {
          throw new Error(`Full integration failed: ${error.message}`);
        }
      });
    } else {
      this.skip('Full framework integration (missing tokens)');
    }
    
    console.log('✅ Integration Tests Complete\n');
  }

  /**
   * Test performance characteristics
   */
  async testPerformance() {
    console.log('⚡ Testing Performance...');
    
    await this.test('Module instantiation performance', () => {
      const startTime = Date.now();
      
      // Create multiple instances quickly
      for (let i = 0; i < 100; i++) {
        const client = new DiscordClient();
        const ai = new AIEngine('test', 'test');
        const events = new EventSystem();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.assert(duration < 5000, `Instantiation should be fast (took ${duration}ms)`);
    });
    
    await this.test('Event processing performance', async () => {
      const events = new EventSystem();
      
      let processedCount = 0;
      events.on('perf-test', () => {
        processedCount++;
      });
      
      const startTime = Date.now();
      
      // Emit many events
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(events.emit('perf-test', i));
      }
      
      await Promise.all(promises);
      
      // Wait for processing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.assert(processedCount === 100, 'Should process all events');
      this.assert(duration < 2000, `Event processing should be fast (took ${duration}ms)`);
    });
    
    await this.test('Memory usage patterns', () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Create and destroy many objects
      const objects = [];
      for (let i = 0; i < 1000; i++) {
        objects.push(new DiscordClient());
      }
      
      const peakMemory = process.memoryUsage().heapUsed;
      
      // Clear references
      objects.length = 0;
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (finalMemory - initialMemory) / 1024 / 1024; // MB
      
      this.assert(memoryIncrease < 50, `Memory increase should be reasonable (${memoryIncrease.toFixed(2)}MB)`);
    });
    
    await this.test('Command processing latency', async () => {
      const client = new DiscordClient();
      const ai = new AIEngine('test', 'test');
      const commands = new CommandHandler(client, ai);
      
      const startTime = Date.now();
      
      // Simulate rapid command processing
      for (let i = 0; i < 50; i++) {
        commands.trackCommandUsage('test', `user${i}`);
        commands.getOptionValue({ options: [{ name: 'test', value: 'value' }] }, 'test');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      this.assert(duration < 1000, `Command processing should be fast (took ${duration}ms)`);
    });
    
    console.log('✅ Performance Tests Complete\n');
  }

  // ===== TEST UTILITIES =====

  /**
   * Run individual test
   */
  async test(name, testFn) {
    this.testResults.total++;
    
    try {
      const startTime = Date.now();
      
      // Run test with timeout
      await Promise.race([
        testFn(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Test timeout')), this.testConfig.timeout)
        )
      ]);
      
      const duration = Date.now() - startTime;
      
      this.testResults.passed++;
      
      if (this.testConfig.verbose) {
        console.log(`  ✅ ${name} (${duration}ms)`);
      } else {
        process.stdout.write('.');
      }
      
    } catch (error) {
      this.testResults.failed++;
      this.testResults.failures.push({
        name,
        error: error.message,
        stack: error.stack
      });
      
      if (this.testConfig.verbose) {
        console.log(`  ❌ ${name}: ${error.message}`);
      } else {
        process.stdout.write('F');
      }
    }
  }

  /**
   * Skip a test
   */
  skip(name) {
    this.testResults.total++;
    this.testResults.skipped++;
    
    if (this.testConfig.verbose) {
      console.log(`  ⏭️ ${name} (SKIPPED)`);
    } else {
      process.stdout.write('S');
    }
  }

  /**
   * Assertion helper
   */
  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  /**
   * Generate final test report
   */
  generateTestReport() {
    const duration = Date.now() - this.testResults.startTime;
    const successRate = (this.testResults.passed / this.testResults.total) * 100;
    
    console.log('\n\n📊 Discord AI Core Test Results');
    console.log('='.repeat(50));
    console.log(`Tests Run:     ${this.testResults.total}`);
    console.log(`Passed:        ${this.testResults.passed} ✅`);
    console.log(`Failed:        ${this.testResults.failed} ❌`);
    console.log(`Skipped:       ${this.testResults.skipped} ⏭️`);
    console.log(`Success Rate:  ${successRate.toFixed(1)}%`);
    console.log(`Duration:      ${duration}ms`);
    console.log('='.repeat(50));
    
    if (this.testResults.failures.length > 0) {
      console.log('\n❌ Test Failures:');
      console.log('-'.repeat(30));
      
      this.testResults.failures.forEach((failure, index) => {
        console.log(`${index + 1}. ${failure.name}`);
        console.log(`   Error: ${failure.error}`);
        if (this.testConfig.verbose && failure.stack) {
          console.log(`   Stack: ${failure.stack.split('\n')[1]?.trim()}`);
        }
        console.log('');
      });
    }
    
    // Exit with appropriate code
    const exitCode = this.testResults.failed > 0 ? 1 : 0;
    
    if (exitCode === 0) {
      console.log('🎉 All tests passed! Discord AI Core is ready for deployment.');
    } else {
      console.log('💥 Some tests failed. Please review and fix issues before deployment.');
    }
    
    process.exit(exitCode);
  }
}

// ===== MAIN EXECUTION =====

/**
 * Run test suite
 */
async function runTests() {
  const testSuite = new CoreTestSuite();
  
  try {
    await testSuite.runAllTests();
  } catch (error) {
    console.error('❌ Test suite execution failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { CoreTestSuite, runTests };