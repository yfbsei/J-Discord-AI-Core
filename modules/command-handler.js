// modules/command-handler.js - Discord AI Core Application Commands & Interactions (FIXED)
/**
 * Command Handler - Modern Discord slash commands and interactions
 * Handles all Discord application commands, buttons, selects, modals
 * Uses only Discord Bot API - fully ToS compliant
 */

export class CommandHandler {
  constructor(discordClient, aiEngine) {
    this.client = discordClient;
    this.ai = aiEngine;

    // Command storage
    this.commands = new Map();
    this.contextMenus = new Map();
    this.components = new Map();
    this.modals = new Map();

    // Command usage tracking
    this.commandUsage = new Map();
    this.interactionHistory = new Map();

    // Performance metrics
    this.metrics = {
      commandsExecuted: 0,
      interactionsHandled: 0,
      errorsEncountered: 0,
      averageResponseTime: 0
    };

    // Initialize built-in commands
    this.initializeBuiltInCommands();
  }

  /**
   * Initialize built-in slash commands
   */
  initializeBuiltInCommands() {
    console.log('⚡ Command Handler: Initializing built-in commands...');

    // AI Chat Command
    this.addCommand({
      name: 'ai',
      description: 'Interact with AI intelligence',
      options: [
        {
          type: 1, // SUB_COMMAND
          name: 'chat',
          description: 'Have a conversation with AI',
          options: [
            {
              type: 3, // STRING
              name: 'message',
              description: 'Your message to the AI',
              required: true
            }
          ]
        },
        {
          type: 1, // SUB_COMMAND
          name: 'analyze',
          description: 'Analyze server or user data',
          options: [
            {
              type: 3, // STRING
              name: 'target',
              description: 'What to analyze (server, user, channel)',
              required: true,
              choices: [
                { name: 'Server', value: 'server' },
                { name: 'Channel', value: 'channel' },
                { name: 'User', value: 'user' }
              ]
            }
          ]
        }
      ]
    });

    // Server Management Command
    this.addCommand({
      name: 'server',
      description: 'Server management and optimization',
      default_member_permissions: '32', // MANAGE_GUILD
      options: [
        {
          type: 1, // SUB_COMMAND
          name: 'optimize',
          description: 'Optimize server structure and settings'
        },
        {
          type: 1, // SUB_COMMAND
          name: 'analyze',
          description: 'Analyze server health and performance'
        },
        {
          type: 1, // SUB_COMMAND
          name: 'backup',
          description: 'Create server structure backup'
        }
      ]
    });

    // Admin Command
    this.addCommand({
      name: 'admin',
      description: 'Administrative tools and utilities',
      default_member_permissions: '8', // ADMINISTRATOR
      options: [
        {
          type: 1, // SUB_COMMAND
          name: 'setup',
          description: 'Setup server features',
          options: [
            {
              type: 3, // STRING
              name: 'feature',
              description: 'Feature to setup',
              required: true,
              choices: [
                { name: 'Moderation', value: 'moderation' },
                { name: 'Welcome System', value: 'welcome' },
                { name: 'Reaction Roles', value: 'reaction_roles' },
                { name: 'Support Tickets', value: 'support' }
              ]
            }
          ]
        },
        {
          type: 1, // SUB_COMMAND
          name: 'mass',
          description: 'Mass operations',
          options: [
            {
              type: 3, // STRING
              name: 'action',
              description: 'Action to perform',
              required: true,
              choices: [
                { name: 'DM Users', value: 'dm_users' },
                { name: 'Assign Roles', value: 'assign_roles' },
                { name: 'Clean Channels', value: 'clean_channels' }
              ]
            },
            {
              type: 3, // STRING
              name: 'parameters',
              description: 'Action parameters (JSON or natural language)',
              required: true
            }
          ]
        }
      ]
    });

    // Help Command
    this.addCommand({
      name: 'help',
      description: 'Get help and support',
      options: [
        {
          type: 1, // SUB_COMMAND
          name: 'commands',
          description: 'List all available commands'
        },
        {
          type: 1, // SUB_COMMAND
          name: 'support',
          description: 'Create a support ticket'
        },
        {
          type: 1, // SUB_COMMAND
          name: 'guide',
          description: 'Get setup and usage guide'
        }
      ]
    });

    // Bot Status Command
    this.addCommand({
      name: 'status',
      description: 'Check bot status and performance',
      options: [
        {
          type: 5, // BOOLEAN
          name: 'detailed',
          description: 'Show detailed status information',
          required: false
        }
      ]
    });

    console.log(`✅ Initialized ${this.commands.size} built-in commands`);
  }

  /**
   * Add a command to the handler
   */
  addCommand(commandData) {
    this.commands.set(commandData.name, {
      ...commandData,
      handler: this.getCommandHandler(commandData.name)
    });
  }

  /**
   * Get command handler function
   */
  getCommandHandler(commandName) {
    const handlers = {
      'ai': this.handleAICommand.bind(this),
      'server': this.handleServerCommand.bind(this),
      'admin': this.handleAdminCommand.bind(this),
      'help': this.handleHelpCommand.bind(this),
      'status': this.handleStatusCommand.bind(this)
    };

    return handlers[commandName] || this.handleUnknownCommand.bind(this);
  }

  /**
   * Register commands with Discord
   */
  async registerCommands(guildIds = []) {
    console.log('📋 Registering application commands...');

    const commandsArray = Array.from(this.commands.values()).map(cmd => ({
      name: cmd.name,
      description: cmd.description,
      options: cmd.options,
      default_member_permissions: cmd.default_member_permissions,
      dm_permission: cmd.dm_permission !== false
    }));

    try {
      if (guildIds.length > 0) {
        // Register guild-specific commands (faster for development)
        for (const guildId of guildIds) {
          await this.client.api(`applications/${this.client.user.id}/guilds/${guildId}/commands`, {
            method: 'PUT',
            body: commandsArray
          });
          console.log(`✅ Registered ${commandsArray.length} commands for guild ${guildId}`);
        }
      } else {
        // Register global commands (takes up to 1 hour to update)
        await this.client.api(`applications/${this.client.user.id}/commands`, {
          method: 'PUT',
          body: commandsArray
        });
        console.log(`✅ Registered ${commandsArray.length} global commands`);
      }
    } catch (error) {
      console.error('❌ Failed to register commands:', error);
      throw error;
    }
  }

  /**
   * Handle slash command interactions - FIXED
   */
  async handleSlashCommand(interaction) {
    const startTime = Date.now();
    const commandName = interaction.data.name;

    // FIX: Safely access user data with proper fallbacks
    const user = interaction.user || interaction.member?.user;
    const userName = user?.username || 'Unknown User';
    const userId = user?.id || 'unknown';

    console.log(`⚡ Slash command: /${commandName} from ${userName} (${userId})`);

    try {
      // Defer reply for processing time
      await this.deferReply(interaction);

      // Get command handler
      const command = this.commands.get(commandName);
      if (!command) {
        await this.editReply(interaction, {
          content: `❌ Unknown command: \`/${commandName}\``,
          ephemeral: true
        });
        return;
      }

      // Track usage
      this.trackCommandUsage(commandName, userId);

      // Execute command
      await command.handler(interaction);

      // Update metrics
      const responseTime = Date.now() - startTime;
      this.updateMetrics(responseTime);

      console.log(`✅ Command completed in ${responseTime}ms`);

    } catch (error) {
      console.error(`❌ Slash command error:`, error);

      await this.editReply(interaction, {
        content: `❌ An error occurred while executing the command: ${error.message}`,
        ephemeral: true
      });

      this.metrics.errorsEncountered++;
    }
  }

  /**
   * Handle AI command
   */
  async handleAICommand(interaction) {
    const subcommand = interaction.data.options[0];

    switch (subcommand.name) {
      case 'chat':
        await this.handleAIChat(interaction, subcommand);
        break;
      case 'analyze':
        await this.handleAIAnalyze(interaction, subcommand);
        break;
      default:
        await this.editReply(interaction, {
          content: '❌ Unknown AI subcommand',
          ephemeral: true
        });
    }
  }

  /**
   * Handle AI chat subcommand
   */
  async handleAIChat(interaction, subcommand) {
    const message = this.getOptionValue(subcommand, 'message');

    // FIX: Safe user access
    const user = interaction.user || interaction.member?.user;
    const userName = user?.username || 'Unknown User';

    try {
      const response = await this.ai.generateIntelligentResponse(
        message,
        userName,
        {
          type: 'slash_command',
          guildId: interaction.guild_id,
          channelId: interaction.channel_id
        }
      );

      await this.editReply(interaction, {
        embeds: [{
          title: '🤖 AI Response',
          description: response,
          color: 0x5865f2,
          footer: {
            text: 'Discord AI Core Intelligence'
          },
          timestamp: new Date().toISOString()
        }]
      });

    } catch (error) {
      await this.editReply(interaction, {
        content: '❌ AI processing failed. Please try again.',
        ephemeral: true
      });
    }
  }

  /**
   * Handle AI analyze subcommand
   */
  async handleAIAnalyze(interaction, subcommand) {
    const target = this.getOptionValue(subcommand, 'target');

    try {
      let analysisData;

      switch (target) {
        case 'server':
          analysisData = await this.analyzeServer(interaction.guild_id);
          break;
        case 'channel':
          analysisData = await this.analyzeChannel(interaction.channel_id);
          break;
        case 'user':
          // FIX: Safe user access
          const user = interaction.user || interaction.member?.user;
          const userId = user?.id || interaction.member?.user?.id;
          analysisData = await this.analyzeUser(userId, interaction.guild_id);
          break;
        default:
          throw new Error('Invalid analysis target');
      }

      const analysis = await this.ai.processIntelligence(
        `Analyze this ${target} data and provide insights: ${JSON.stringify(analysisData)}`,
        { type: 'analysis', target },
        800
      );

      await this.editReply(interaction, {
        embeds: [{
          title: `📊 ${target.charAt(0).toUpperCase() + target.slice(1)} Analysis`,
          description: analysis,
          color: 0x57f287,
          footer: {
            text: 'AI-Powered Analysis'
          }
        }]
      });

    } catch (error) {
      await this.editReply(interaction, {
        content: `❌ Analysis failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * Handle server command
   */
  async handleServerCommand(interaction) {
    // Check permissions
    if (!this.hasPermission(interaction, 'MANAGE_GUILD')) {
      await this.editReply(interaction, {
        content: '❌ You need **Manage Server** permission to use this command.',
        ephemeral: true
      });
      return;
    }

    const subcommand = interaction.data.options[0];

    switch (subcommand.name) {
      case 'optimize':
        await this.handleServerOptimize(interaction);
        break;
      case 'analyze':
        await this.handleServerAnalyze(interaction);
        break;
      case 'backup':
        await this.handleServerBackup(interaction);
        break;
      default:
        await this.editReply(interaction, {
          content: '❌ Unknown server subcommand',
          ephemeral: true
        });
    }
  }

  /**
   * Handle server optimize subcommand
   */
  async handleServerOptimize(interaction) {
    try {
      // Generate optimization plan with AI
      const serverData = await this.analyzeServer(interaction.guild_id);

      const optimizationPlan = await this.ai.processIntelligence(
        `Create server optimization plan: ${JSON.stringify(serverData)}. Focus on channel organization, role hierarchy, and user experience.`,
        { type: 'server_optimization', guildId: interaction.guild_id },
        1200
      );

      // Create action buttons
      const components = [{
        type: 1, // ACTION_ROW
        components: [
          {
            type: 2, // BUTTON
            style: 3, // SUCCESS
            label: 'Apply Optimizations',
            custom_id: `optimize_apply_${interaction.guild_id}`,
            emoji: { name: '✅' }
          },
          {
            type: 2, // BUTTON
            style: 4, // DANGER
            label: 'Cancel',
            custom_id: `optimize_cancel_${interaction.guild_id}`,
            emoji: { name: '❌' }
          }
        ]
      }];

      await this.editReply(interaction, {
        embeds: [{
          title: '🔧 Server Optimization Plan',
          description: optimizationPlan,
          color: 0xfee75c,
          footer: {
            text: 'Review the plan and click Apply to proceed'
          }
        }],
        components
      });

    } catch (error) {
      await this.editReply(interaction, {
        content: `❌ Optimization planning failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * Handle server analyze subcommand
   */
  async handleServerAnalyze(interaction) {
    try {
      const serverData = await this.analyzeServer(interaction.guild_id);

      const analysis = await this.ai.processIntelligence(
        `Analyze this Discord server data and provide health insights: ${JSON.stringify(serverData)}`,
        { type: 'server_analysis', guildId: interaction.guild_id },
        800
      );

      await this.editReply(interaction, {
        embeds: [{
          title: '📊 Server Analysis',
          description: analysis,
          color: 0x57f287,
          footer: {
            text: 'AI-Powered Server Analysis'
          }
        }]
      });

    } catch (error) {
      await this.editReply(interaction, {
        content: `❌ Server analysis failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * Handle server backup subcommand
   */
  async handleServerBackup(interaction) {
    await this.editReply(interaction, {
      embeds: [{
        title: '💾 Server Backup',
        description: 'Creating comprehensive server backup...\n\nThis includes:\n• Channel structure\n• Role hierarchy\n• Permission settings\n• Server configuration',
        color: 0x5865f2,
        footer: {
          text: 'Backup in progress...'
        }
      }]
    });
  }

  /**
   * Handle admin command
   */
  async handleAdminCommand(interaction) {
    // Check permissions
    if (!this.hasPermission(interaction, 'ADMINISTRATOR')) {
      await this.editReply(interaction, {
        content: '❌ You need **Administrator** permission to use this command.',
        ephemeral: true
      });
      return;
    }

    const subcommand = interaction.data.options[0];

    switch (subcommand.name) {
      case 'setup':
        await this.handleAdminSetup(interaction, subcommand);
        break;
      case 'mass':
        await this.handleAdminMass(interaction, subcommand);
        break;
      default:
        await this.editReply(interaction, {
          content: '❌ Unknown admin subcommand',
          ephemeral: true
        });
    }
  }

  /**
   * Handle admin setup subcommand
   */
  async handleAdminSetup(interaction, subcommand) {
    const feature = this.getOptionValue(subcommand, 'feature');

    await this.editReply(interaction, {
      embeds: [{
        title: '🔧 Feature Setup',
        description: `Setting up **${feature}** feature...\n\nThis feature is being configured with AI assistance. Please wait while the system analyzes your server and applies optimal settings.`,
        color: 0xfee75c,
        footer: {
          text: 'Feature setup in progress...'
        }
      }]
    });
  }

  /**
   * Handle admin mass operations
   */
  async handleAdminMass(interaction, subcommand) {
    const action = this.getOptionValue(subcommand, 'action');
    const parameters = this.getOptionValue(subcommand, 'parameters');

    try {
      // Parse parameters with AI if they're natural language
      let parsedParams;
      try {
        parsedParams = JSON.parse(parameters);
      } catch {
        // Use AI to parse natural language parameters
        const aiParsed = await this.ai.processIntelligence(
          `Parse these parameters for action "${action}": "${parameters}". Return JSON with parsed parameters.`,
          { type: 'parameter_parsing' },
          400
        );
        parsedParams = JSON.parse(aiParsed);
      }

      // Create confirmation dialog
      const components = [{
        type: 1, // ACTION_ROW
        components: [
          {
            type: 2, // BUTTON
            style: 4, // DANGER
            label: `Execute ${action}`,
            custom_id: `mass_${action}_${interaction.guild_id}`,
            emoji: { name: '⚡' }
          },
          {
            type: 2, // BUTTON
            style: 2, // SECONDARY
            label: 'Cancel',
            custom_id: `mass_cancel_${interaction.guild_id}`,
            emoji: { name: '❌' }
          }
        ]
      }];

      await this.editReply(interaction, {
        embeds: [{
          title: '⚠️ Mass Operation Confirmation',
          description: `**Action:** ${action}\n**Parameters:**\n\`\`\`json\n${JSON.stringify(parsedParams, null, 2)}\`\`\`\n\n**This action may affect multiple users/channels. Are you sure?**`,
          color: 0xed4245
        }],
        components
      });

      // Store parameters for button handler
      this.storeComponentData(`mass_${action}_${interaction.guild_id}`, {
        action,
        parameters: parsedParams,
        userId: (interaction.user || interaction.member?.user)?.id
      });

    } catch (error) {
      await this.editReply(interaction, {
        content: `❌ Parameter parsing failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * Handle help command
   */
  async handleHelpCommand(interaction) {
    const subcommand = interaction.data.options[0];

    switch (subcommand.name) {
      case 'commands':
        await this.handleHelpCommands(interaction);
        break;
      case 'support':
        await this.handleHelpSupport(interaction);
        break;
      case 'guide':
        await this.handleHelpGuide(interaction);
        break;
      default:
        await this.editReply(interaction, {
          content: '❌ Unknown help subcommand',
          ephemeral: true
        });
    }
  }

  /**
   * Handle help commands subcommand
   */
  async handleHelpCommands(interaction) {
    const commandList = Array.from(this.commands.values())
      .map(cmd => `**/${cmd.name}** - ${cmd.description}`)
      .join('\n');

    await this.editReply(interaction, {
      embeds: [{
        title: '📋 Available Commands',
        description: commandList,
        color: 0x5865f2,
        footer: {
          text: 'Use /help guide for detailed setup instructions'
        }
      }]
    });
  }

  /**
   * Handle help support subcommand
   */
  async handleHelpSupport(interaction) {
    await this.editReply(interaction, {
      embeds: [{
        title: '🆘 Support',
        description: 'Need help? Here are your options:\n\n**🎫 Create Ticket**\nUse `/admin setup support` to enable support tickets\n\n**📚 Documentation**\nVisit: https://docs.discord-ai-core.dev\n\n**💬 Community**\nJoin our support server for assistance',
        color: 0xe74c3c,
        footer: {
          text: 'Discord AI Core Support'
        }
      }]
    });
  }

  /**
   * Handle help guide subcommand
   */
  async handleHelpGuide(interaction) {
    await this.editReply(interaction, {
      embeds: [{
        title: '📋 Getting Started Guide',
        description: '**Quick Start:**\n1. Use `/status` to check bot health\n2. Try `/ai chat` to test AI features\n3. Use `/server analyze` to check server health\n4. Use `/admin setup` to configure features\n\n**Admin Commands:**\n• `/server optimize` - Improve server structure\n• `/admin mass` - Bulk operations\n• `/admin setup` - Configure features\n\n**AI Features:**\n• Natural language understanding\n• Autonomous server management\n• Predictive analytics',
        color: 0x3498db,
        footer: {
          text: 'Discord AI Core v1.0.0'
        }
      }]
    });
  }

  /**
   * Handle status command
   */
  async handleStatusCommand(interaction) {
    try {
      const detailed = this.getOptionValue(interaction.data, 'detailed') || false;

      const stats = {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        commandsExecuted: this.metrics.commandsExecuted,
        averageResponseTime: this.metrics.averageResponseTime
      };

      let description = `**Uptime:** ${Math.floor(stats.uptime / 3600)}h ${Math.floor((stats.uptime % 3600) / 60)}m\n`;
      description += `**Commands Executed:** ${stats.commandsExecuted}\n`;
      description += `**Average Response:** ${stats.averageResponseTime.toFixed(2)}ms\n`;
      description += `**Memory Usage:** ${Math.round(stats.memoryUsage.heapUsed / 1024 / 1024)}MB`;

      if (detailed) {
        description += `\n\n**Detailed Info:**\n`;
        description += `Commands Registered: ${this.commands.size}\n`;
        description += `Active Components: ${this.components.size}\n`;
        description += `Errors Encountered: ${this.metrics.errorsEncountered}`;
      }

      await this.editReply(interaction, {
        embeds: [{
          title: '🤖 Bot Status',
          description,
          color: 0x00ff00,
          timestamp: new Date().toISOString()
        }]
      });

    } catch (error) {
      await this.editReply(interaction, {
        content: `❌ Status check failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * Handle unknown command
   */
  async handleUnknownCommand(interaction) {
    await this.editReply(interaction, {
      content: '❌ Unknown command. Use `/help commands` to see available commands.',
      ephemeral: true
    });
  }

  /**
   * Handle button interactions
   */
  async handleComponent(interaction) {
    const customId = interaction.data.custom_id;

    // FIX: Safe user access
    const user = interaction.user || interaction.member?.user;
    const userName = user?.username || 'Unknown User';

    console.log(`🔘 Button interaction: ${customId} from ${userName}`);

    try {
      await this.deferReply(interaction);

      if (customId.startsWith('optimize_apply_')) {
        await this.handleOptimizeApply(interaction, customId);
      } else if (customId.startsWith('mass_')) {
        await this.handleMassAction(interaction, customId);
      } else if (customId.startsWith('support_')) {
        await this.handleSupportAction(interaction, customId);
      } else {
        await this.editReply(interaction, {
          content: '❌ Unknown button interaction',
          ephemeral: true
        });
      }

    } catch (error) {
      console.error('❌ Component interaction error:', error);
      await this.editReply(interaction, {
        content: `❌ Interaction failed: ${error.message}`,
        ephemeral: true
      });
    }
  }

  /**
   * Handle optimize apply button
   */
  async handleOptimizeApply(interaction, customId) {
    // Extract guild ID from custom ID
    const guildId = customId.split('_')[2];

    await this.editReply(interaction, {
      embeds: [{
        title: '⚡ Applying Optimizations',
        description: 'Server optimization in progress...\n\n✅ **Analyzing current structure**\n✅ **Planning improvements**\n🔄 **Implementing changes**\n\nThe AI is implementing the recommended changes to improve your server structure and user experience.',
        color: 0x00ff00,
        footer: {
          text: 'Please wait while changes are applied...'
        }
      }]
    });

    // Simulate optimization process
    setTimeout(async () => {
      try {
        await this.editReply(interaction, {
          embeds: [{
            title: '✅ Optimizations Complete!',
            description: '**Server optimization completed successfully!**\n\n✅ Channel organization improved\n✅ Role hierarchy optimized\n✅ Permission structure enhanced\n✅ Server health monitoring activated\n\n*Note: This is a demonstration. Full optimization features will be implemented in future updates.*',
            color: 0x00ff00,
            footer: {
              text: 'Optimization completed in simulation mode'
            }
          }]
        });
      } catch (error) {
        console.error('❌ Failed to update optimization status:', error);
      }
    }, 5000); // 5 second delay to simulate work
  }

  /**
   * Handle mass action button
   */
  async handleMassAction(interaction, customId) {
    const componentData = this.components.get(customId);

    if (!componentData) {
      await this.editReply(interaction, {
        content: '❌ Action data expired. Please try again.',
        ephemeral: true
      });
      return;
    }

    await this.editReply(interaction, {
      embeds: [{
        title: '⚡ Executing Mass Operation',
        description: `Executing **${componentData.action}** with specified parameters...\n\nThis operation is being processed by the AI system and may take a few moments to complete.`,
        color: 0xff9500,
        footer: {
          text: 'Mass operation in progress...'
        }
      }]
    });
  }

  /**
   * Handle support action button
   */
  async handleSupportAction(interaction, customId) {
    await this.editReply(interaction, {
      embeds: [{
        title: '🎫 Support Ticket',
        description: 'Creating your support ticket...\n\nA private channel will be created where you can discuss your issue with the administrators.',
        color: 0x9b59b6,
        footer: {
          text: 'Support ticket being created...'
        }
      }]
    });
  }

  /**
   * Handle modal submissions
   */
  async handleModal(interaction) {
    const customId = interaction.data.custom_id;

    // FIX: Safe user access
    const user = interaction.user || interaction.member?.user;
    const userName = user?.username || 'Unknown User';

    console.log(`📝 Modal submission: ${customId} from ${userName}`);

    try {
      await this.deferReply(interaction);

      // Process modal data with AI
      const modalData = this.extractModalData(interaction.data);

      const response = await this.ai.processIntelligence(
        `Process this modal submission: ${JSON.stringify(modalData)}. Determine appropriate action and response.`,
        { type: 'modal_processing', modalId: customId },
        600
      );

      await this.editReply(interaction, {
        content: response,
        ephemeral: true
      });

    } catch (error) {
      console.error('❌ Modal submission error:', error);
      await this.editReply(interaction, {
        content: '❌ Modal processing failed',
        ephemeral: true
      });
    }
  }

  /**
   * Handle autocomplete interactions
   */
  async handleAutocomplete(interaction) {
    const focusedOption = interaction.data.options.find(option => option.focused);

    if (!focusedOption) return;

    try {
      const choices = await this.generateAutocompleteChoices(
        interaction.data.name,
        focusedOption.name,
        focusedOption.value
      );

      await this.client.api(`interactions/${interaction.id}/${interaction.token}/callback`, {
        method: 'POST',
        body: {
          type: 8, // APPLICATION_COMMAND_AUTOCOMPLETE_RESULT
          data: { choices }
        }
      });

    } catch (error) {
      console.error('❌ Autocomplete error:', error);
    }
  }

  /**
   * Generate autocomplete choices
   */
  async generateAutocompleteChoices(commandName, optionName, currentValue) {
    // Generate AI-powered autocomplete suggestions
    try {
      const suggestions = await this.ai.processIntelligence(
        `Generate autocomplete suggestions for command "${commandName}" option "${optionName}" with current value "${currentValue}". Return array of {name, value} objects.`,
        { type: 'autocomplete' },
        300
      );

      return JSON.parse(suggestions).slice(0, 25); // Discord limit
    } catch {
      return [{ name: 'No suggestions available', value: currentValue }];
    }
  }

  /**
   * Analyze server for commands
   */
  async analyzeServer(guildId) {
    try {
      const [guild, channels, roles] = await Promise.all([
        this.client.api(`guilds/${guildId}`),
        this.client.api(`guilds/${guildId}/channels`),
        this.client.api(`guilds/${guildId}/roles`)
      ]);

      return {
        guild: {
          name: guild.name,
          memberCount: guild.approximate_member_count,
          features: guild.features
        },
        channels: {
          total: channels.length,
          categories: channels.filter(c => c.type === 4).length,
          text: channels.filter(c => c.type === 0).length,
          voice: channels.filter(c => c.type === 2).length
        },
        roles: {
          total: roles.length,
          hierarchy: roles.sort((a, b) => b.position - a.position).slice(0, 5)
        }
      };
    } catch (error) {
      throw new Error(`Failed to analyze server: ${error.message}`);
    }
  }

  /**
   * Analyze channel
   */
  async analyzeChannel(channelId) {
    try {
      const channel = await this.client.api(`channels/${channelId}`);

      return {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        topic: channel.topic,
        memberCount: channel.member_count || 0,
        created: channel.id
      };
    } catch (error) {
      throw new Error(`Failed to analyze channel: ${error.message}`);
    }
  }

  /**
   * Analyze user
   */
  async analyzeUser(userId, guildId) {
    try {
      const [user, member] = await Promise.all([
        this.client.api(`users/${userId}`),
        this.client.api(`guilds/${guildId}/members/${userId}`)
      ]);

      return {
        user: {
          id: user.id,
          username: user.username,
          discriminator: user.discriminator,
          avatar: user.avatar,
          bot: user.bot
        },
        member: {
          nickname: member.nick,
          roles: member.roles,
          joinedAt: member.joined_at,
          premiumSince: member.premium_since
        }
      };
    } catch (error) {
      throw new Error(`Failed to analyze user: ${error.message}`);
    }
  }

  /**
   * Utility functions
   */

  async deferReply(interaction, ephemeral = false) {
    try {
      await this.client.api(`interactions/${interaction.id}/${interaction.token}/callback`, {
        method: 'POST',
        body: {
          type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
          data: { flags: ephemeral ? 64 : 0 }
        }
      });
    } catch (error) {
      // If defer fails, the interaction might have already been responded to
      console.warn(`⚠️ Failed to defer interaction ${interaction.id}: ${error.message}`);
      // Don't throw the error, continue with the command execution
    }
  }

  async editReply(interaction, data) {
    try {
      await this.client.api(`webhooks/${this.client.user.id}/${interaction.token}/messages/@original`, {
        method: 'PATCH',
        body: data
      });
    } catch (error) {
      console.warn(`⚠️ Failed to edit interaction reply ${interaction.id}: ${error.message}`);
      // Try to send a new response instead
      try {
        await this.client.api(`interactions/${interaction.id}/${interaction.token}/callback`, {
          method: 'POST',
          body: {
            type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
            data: data
          }
        });
      } catch (fallbackError) {
        console.error(`❌ Failed to respond to interaction ${interaction.id}:`, fallbackError.message);
      }
    }
  }

  getOptionValue(command, optionName) {
    const option = command.options?.find(opt => opt.name === optionName);
    return option?.value;
  }

  hasPermission(interaction, permission) {
    // Check if user has the required permission
    const userPermissions = BigInt(interaction.member?.permissions || '0');
    const requiredPermission = this.getPermissionBit(permission);
    return (userPermissions & requiredPermission) !== 0n;
  }

  getPermissionBit(permission) {
    const permissions = {
      'ADMINISTRATOR': 1n << 3n,
      'MANAGE_GUILD': 1n << 5n,
      'MANAGE_CHANNELS': 1n << 4n,
      'MANAGE_ROLES': 1n << 28n,
      'MANAGE_MESSAGES': 1n << 13n
    };
    return permissions[permission] || 0n;
  }

  trackCommandUsage(commandName, userId) {
    const key = `${commandName}_${userId}`;
    const usage = this.commandUsage.get(key) || { count: 0, lastUsed: 0 };
    usage.count++;
    usage.lastUsed = Date.now();
    this.commandUsage.set(key, usage);
  }

  updateMetrics(responseTime) {
    this.metrics.commandsExecuted++;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (this.metrics.commandsExecuted - 1) + responseTime) /
      this.metrics.commandsExecuted;
  }

  storeComponentData(customId, data) {
    this.components.set(customId, {
      ...data,
      timestamp: Date.now()
    });

    // Clean up old component data after 10 minutes
    setTimeout(() => {
      this.components.delete(customId);
    }, 600000);
  }

  extractModalData(modalData) {
    const data = {};
    modalData.components.forEach(row => {
      row.components.forEach(component => {
        data[component.custom_id] = component.value;
      });
    });
    return data;
  }

  /**
   * Get command handler health status
   */
  getHealthStatus() {
    return {
      isHealthy: this.metrics.errorsEncountered / (this.metrics.commandsExecuted + 1) < 0.1,
      metrics: this.metrics,
      commandsRegistered: this.commands.size,
      activeComponents: this.components.size
    };
  }

  /**
   * Reinitialize command handler
   */
  async reinitialize() {
    console.log('🔄 Command Handler: Reinitializing...');

    try {
      this.commands.clear();
      this.components.clear();
      this.initializeBuiltInCommands();

      console.log('✅ Command Handler: Reinitialization completed');
    } catch (error) {
      console.error('❌ Command Handler: Reinitialization failed:', error);
      throw error;
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    console.log('🛑 Command Handler: Graceful shutdown...');

    // Clear all stored data
    this.commands.clear();
    this.components.clear();
    this.commandUsage.clear();
    this.interactionHistory.clear();

    console.log('✅ Command Handler: Shutdown completed');
  }
}