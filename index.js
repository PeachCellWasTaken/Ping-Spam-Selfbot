const { Client, Intents } = require('discord.js-selfbot-v13');
const config = require('./config.js');
const figlet = require('figlet');
const chalk = require('chalk').default;
const openModule = require('open');
const open = openModule.default || openModule;

const BLOCKED_GUILD = Buffer.from('MTQ0ODE2MDgyNDQ2NzI2MzcxMQ==', 'base64').toString('ascii');

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
    figlet.text('Ossyra Selfbot', { font: 'Slant' }, (err, data) => {
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
${config.prefix}p
${config.prefix}sp
${config.prefix}spm [message] [amount]
${config.prefix}s [message] [amount]
${config.prefix}react [emoji] [amount]
${config.prefix}ghostping <user>
${config.prefix}serverinfo
${config.prefix}miku
${config.prefix}arko
${config.prefix}rickroll
${config.prefix}status [name]
${config.prefix}play [name]
${config.prefix}watch [name]
${config.prefix}listen [name]
${config.prefix}stream [name]
${config.prefix}clearstatus
${config.prefix}av [image url]
${config.prefix}name [new username]
${config.prefix}nick [new nickname]
=================================================
`));
};

const openMikuWindow = async () => {
    try {
        await open('https://open.spotify.com/track/7aux5UvnlBDYlrlwoczifW');
    } catch {}
};

const HAILARKO = async () => {
    try {
        await open('https://open.spotify.com/track/5XpCZoQBmYk3APbuAJqL3D');
    } catch {}
};

client.on('ready', () => {
    console.clear();
    showHelp();
    displayAsciiArt();
    showBotInfo();
    client.user.setPresence({
        activities: [{ name: 'Praise Arko!', type: 'PLAYING' }],
        status: 'online'
    });
});

client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) return;
    if (message.guild && message.guild.id === BLOCKED_GUILD) return;

    const now = Date.now();
    const isOnCooldown = cmd =>
        cooldowns.has(cmd) &&
        (now - cooldowns.get(cmd)) < (config.cooldowns?.[cmd] || 0);
    const setCooldown = cmd => cooldowns.set(cmd, now);

    const args = message.content.split(' ').slice(1);
    const command = message.content.split(' ')[0].slice(config.prefix.length).toLowerCase();

    if (['p', 'sp', 'spm'].includes(command)) {
        if (isOnCooldown(command)) return;
        setCooldown(command);
        await message.delete().catch(() => {});

        try {
            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' && c.viewable);
            const recentUsers = new Set();

            for (const channel of textChannels.values()) {
                try {
                    const msgs = await channel.messages.fetch({ limit: 100 });
                    msgs.forEach(m => {
                        if (!m.author.bot && m.author.id !== message.author.id) recentUsers.add(m.author.id);
                    });
                } catch {}
            }

            await guild.members.fetch();

            let eligibleMembers = guild.members.cache.filter(m =>
                recentUsers.has(m.id) &&
                m.id !== message.author.id &&
                !m.user.bot &&
                !m.roles.cache.some(r => r.permissions.has('ADMINISTRATOR'))
            ).map(m => m);

            if (command === 'sp') eligibleMembers = eligibleMembers.slice(0, 50);
            if (command === 'spm') eligibleMembers = eligibleMembers.slice(0, parseInt(args.at(-1)));

            const msgText = command === 'spm' ? args.slice(0, -1).join(' ') : null;

            for (const m of eligibleMembers) {
                const sent = await message.channel.send(
                    command === 'spm' ? `<@${m.id}> ${msgText}` : `<@${m.id}>`
                );
                if (command !== 'spm') setTimeout(() => sent.delete().catch(() => {}), config.spDeleteDelay);
            }
        } catch (err) { console.error(chalk.red(err)); }
    }

    if (command === 's') {
        if (isOnCooldown('s')) return;
        setCooldown('s');

        const amount = parseInt(args.pop());
        const msgToSend = args.join(' ');
        if (!msgToSend || isNaN(amount)) return;

        await message.delete().catch(() => {});
        for (let i = 0; i < amount; i++) await message.channel.send(msgToSend);
    }

    if (command === 'react' && args[0]) {
        if (isOnCooldown('react')) return;
        setCooldown('react');

        const emoji = args[0];
        const amount = parseInt(args[1]) || 5;

        await message.delete().catch(() => {});
        const messages = await message.channel.messages.fetch({ limit: amount });
        for (const msg of messages.values()) if (msg.author.id !== message.author.id) msg.react(emoji).catch(() => {});
    }

    if (command === 'ghostping') {
        if (isOnCooldown('ghostping')) return;
        setCooldown('ghostping');

        await message.delete().catch(() => {});
        const target = message.mentions.users.first() || client.users.cache.get(args[0]);
        if (!target || target.id === message.author.id) return;

        for (let i = 0; i < 5; i++) {
            const msg = await message.channel.send(`<@${target.id}>`).catch(() => {});
            if (!msg) continue;
            setTimeout(() => msg.delete().catch(() => {}), 10);
        }
    }

    if (command === 'serverinfo') {
        if (isOnCooldown('serverinfo')) return;
        setCooldown('serverinfo');

        await message.delete().catch(() => {});
        const guild = message.guild;
        await guild.members.fetch();
        const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        await message.channel.send(`Server: ${guild.name}\nMembers: ${guild.memberCount} (Online: ${online})`);
    }

    if (command === 'miku') {
        if (isOnCooldown('miku')) return;
        setCooldown('miku');

        await message.delete().catch(() => {});
        openMikuWindow();

        const gifs = [
            'https://tenor.com/view/hatsune-miku-miku-hatsune-miku-hatsune-washing-machine-gif-4863029126409914383',
            'https://tenor.com/view/hatsune-miku-dance-gif-17336707970086322223',
            'https://tenor.com/view/miku-hatsune-miku-miku-hatsune-mike-blue-gif-8475412111460217467'
        ];

        for (const gif of gifs) await message.channel.send(gif).catch(() => {});
    }

    if (command === 'arko') {
        if (isOnCooldown('arko')) return;
        setCooldown('arko');

        await message.delete().catch(() => {});
        HAILARKO();

        const gifs = [
            'https://tenor.com/view/vox-dei-hazbin-hotel-season-2-i%27m-your-omega-i%27m-the-furor-gif-6975458452159725586',
            'https://tenor.com/view/vox-vox-dei-hazbin-hazbin-hotel-gif-13414791909520971365',
            'https://tenor.com/view/vox-hazbin-hotel-season-2-hazbin-hotel-climbing-stairs-vox-hazbin-gif-5303639584145184169'
        ];

        for (const gif of gifs) await message.channel.send(gif).catch(() => {});
        await message.channel.send('# PRAISE ARKO!');
        console.log(chalk.green('PRAISE ARKO!'));
    }

    if (command === 'rickroll') {
        if (isOnCooldown('rickroll')) return;
        setCooldown('rickroll');

        await message.delete().catch(() => {});

        const rickrollUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        await message.channel.send('🎵 **Never gonna give you up!**');
        await message.channel.send(rickrollUrl).catch(() => {});

        console.log(chalk.blue('Someone got rickrolled.'));
    }
    
    const statusCommands = ['status','play','watch','listen','stream','clearstatus','av','name','nick'];
    if (statusCommands.includes(command)) {
        await message.delete().catch(() => {});
        const input = args.join(' ');

        if (command === 'status') client.user.setPresence({ activities: [{ name: input || 'Praise Arko!', type: 'PLAYING' }], status: 'online' });
        if (command === 'play') client.user.setPresence({ activities: [{ name: input, type: 'PLAYING' }], status: 'online' });
        if (command === 'watch') client.user.setPresence({ activities: [{ name: input, type: 'WATCHING' }], status: 'online' });
        if (command === 'listen') client.user.setPresence({ activities: [{ name: input, type: 'LISTENING' }], status: 'online' });
        if (command === 'stream') client.user.setPresence({ activities: [{ name: input, type: 'STREAMING', url: 'https://twitch.tv/arko' }], status: 'online' });
        if (command === 'clearstatus') client.user.setPresence({ activities: [{ name: 'Praise Arko!', type: 'PLAYING' }], status: 'online' });
        if (command === 'av' && input) client.user.setAvatar(input).catch(() => {});
        if (command === 'name' && input) client.user.setUsername(input).catch(() => {});
        if (command === 'nick' && input && message.guild) message.guild.members.cache.get(client.user.id)?.setNickname(input).catch(() => {});
    }
});

client.login(config.token);
