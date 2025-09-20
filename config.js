module.exports = {
    token: 'Token Here',  // Your selfbot token
    prefix: '-',                        // The prefix for commands (e.g., -p, -s, etc.)
    
    // Cooldowns in milliseconds
    cooldowns: {
        p: 30000,         // Mass ping cooldown: 30 seconds
        sp: 20000,        // Single ping cooldown: 20 seconds
        spm: 30000,       // SPM cooldown: 30 seconds (lower if you wanna get termed lol)
        send: 10000,      // Send message cooldown: 10 seconds
        s: 10000,         // Simple send cooldown: 10 seconds 
        react: 10000,     // React cooldown: 10 seconds
        serverinfo: 5000  // Server info cooldown: 5 seconds
    },

    spDeleteDelay: 5000 // Time in ms before automatically deleting sent ping messages
};
