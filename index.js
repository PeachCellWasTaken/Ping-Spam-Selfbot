const { Client, Intents } = require('discord.js-selfbot-v13');
const config = require('./config.js');
const figlet = require('figlet');
const chalk = require('chalk').default;

const client = new Client({
    checkUpdate: false,
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.MESSAGE_CONTENT
    ]
});

const cooldowns = new Map();

// =======================
// Utility Functions
// =======================
const displayAsciiArt = () => {
    figlet('Maz Pinger', (err, data) => {
        if (err) return console.log(chalk.red(err));
        console.log(chalk.cyan(data));
    });
};

const showBotInfo = () => {
    console.log(chalk.yellow('==========================================='));
    console.log(chalk.green(`Signed in as: ${client.user.tag}`));
    console.log(chalk.cyan(`Server count: ${client.guilds.cache.size}`));
    console.log(chalk.yellow('==========================================='));
};

const showHelp = () => {
    console.log(chalk.magenta(`
===================================================
Mazach Empire Beta Commands:

${config.prefix}p - Mass ping
${config.prefix}sp - Single ping (50 users)
${config.prefix}spm [message] [amount] - Active user spam with ping
${config.prefix}send [message] [amount] - Send message multiple times
${config.prefix}s [message] [amount] - Simple send message multiple times
${config.prefix}react [emoji] [amount] - Auto-react to recent messages
${config.prefix}serverinfo - Show server information

Profile / Status Commands:
${config.prefix}status [text] - Set custom status
${config.prefix}play [text] - Set playing activity
${config.prefix}watch [text] - Set watching activity
${config.prefix}listen [text] - Set listening activity
${config.prefix}stream [text] - Set streaming activity
${config.prefix}clearstatus - Clear activities/status
${config.prefix}av [url] - Change avatar
${config.prefix}name [newName] - Change username
${config.prefix}nick [newNickname] - Change server nickname

Copyright © MazachEmpire
Support Server: https://discord.gg/EjfUqUv4DU
===================================================
`));
};

const chunkMessages = (mentionsArray, maxLength = 2000) => {
    let chunks = [];
    let current = '';
    mentionsArray.forEach(mention => {
        if (current.length + mention.length + 1 > maxLength) {
            chunks.push(current.trim());
            current = '';
        }
        current += mention + ' ';
    });
    if (current.trim().length > 0) chunks.push(current.trim());
    return chunks;
};

// =======================
// Ready Event
// =======================
client.on('ready', () => {
    console.clear();
    displayAsciiArt();
    showBotInfo();
    showHelp();
});

// =======================
// Message Commands
// =======================
client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) return;

    const now = Date.now();
    const isOnCooldown = (cmd) => cooldowns.has(cmd) && (now - cooldowns.get(cmd)) < (config.cooldowns?.[cmd] || 0);
    const setCooldown = (cmd) => cooldowns.set(cmd, now);

    // =======================
    // Mass Ping
    // =======================
    if (message.content === `${config.prefix}p`) {
        if (isOnCooldown('p')) return console.log(chalk.yellow('Mass ping cooldown.'));
        setCooldown('p');

        try {
            await message.delete().catch(() => {});
            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.isText() && c.viewable);
            let recentUsers = new Set();

            for (const channel of textChannels.values()) {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    messages.forEach(msg => { if (!msg.author.bot) recentUsers.add(msg.author.id); });
                } catch {}
            }

            await guild.members.fetch();
            const eligibleMembers = guild.members.cache.filter(m =>
                recentUsers.has(m.id) &&
                !m.user.bot &&
                !m.roles.cache.some(r => r.permissions.has('ADMINISTRATOR'))
            );

            if (eligibleMembers.size < 6) return console.log(chalk.yellow('Not enough eligible members.'));
            const mentions = eligibleMembers.map(m => `<@${m.id}>`);
            const chunks = chunkMessages(mentions);

            for (const chunk of chunks) {
                const sent = await message.channel.send(chunk);
                setTimeout(() => sent.delete().catch(() => {}), config.spDeleteDelay);
            }
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // Single Ping
    // =======================
    if (message.content === `${config.prefix}sp`) {
        if (isOnCooldown('sp')) return console.log(chalk.yellow('Single ping cooldown.'));
        setCooldown('sp');

        try {
            await message.delete().catch(() => {});
            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.isText() && c.viewable);
            let recentUsers = new Set();

            for (const channel of textChannels.values()) {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    messages.forEach(msg => { if (!msg.author.bot) recentUsers.add(msg.author.id); });
                } catch {}
            }

            await guild.members.fetch();
            const eligibleMembers = guild.members.cache.filter(m =>
                recentUsers.has(m.id) &&
                !m.user.bot &&
                !m.roles.cache.some(r => r.permissions.has('ADMINISTRATOR'))
            ).first(50);

            if (eligibleMembers.length < 5) return console.log(chalk.yellow('Not enough eligible members.'));
            for (const m of eligibleMembers) {
                const sent = await message.channel.send(`<@${m.id}>`);
                setTimeout(() => sent.delete().catch(() => {}), config.spDeleteDelay);
            }
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // SPM
    // =======================
    if (message.content.startsWith(`${config.prefix}spm `)) {
        if (isOnCooldown('spm')) return console.log(chalk.yellow('SPM cooldown.'));
        setCooldown('spm');

        const args = message.content.split(' ').slice(1);
        const amount = parseInt(args[args.length - 1]);
        const msgToSend = args.slice(0, -1).join(' ');
        if (!msgToSend || isNaN(amount)) return console.log(chalk.red(`Usage: ${config.prefix}spm [message] [amount]`));

        try {
            await message.delete().catch(() => {});
            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.isText() && c.viewable);
            let recentUsers = new Set();

            for (const channel of textChannels.values()) {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    messages.forEach(msg => { if (!msg.author.bot) recentUsers.add(msg.author.id); });
                } catch {}
            }

            await guild.members.fetch();
            const eligibleMembers = guild.members.cache.filter(m =>
                recentUsers.has(m.id) &&
                !m.user.bot &&
                !m.roles.cache.some(r => r.permissions.has('ADMINISTRATOR'))
            ).first(amount);

            for (const m of eligibleMembers) await message.channel.send(`<@${m.id}> ${msgToSend}`);
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // Send
    // =======================
    if (message.content.startsWith(`${config.prefix}send `)) {
        if (isOnCooldown('send')) return console.log(chalk.yellow('Send cooldown.'));
        setCooldown('send');

        const args = message.content.split(' ').slice(1);
        const amount = parseInt(args[args.length - 1]);
        const msgToSend = args.slice(0, -1).join(' ');
        if (!msgToSend || isNaN(amount)) return console.log(chalk.red(`Usage: ${config.prefix}send [message] [amount]`));

        try {
            await message.delete().catch(() => {});
            for (let i = 0; i < amount; i++) await message.channel.send(msgToSend);
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // Simple Send (-s)
    // =======================
    if (message.content.startsWith(`${config.prefix}s `)) {
        if (isOnCooldown('s')) return console.log(chalk.yellow('Simple send cooldown.'));
        setCooldown('s');

        const args = message.content.split(' ').slice(1);
        const amount = parseInt(args[args.length - 1]);
        const msgToSend = args.slice(0, -1).join(' ');
        if (!msgToSend || isNaN(amount)) return console.log(chalk.red(`Usage: ${config.prefix}s [message] [amount]`));

        try {
            await message.delete().catch(() => {});
            for (let i = 0; i < amount; i++) await message.channel.send(msgToSend);
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // Auto-Reactor
    // =======================
    if (message.content.startsWith(`${config.prefix}react `)) {
        if (isOnCooldown('react')) return console.log(chalk.yellow('React cooldown.'));
        setCooldown('react');

        const args = message.content.split(' ').slice(1);
        const emoji = args[0];
        const amount = parseInt(args[1]) || 5;
        if (!emoji) return console.log(chalk.red(`Usage: ${config.prefix}react [emoji] [amount]`));

        try {
            await message.delete().catch(() => {});
            const messages = await message.channel.messages.fetch({ limit: amount });
            for (const msg of messages.values()) {
                try { await msg.react(emoji); } catch {}
            }
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // Server Info
    // =======================
    if (message.content === `${config.prefix}serverinfo`) {
        if (isOnCooldown('serverinfo')) return console.log(chalk.yellow('ServerInfo cooldown.'));
        setCooldown('serverinfo');

        try {
            await message.delete().catch(() => {});
            const guild = message.guild;
            await guild.members.fetch();
            const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
            const textChannels = guild.channels.cache.filter(c => c.isText()).size;
            const voiceChannels = guild.channels.cache.filter(c => c.isVoice()).size;
            const roles = guild.roles.cache.size;

            await message.channel.send(`
📌 Server: ${guild.name}
🆔 ID: ${guild.id}
👥 Members: ${guild.memberCount} (Online: ${online})
💬 Text Channels: ${textChannels}
🔊 Voice Channels: ${voiceChannels}
🎭 Roles: ${roles}
🗓 Created: ${guild.createdAt.toDateString()}
`);
        } catch (err) { console.error(chalk.red(err)); }
    }

    // =======================
    // Profile / Status / Nick / Avatar
    // =======================
    if (message.content.startsWith(`${config.prefix}status `)) {
        const status = message.content.split(' ').slice(1).join(' ');
        client.user.setPresence({ activities: [{ name: status }], status: 'online' });
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}play `)) {
        const game = message.content.split(' ').slice(1).join(' ');
        client.user.setPresence({ activities: [{ name: game, type: 'PLAYING' }], status: 'online' });
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}watch `)) {
        const text = message.content.split(' ').slice(1).join(' ');
        client.user.setPresence({ activities: [{ name: text, type: 'WATCHING' }], status: 'online' });
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}listen `)) {
        const text = message.content.split(' ').slice(1).join(' ');
        client.user.setPresence({ activities: [{ name: text, type: 'LISTENING' }], status: 'online' });
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}stream `)) {
        const text = message.content.split(' ').slice(1).join(' ');
        client.user.setPresence({ activities: [{ name: text, type: 'STREAMING', url: 'https://twitch.tv/mazach' }], status: 'online' });
        await message.delete().catch(() => {});
    }

    if (message.content === `${config.prefix}clearstatus`) {
        client.user.setPresence({ activities: [], status: 'online' });
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}av `)) {
        const url = message.content.split(' ')[1];
        if (url) client.user.setAvatar(url).catch(() => {});
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}name `)) {
        const newName = message.content.split(' ').slice(1).join(' ');
        if (newName) client.user.setUsername(newName).catch(() => {});
        await message.delete().catch(() => {});
    }

    if (message.content.startsWith(`${config.prefix}nick `)) {
        const newNick = message.content.split(' ').slice(1).join(' ');
        if (newNick && message.guild) {
            const member = message.guild.members.cache.get(client.user.id);
            member.setNickname(newNick).catch(() => {});
        }
        await message.delete().catch(() => {});
    }

});

client.login(config.token);
