# Ping-Spam-Selfbot

> **NOTE:** Selfbots are against Discord's ToS and can lead to account termination.  
> Use at your own risk and preferably on an alt account.

---

## SETUP:

1. Click `Code` → Download as ZIP.
2. Uncompress it in your files.
3. Run `install.bat`.

---

## Getting your Discord Token:

1. Go to [https://discord.com](https://discord.com), sign in.
2. Open your **Developer Console** (`Ctrl + Shift + I`) → go to the **Console tab**.
3. Paste the code below:

(webpackChunkdiscord_app.push([[''],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m)
  .find(m=>m?.exports?.default?.getToken!==void 0)
  .exports.default.getToken()

Copy what it gives you (your token).

Open the config.js file.

Paste the token where it says token.

Adjust the cooldowns to whatever you want.
