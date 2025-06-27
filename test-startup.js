// test-startup.js
console.log('🔍 Testing Discord AI Core startup...');

import dotenv from 'dotenv';
dotenv.config();

console.log('📋 Environment variables loaded:');
console.log('  BOT_TOKEN:', process.env.BOT_TOKEN ? 'SET' : 'MISSING');
console.log('  TOGETHER_API_KEY:', process.env.TOGETHER_API_KEY ? 'SET' : 'MISSING');
console.log('  APPLICATION_ID:', process.env.APPLICATION_ID ? 'SET' : 'MISSING');

try {
    console.log('📦 Importing Discord AI Core...');

    const { DiscordCore } = await import('./modules/core.js');
    console.log('✅ Core imported successfully');

    const config = {
        botToken: process.env.BOT_TOKEN,
        togetherApiKey: process.env.TOGETHER_API_KEY,
        openrouterApiKey: process.env.OPENROUTER_API_KEY,
        applicationId: process.env.APPLICATION_ID,
        guildIds: JSON.parse(process.env.GUILD_IDS || '[]'),
        intents: ['GUILDS', 'GUILD_MESSAGES', 'MESSAGE_CONTENT']
    };

    console.log('🤖 Creating Discord Core instance...');
    const core = new DiscordCore(config);
    console.log('✅ Discord Core created');

    console.log('🚀 Starting initialization...');
    await core.initialize();
    console.log('✅ Discord AI Core initialized successfully!');

} catch (error) {
    console.error('❌ Startup failed:', error);
    console.error('Stack:', error.stack);
}