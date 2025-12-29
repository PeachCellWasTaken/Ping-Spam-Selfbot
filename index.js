const { Client, Intents } = require('discord.js-selfbot-v13');
const config = require('./config.js');
const figlet = require('figlet');
const chalk = require('chalk').default;
const openModule = require('open');
const open = openModule.default || openModule;

const client = new Client({
    checkUpdate: false,
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.DIRECT_MESSAGES
    ]
});

const cooldowns = new Map();

const displayAsciiArt = () => {
    figlet.text('Miku Selfbot', {
        font: 'Slant',
        horizontalLayout: 'default',
        verticalLayout: 'default'
    }, (err, data) => {
        if (err) return console.log(chalk.red(err));
        console.log(chalk.cyan(data));
        console.log(chalk.black('================== Ossyra Raiding Inc. =================='));
    });
};

const showBotInfo = () => {
    console.log(chalk.whiteBright('====================== Bot Info ========================'));
    console.log(chalk.blackBright(`Logged in as: ${client.user.tag}`));
    console.log(chalk.blackBright(`Server count: ${client.guilds.cache.size}`));
    console.log(chalk.whiteBright('======================================================='));
};
const showHelp = () => {
    console.log(chalk.cyanBright(`
==================== Commands ====================
${config.prefix}p - Mass ping active users ^_^
${config.prefix}sp - Single ping (50 users) <3
${config.prefix}spm [message] [amount] - Ping users with custom message :P
${config.prefix}s [message] [amount] - Simple repeated message :3
${config.prefix}react [emoji] [amount] - React to recent messages >.<
${config.prefix}serverinfo - Server info O.O
${config.prefix}miku - Show Miku image and send 3 GIFs :^

Status/Profile Commands:
${config.prefix}status [text] - Custom status
${config.prefix}play [text] - Playing activity
${config.prefix}watch [text] - Watching activity
${config.prefix}listen [text] - Listening activity
${config.prefix}stream [text] - Streaming activity
${config.prefix}clearstatus - Clear status/activity
${config.prefix}av [url] - Change avatar
${config.prefix}name [newName] - Change username
${config.prefix}nick [newNickname] - Change nickname

Copyright © Ossyra Raiding Inc.
Support Server: https://discord.gg/ZHCv9w5njC
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

const openMikuWindow = async () => {
    try {
        await open('https://open.spotify.com/track/7aux5UvnlBDYlrlwoczifW');
    } catch (err) {
        console.error(err);
    }
};




client.on('ready', () => {
    console.clear();
    showHelp();
    displayAsciiArt();
    showBotInfo();
});

client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) return;

    const now = Date.now();
    const isOnCooldown = (cmd) => cooldowns.has(cmd) && (now - cooldowns.get(cmd)) < (config.cooldowns?.[cmd] || 0);
    const setCooldown = (cmd) => cooldowns.set(cmd, now);

    const args = message.content.split(' ').slice(1);
    const command = message.content.split(' ')[0].slice(config.prefix.length).toLowerCase();

    if (['p', 'sp', 'spm'].includes(command)) {
        if (isOnCooldown(command)) return console.log(chalk.yellow(`${command.toUpperCase()} cooldown.`));
        setCooldown(command);
        try {
            await message.delete().catch(() => {});
            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' && c.viewable);
            let recentUsers = new Set();
            for (const channel of textChannels.values()) {
                try {
                    const msgs = await channel.messages.fetch({ limit: 100 });
                    msgs.forEach(m => { if (!m.author.bot) recentUsers.add(m.author.id); });
                } catch {}
            }
            await guild.members.fetch();
            let eligibleMembers = Array.from(guild.members.cache.values())
                .filter(m => recentUsers.has(m.id) && !m.user.bot && !m.roles.cache.some(r => r.permissions.has('ADMINISTRATOR')));
            if (command === 'sp') eligibleMembers = eligibleMembers.slice(0, 50);
            if (command === 'spm') eligibleMembers = eligibleMembers.slice(0, parseInt(args.pop()));
            const msgText = command === 'spm' ? args.join(' ') : null;
            for (const m of eligibleMembers) {
                const sent = await message.channel.send(command === 'spm' ? `<@${m.id}> ${msgText}` : `<@${m.id}>`);
                setTimeout(() => sent.delete().catch(() => {}), config.spDeleteDelay);
            }
        } catch (err) { console.error(chalk.red(err)); }
    }

    if (command === 's') {
        if (isOnCooldown('s')) return console.log(chalk.yellow('Send cooldown.'));
        setCooldown('s');
        const amount = parseInt(args.pop());
        const msgToSend = args.join(' ');
        if (!msgToSend || isNaN(amount)) return console.log(chalk.red(`Usage: ${config.prefix}s [message] [amount]`));
        try {
            await message.delete().catch(() => {});
            for (let i = 0; i < amount; i++) await message.channel.send(msgToSend);
        } catch (err) { console.error(chalk.red(err)); }
    }

    if (command === 'react' && args[0]) {
        if (isOnCooldown('react')) return console.log(chalk.yellow('React cooldown.'));
        setCooldown('react');
        const emoji = args[0];
        const amount = parseInt(args[1]) || 5;
        try {
            await message.delete().catch(() => {});
            const messages = await message.channel.messages.fetch({ limit: amount });
            for (const msg of messages.values()) try { await msg.react(emoji); } catch {}
        } catch (err) { console.error(chalk.red(err)); }
    }

    if (command === 'serverinfo') {
        if (isOnCooldown('serverinfo')) return console.log(chalk.yellow('ServerInfo cooldown.'));
        setCooldown('serverinfo');
        try {
            await message.delete().catch(() => {});
            const guild = message.guild;
            await guild.members.fetch();
            const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
            const textChannels = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT').size;
            const voiceChannels = guild.channels.cache.filter(c => c.type === 'GUILD_VOICE').size;
            const roles = guild.roles.cache.size;
            await message.channel.send(`📌 Server: ${guild.name}\n🆔 ID: ${guild.id}\n👥 Members: ${guild.memberCount} (Online: ${online})\n💬 Text Channels: ${textChannels}\n🔊 Voice Channels: ${voiceChannels}\n🎭 Roles: ${roles}\n🗓 Created: ${guild.createdAt.toDateString()}`);
        } catch (err) { console.error(chalk.red(err)); }
    }

    if (command === 'miku') {
        if (isOnCooldown('miku')) return console.log(chalk.yellow('Miku cooldown.'));
        setCooldown('miku');
        await message.delete().catch(() => {});
        openMikuWindow();
        const gifs = [
            'https://tenor.com/view/hatsune-miku-miku-hatsune-miku-hatsune-washing-machine-gif-4863029126409914383',
            'https://tenor.com/view/hatsune-miku-dance-gif-17336707970086322223',
            'https://tenor.com/view/miku-hatsune-miku-miku-hatsune-mike-blue-gif-8475412111460217467'
        ];
        for (const gif of gifs) try { await message.channel.send(gif); } catch {}
        console.log(chalk.green('ok'));
    }

    const statusCommands = ['status', 'play', 'watch', 'listen', 'stream', 'clearstatus', 'av', 'name', 'nick'];
    if (statusCommands.includes(command)) {
        try {
            await message.delete().catch(() => {});
            const input = args.join(' ');
            switch (command) {
                case 'status': client.user.setPresence({ activities: [{ name: input }], status: 'online' }); break;
                case 'play': client.user.setPresence({ activities: [{ name: input, type: 'PLAYING' }], status: 'online' }); break;
                case 'watch': client.user.setPresence({ activities: [{ name: input, type: 'WATCHING' }], status: 'online' }); break;
                case 'listen': client.user.setPresence({ activities: [{ name: input, type: 'LISTENING' }], status: 'online' }); break;
                case 'stream': client.user.setPresence({ activities: [{ name: input, type: 'STREAMING', url: 'https://twitch.tv/arko' }], status: 'online' }); break;
                case 'clearstatus': client.user.setPresence({ activities: [], status: 'online' }); break;
                case 'av': if (input) client.user.setAvatar(input).catch(() => {}); break;
                case 'name': if (input) client.user.setUsername(input).catch(() => {}); break;
                case 'nick': if (input && message.guild) {
                    const member = message.guild.members.cache.get(client.user.id);
                    member.setNickname(input).catch(() => {});
                } break;
            }
        } catch (err) { console.error(chalk.red(err)); }
    }
});
// ok
client.login(config.token);
