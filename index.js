const mineflayer = require('mineflayer');
const config = require('./config.json');

function createBot() {
    const bot = mineflayer.createBot({
        host: config.server,
        port: config.port,
        username: config.username,
        password: config.password || undefined,
    });

    bot.on('login', () => {
        console.log(`${bot.username} has joined the server.`);
    });

    bot.on('spawn', () => {
        console.log(`${bot.username} is now in the game.`);

        // Prevent kicking by sending movements
        if (config.stayAFK) {
            setInterval(() => {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 500);
            }, 30000); // Jumps every 30 seconds
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

// Start the bot
createBot();
