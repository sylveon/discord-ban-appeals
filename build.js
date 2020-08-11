const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");

async function main() {
    // Make sure the bot connected to the gateway at least once.
    const client = new Discord.Client();
    await client.login(process.env.DISCORD_BOT_TOKEN);
    client.destroy();

    if (!process.env.USE_NETLIFY_FORMS) {
        const content = await fs.readFile(path.resolve(__dirname, "public", "form.html"), "UTF-8");

        content.replace("action=\"/success\" netlify", "action=\"/.netlify/functions/submission-created\"");
    }
}

main();