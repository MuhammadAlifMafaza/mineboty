const mineflayer = require('mineflayer');
const config = require('./config.json');

function createBot() {
    const bot = mineflayer.createBot({
        host: config.server.ip,
        port: config.server.port,
        username: config["bot-account"].username,
        password: config["bot-account"].password || undefined
    });

    bot.on('login', () => {
        console.log(`[BOT] ${bot.username} connected to ${config.server.ip}`);
    });

    bot.on('spawn', () => {
        console.log(`[BOT] Spawned in the server.`);

        // Auto Login for AuthMe servers
        if (config.utils["auto-auth"].enabled && config.utils["auto-auth"].password) {
            bot.chat(`/login ${config.utils["auto-auth"].password}`);
        }

        // Start Anti-AFK if enabled
        if (config.utils["anti-afk"].enabled) {
            startAntiAFK(bot);
        }

        // Start Auto Chat Messages if enabled
        if (config.utils["chat-messages"].enabled) {
            startAutoChat(bot);
        }
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return; // Ignore bot's own messages

        // Auto-Responses
        if (message.toLowerCase().includes('hello')) {
            bot.chat(`Hello ${username}! Welcome to the server.`);
        }

        // Admin Commands
        if (config.utils["list-admin"].adminUsers.includes(username)) {
            if (message === "!jump") {
                bot.chat("Jumping!");
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 1000);
            }
            if (message === "!stop") {
                bot.chat("Stopping movement.");
                stopAntiAFK(bot);
            }
            if (message === "!coords") {
                const { x, y, z } = bot.entity.position;
                bot.chat(`My coordinates: X=${x.toFixed(1)} Y=${y.toFixed(1)} Z=${z.toFixed(1)}`);
            }
        }
    });

    bot.on('end', () => {
        console.log('[BOT] Disconnected.');
        if (config.utils.autoReconnect) {
            console.log('[BOT] Reconnecting in 10 seconds...');
            setTimeout(createBot, 10000);
        }
    });

    bot.on('error', (err) => {
        console.error('[BOT] Error:', err);
    });
}

// **Anti-AFK Movement**
let afkInterval;
function startAntiAFK(bot) {
    afkInterval = setInterval(() => {
        const actions = ['jump', 'sneak', 'forward', 'back', 'left', 'right'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        bot.setControlState(randomAction, true);
        setTimeout(() => bot.setControlState(randomAction, false), 1000);
    }, config.utils["anti-afk"]["random-move-interval"] * 1000);

    if (config.utils["anti-afk"].sneak) {
        bot.setControlState('sneak', true);
    }
}

function stopAntiAFK(bot) {
    clearInterval(afkInterval);
    bot.setControlState('sneak', false); // Stop sneaking when AFK is disabled
}

// **Auto Chat Messages**
function startAutoChat(bot) {
    if (!config.utils["chat-messages"].enabled) return; // Stop if disabled

    let index = 0;
    setInterval(() => {
        const messages = config.utils["chat-messages"].messages;
        if (messages.length > 0) {
            bot.chat(messages[index]);
            index = (index + 1) % messages.length;
        }
    }, config.utils["chat-messages"]["repeat-delay"] * 1000);
}

// **Start the bot**
createBot();