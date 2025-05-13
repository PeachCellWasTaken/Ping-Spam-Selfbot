module.exports = {
    token: '', //YOUR USER TOKEN, NOT A BOT.
    prefix: '->',  // put your own prefix here, itll be used as such: ->(my prefix)sp
    cooldowns: {
        sp: 60000,  // 1 minute cooldown 
        p: 120000,  // 2 minute cooldown (this cmd sends all pings in 1 message, do NOT use in big servers.)
        send: 30000, // 30 seconds cooldown
        spm: 10000
    },
    spDeleteDelay: 1000  // 3 seconds before deleting the pings
};
