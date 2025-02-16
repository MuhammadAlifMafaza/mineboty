const mineflayer = require('mineflayer');
const config = require('./config.json');

function createBot() {
    const bot = mineflayer.createBot({
        host: config.server,
        port: config.port,
        username: config.username,
        password: config.password || undefined
    });

    bot.on('login', () => {
        console.log(`${bot.username} has joined the server.`);
    });

    bot.on('spawn', () => {
        console.log(`${bot.username} is now in the game.`);

        // Start anti-AFK movement
        if (config.stayAFK) startAntiAFK(bot);
    });

    bot.on('chat', (username, message) => {
        if (username === bot.username) return; // Ignore bot's own messages

        // Auto-Responses
        if (message.toLowerCase().includes('hello')) {
            bot.chat(`Hello ${username}!`);
        }
        if (message.toLowerCase().includes('how are you')) {
            bot.chat(`I'm just a bot, but I'm doing great!`);
        }

        // Admin Commands
        if (config.adminUsers.includes(username)) {
            if (message === "!jump") {
                bot.chat("Jumping!");
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 1000);
            }
            if (message === "!stop") {
                bot.chat("Stopping movement.");
                stopAntiAFK();
            }
            if (message === "!coords") {
                const { x, y, z } = bot.entity.position;
                bot.chat(`My coordinates: X=${x.toFixed(1)} Y=${y.toFixed(1)} Z=${z.toFixed(1)}`);
            }
        }
    });

    bot.on('end', () => {
        console.log('Bot disconnected.');
        if (config.autoReconnect) {
            console.log('Reconnecting in 10 seconds...');
            setTimeout(createBot, 10000);
        }
    });

    bot.on('error', (err) => {
        console.error('Bot error:', err);
    });
}

// Anti-AFK Movement
let afkInterval;
function startAntiAFK(bot) {
    afkInterval = setInterval(() => {
        const actions = ['jump', 'forward', 'back', 'left', 'right'];
        const randomAction = actions[Math.floor(Math.random() * actions.length)];

        bot.setControlState(randomAction, true);
        setTimeout(() => bot.setControlState(randomAction, false), 1000);
    }, 30000); // Every 30 seconds
}

function stopAntiAFK() {
    clearInterval(afkInterval);
}

// Start the bot
createBot();
