const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const process = require("process");

function assertSuccess(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
}

function replaceInFile(file, original, replacement) {
    fs.readFile(file, "UTF-8", (err, data) => {
        assertSuccess(err);

        fs.writeFile(file, data.replace(original, replacement), "UTF-8", assertSuccess);
    });
}

async function main() {
    const url = process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL;
    replaceInFile(path.resolve(__dirname, "func", "oauth.js"), "DEPLOY_PRIME_URL", `"${url}"`);
    replaceInFile(path.resolve(__dirname, "func", "oauth-callback.js"), "DEPLOY_PRIME_URL", `"${url}"`);
    replaceInFile(path.resolve(__dirname, "func", "submission-created.js"), "DEPLOY_PRIME_URL", `"${url}"`);

    if (!process.env.USE_NETLIFY_FORMS) {
        fs.rename(path.resolve(__dirname, "func", "submission-created.js"), path.resolve(__dirname, "func", "submit-appeal.js"), assertSuccess);
        replaceInFile(path.resolve(__dirname, "public", "form.html"), "action=\"/success\" netlify", "action=\"/.netlify/functions/submit-appeal\"");
    }

    if (process.env.DISABLE_UNBAN_LINK) {
        fs.unlink(path.resolve(__dirname, "func", "unban.js"), assertSuccess);
    }

    // Make sure the bot connected to the gateway at least once.
    const client = new Discord.Client();
    try {
        await client.login(process.env.DISCORD_BOT_TOKEN);
    } catch (e) {
        console.log(e);
        process.exit(1);
    }
    client.destroy();
}

main();