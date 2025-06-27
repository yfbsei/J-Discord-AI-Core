// modules/discord-client.js - Discord Gateway Client (Bot Token Only)
import { EventEmitter } from 'events';

export class DiscordClient extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.token = null;
    this.user = null;
    this.guilds = new Map();
    this.channels = new Map();
    this.users = new Map();
    
    // Client configuration
    this.options = {
      intents: options.intents || 0,
      shardCount: options.shardCount || 1,
      ...options
    };
    
    // Connection state
    this.ws = null;
    this.sessionId = null;
    this.lastSequence = null;
    this.heartbeatInterval = null;
    this.connected = false;
    
    // API configuration
    this.apiVersion = '10';
    this.baseURL = `https://discord.com/api/v${this.apiVersion}`;
    this.gatewayURL = 'wss://gateway.discord.gg/?v=10&encoding=json';
    
    // Rate limiting
    this.rateLimits = new Map();
    this.requestQueue = [];
  }

  /**
   * Login to Discord using bot token
   */
  async login(token) {
    if (!token || !token.startsWith('Bot ')) {
      token = `Bot ${token}`;
    }
    
    this.token = token;
    
    console.log('🔐 Authenticating with Discord...');
    
    try {
      // Get bot user info
      const user = await this.api('users/@me');
      this.user = user;
      
      console.log(`✅ Authenticated as ${user.username}#${user.discriminator} (${user.id})`);
      
      // Connect to gateway
      await this.connectGateway();
      
      return user;
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }
  }

  /**
   * Connect to Discord Gateway
   */
  async connectGateway() {
    return new Promise((resolve, reject) => {
      try {
        console.log('🌐 Connecting to Discord Gateway...');
        
        const WebSocket = globalThis.WebSocket || eval('require')('ws');
        this.ws = new WebSocket(this.gatewayURL);
        
        this.ws.on('open', () => {
          console.log('📡 Gateway connection established');
          this.sendIdentify();
        });
        
        this.ws.on('message', (data) => {
          this.handleGatewayMessage(JSON.parse(data.toString()));
        });
        
        this.ws.on('close', (code) => {
          console.log(`🔌 Gateway connection closed (${code})`);
          this.connected = false;
          this.emit('disconnect');
          
          // Auto-reconnect logic
          setTimeout(() => this.connectGateway(), 5000);
        });
        
        this.ws.on('error', (error) => {
          console.error('❌ Gateway error:', error);
          reject(error);
        });
        
        // Resolve when ready
        this.once('ready', resolve);
        
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Send identify payload
   */
  sendIdentify() {
    const identify = {
      op: 2,
      d: {
        token: this.token,
        intents: this.options.intents,
        properties: {
          os: process.platform,
          browser: 'discord-ai-core',
          device: 'discord-ai-core'
        },
        compress: false,
        large_threshold: 50,
        shard: [0, this.options.shardCount]
      }
    };
    
    this.ws.send(JSON.stringify(identify));
  }

  /**
   * Handle gateway messages
   */
  handleGatewayMessage(packet) {
    const { op, d, s, t } = packet;
    
    if (s) {
      this.lastSequence = s;
    }
    
    switch (op) {
      case 0: // Dispatch
        this.handleDispatch(t, d);
        break;
        
      case 1: // Heartbeat request
        this.sendHeartbeat();
        break;
        
      case 10: // Hello
        this.startHeartbeat(d.heartbeat_interval);
        break;
        
      case 11: // Heartbeat ACK
        break;
        
      default:
        console.log(`🔍 Unknown gateway opcode: ${op}`);
    }
  }

  /**
   * Handle dispatch events
   */
  handleDispatch(event, data) {
    switch (event) {
      case 'READY':
        this.handleReady(data);
        break;
        
      case 'GUILD_CREATE':
        this.handleGuildCreate(data);
        break;
        
      case 'INTERACTION_CREATE':
        this.emit('interactionCreate', data);
        break;
        
      case 'MESSAGE_CREATE':
        this.emit('messageCreate', data);
        break;
        
      default:
        this.emit(event.toLowerCase(), data);
    }
  }

  /**
   * Handle ready event
   */
  handleReady(data) {
    console.log(`🟢 Bot ready! Serving ${data.guilds.length} guilds`);
    
    this.user = data.user;
    this.sessionId = data.session_id;
    this.connected = true;
    
    // Cache guilds
    for (const guild of data.guilds) {
      this.guilds.set(guild.id, guild);
    }
    
    this.emit('ready');
  }

  /**
   * Handle guild create
   */
  handleGuildCreate(guild) {
    this.guilds.set(guild.id, guild);
    
    // Cache channels
    if (guild.channels) {
      for (const channel of guild.channels) {
        this.channels.set(channel.id, channel);
      }
    }
    
    this.emit('guildCreate', guild);
  }

  /**
   * Start heartbeat
   */
  startHeartbeat(interval) {
    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, interval);
  }

  /**
   * Send heartbeat
   */
  sendHeartbeat() {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({
        op: 1,
        d: this.lastSequence
      }));
    }
  }

  /**
   * Set bot presence
   */
  async setPresence(presence) {
    if (this.ws && this.ws.readyState === 1) {
      this.ws.send(JSON.stringify({
        op: 3,
        d: presence
      }));
    }
  }

  /**
   * Discord API request handler
   */
  async api(endpoint, options = {}) {
    const url = `${this.baseURL}/${endpoint}`;
    
    const headers = {
      'Authorization': this.token,
      'Content-Type': 'application/json',
      'User-Agent': 'DiscordBot (discord-ai-core, 1.0.0)',
      ...options.headers
    };

    // Rate limiting check
    await this.checkRateLimit(endpoint);

    try {
      const fetch = globalThis.fetch || (await import('node-fetch')).default;
      
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
      });

      // Update rate limits
      this.updateRateLimit(endpoint, response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Discord API Error: ${response.status} - ${JSON.stringify(errorData)}`);
      }

      return response.json();
    } catch (error) {
      console.error(`❌ API Error [${endpoint}]:`, error.message);
      throw error;
    }
  }

  /**
   * Rate limiting management
   */
  async checkRateLimit(endpoint) {
    const route = this.getRouteKey(endpoint);
    const rateLimit = this.rateLimits.get(route);
    
    if (rateLimit && rateLimit.resetTime > Date.now()) {
      const waitTime = rateLimit.resetTime - Date.now();
      console.log(`⏳ Rate limited on ${route}, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  updateRateLimit(endpoint, headers) {
    const route = this.getRouteKey(endpoint);
    const remaining = parseInt(headers.get('x-ratelimit-remaining')) || 1;
    const resetAfter = parseInt(headers.get('x-ratelimit-reset-after')) || 1;
    
    if (remaining === 0) {
      this.rateLimits.set(route, {
        resetTime: Date.now() + (resetAfter * 1000)
      });
    }
  }

  getRouteKey(endpoint) {
    return endpoint.split('/').slice(0, 2).join('/');
  }

  /**
   * Create DM channel
   */
  async createDM(userId) {
    return this.api('users/@me/channels', {
      method: 'POST',
      body: { recipient_id: userId }
    });
  }

  /**
   * Send message
   */
  async sendMessage(channelId, content) {
    return this.api(`channels/${channelId}/messages`, {
      method: 'POST',
      body: typeof content === 'string' ? { content } : content
    });
  }

  /**
   * Create guild
   */
  async createGuild(options) {
    return this.api('guilds', {
      method: 'POST',
      body: options
    });
  }

  /**
   * Get guild
   */
  async getGuild(guildId) {
    return this.api(`guilds/${guildId}`);
  }

  /**
   * Modify guild
   */
  async modifyGuild(guildId, options) {
    return this.api(`guilds/${guildId}`, {
      method: 'PATCH',
      body: options
    });
  }

  /**
   * Create channel
   */
  async createChannel(guildId, options) {
    return this.api(`guilds/${guildId}/channels`, {
      method: 'POST',
      body: options
    });
  }

  /**
   * Modify channel
   */
  async modifyChannel(channelId, options) {
    return this.api(`channels/${channelId}`, {
      method: 'PATCH',
      body: options
    });
  }

  /**
   * Delete channel
   */
  async deleteChannel(channelId) {
    return this.api(`channels/${channelId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Create role
   */
  async createRole(guildId, options) {
    return this.api(`guilds/${guildId}/roles`, {
      method: 'POST',
      body: options
    });
  }

  /**
   * Modify role
   */
  async modifyRole(guildId, roleId, options) {
    return this.api(`guilds/${guildId}/roles/${roleId}`, {
      method: 'PATCH',
      body: options
    });
  }

  /**
   * Delete role
   */
  async deleteRole(guildId, roleId) {
    return this.api(`guilds/${guildId}/roles/${roleId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Add member role
   */
  async addMemberRole(guildId, userId, roleId) {
    return this.api(`guilds/${guildId}/members/${userId}/roles/${roleId}`, {
      method: 'PUT'
    });
  }

  /**
   * Remove member role
   */
  async removeMemberRole(guildId, userId, roleId) {
    return this.api(`guilds/${guildId}/members/${userId}/roles/${roleId}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get guild members
   */
  async getGuildMembers(guildId, limit = 1000, after = '0') {
    return this.api(`guilds/${guildId}/members?limit=${limit}&after=${after}`);
  }

  /**
   * Kick member
   */
  async kickMember(guildId, userId, reason = null) {
    return this.api(`guilds/${guildId}/members/${userId}`, {
      method: 'DELETE',
      headers: reason ? { 'X-Audit-Log-Reason': reason } : {}
    });
  }

  /**
   * Ban member
   */
  async banMember(guildId, userId, options = {}) {
    return this.api(`guilds/${guildId}/bans/${userId}`, {
      method: 'PUT',
      body: options
    });
  }

  /**
   * Disconnect from Discord
   */
  disconnect() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    if (this.ws) {
      this.ws.close();
    }
    
    this.connected = false;
    console.log('🔌 Disconnected from Discord');
  }

  /**
   * Reconnect to Discord
   */
  async reconnect() {
    console.log('🔄 Reconnecting to Discord...');
    this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.connectGateway();
  }
}