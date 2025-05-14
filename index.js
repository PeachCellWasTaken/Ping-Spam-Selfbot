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

const displayAsciiArt = () => {
    figlet('Maz Pinger', (err, data) => {
        if (err) {
            console.log(chalk.red('Error generating ASCII art'));
            console.log(chalk.red(err));
        } else {
            console.log(chalk.cyan(data));
        }
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
Mazach Empire Beta:

${config.prefix}p - Mass ping, do setup first.
${config.prefix}sp - Single pings (50 active members, 50 messages).
${config.prefix}setup - Setup the target ping system.
${config.prefix}spm (message) (amount) - Active user spam message with ping.

Copyright © MazachEmpire
Support Server: https://discord.gg/EjfUqUv4DU
===================================================
`));
};

client.on('ready', () => {
    console.clear();
    displayAsciiArt();
    showBotInfo();
    showHelp();
});

client.on('messageCreate', async message => {
    if (message.author.id !== client.user.id) return;

    const now = Date.now();

    const isOnCooldown = (cmd) => {
        if (!cooldowns.has(cmd)) return false;
        return now - cooldowns.get(cmd) < config.cooldowns[cmd];
    };

    const setCooldown = (cmd) => cooldowns.set(cmd, now);

    // Mass Ping Command
    if (message.content === `${config.prefix}p`) {
        if (isOnCooldown('p')) {
            console.log(chalk.yellow('Mass ping is on cooldown.'));
            return;
        }
        setCooldown('p');

        try {
            await message.delete();

            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.isText() && c.viewable);

            let recentUsers = new Set();

            for (const channel of textChannels.values()) {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    messages.forEach(msg => {
                        if (!msg.author.bot) {
                            recentUsers.add(msg.author.id);
                        }
                    });
                } catch {
                    continue;
                }
            }

            await guild.members.fetch();

            const eligibleMembers = guild.members.cache.filter(member =>
                recentUsers.has(member.id) &&
                !member.user.bot &&
                !member.roles.cache.some(role => role.permissions.has('ADMINISTRATOR'))
            );

            if (eligibleMembers.size < 6) {
                console.log(chalk.yellow('Less than 15 eligible members found. Aborting.'));
                return;
            }

            const mentions = eligibleMembers.map(m => `<@${m.id}>`);
            const chunkMentions = chunkMessages(mentions);

            for (const chunk of chunkMentions) {
                const sentMsg = await message.channel.send(chunk);
                setTimeout(() => {
                    sentMsg.delete().catch(() => {});
                }, config.spDeleteDelay);
            }

        } catch (error) {
            console.error(chalk.red('Error:', error));
        }
    }

    // Single Ping Command
    if (message.content === `${config.prefix}sp`) {
        if (isOnCooldown('sp')) {
            console.log(chalk.yellow('Single ping is on cooldown.'));
            return;
        }
        setCooldown('sp');

        try {
            await message.delete();

            const guild = message.guild;
            const textChannels = guild.channels.cache.filter(c => c.isText() && c.viewable);

            let recentUsers = new Set();

            for (const channel of textChannels.values()) {
                try {
                    const messages = await channel.messages.fetch({ limit: 100 });
                    messages.forEach(msg => {
                        if (!msg.author.bot) {
                            recentUsers.add(msg.author.id);
                        }
                    });
                } catch {
                    continue;
                }
            }

            await guild.members.fetch();

            const eligibleMembers = guild.members.cache.filter(member =>
                recentUsers.has(member.id) &&
                !member.user.bot &&
                !member.roles.cache.some(role => role.permissions.has('ADMINISTRATOR'))
            ).first(50);

            if (eligibleMembers.length < 5) {
                console.log(chalk.yellow('Less than 5 eligible members found. Aborting.'));
                return;
            }

            console.log(chalk.green(`Sending ${eligibleMembers.length} single pings...`));

            for (const member of eligibleMembers) {
                try {
                    const sentMsg = await message.channel.send(`<@${member.id}>`);
                    setTimeout(() => {
                        sentMsg.delete().catch(() => {});
                    }, config.spDeleteDelay);
                } catch {
                    continue;
                }
            }

        } catch (error) {
            console.error(chalk.red('Error:'), error);
        }
    }

// SPM Command
if (message.content.startsWith(`${config.prefix}spm`)) {
    if (isOnCooldown('spm')) {
        console.log(chalk.yellow('SPM is on cooldown.'));
        return;
    }
    setCooldown('spm');

    const args = message.content.split(' ').slice(1);
    const msgToSend = args.slice(0, -1).join(' ');
    const amount = parseInt(args[args.length - 1]);

    if (!msgToSend || isNaN(amount)) {
        console.log(chalk.red(`Usage: ${config.prefix}spm (message) (amount)`));
        return;
    }

    try {
        const guild = message.guild;
        const textChannels = guild.channels.cache.filter(c => c.isText() && c.viewable);

        let recentUsers = new Set();

        for (const channel of textChannels.values()) {
            try {
                const messages = await channel.messages.fetch({ limit: 100 });
                messages.forEach(msg => {
                    if (!msg.author.bot) {
                        recentUsers.add(msg.author.id);
                    }
                });
            } catch {
                continue;
            }
        }

        await guild.members.fetch();

        const eligibleMembers = guild.members.cache.filter(member =>
            recentUsers.has(member.id) &&
            !member.user.bot &&
            !member.roles.cache.some(role => role.permissions.has('ADMINISTRATOR'))
        ).first(amount);

        if (eligibleMembers.length === 0) {
            console.log(chalk.yellow('No eligible members found.'));
            return;
        }

        console.log(chalk.green(`Sending ${eligibleMembers.length} messages with ping and custom message...`));

        for (const member of eligibleMembers) {
            try {
                await message.channel.send(`<@${member.id}> ${msgToSend}`);
            } catch {
                continue;
            }
        }

    } catch (error) {
        console.error(chalk.red('Error:'), error);
    }
}


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

    if (current.trim().length > 0) {
        chunks.push(current.trim());
    }

    return chunks;
};
})
client.login(config.token);
