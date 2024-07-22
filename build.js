import fetch from 'node-fetch';
import fs from "fs";
import path from "path";
import process from "process";
import { fileURLToPath } from 'url';
import {API_ENDPOINT} from "./func/helpers/discord-helpers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function assertSuccess(err) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
}

function replaceInFile(file, original, replacement, callback) {
    fs.readFile(file, "UTF-8", (err, data) => {
        assertSuccess(err);

        fs.writeFile(file, data.replace(original, replacement), "UTF-8", err => {
            assertSuccess(err);

            if (callback) {
                callback();
            }
        });
    });
}

async function main() {
    const func = path.resolve(__dirname, "func");

    const url = process.env.CONTEXT === "production" ? process.env.URL : process.env.DEPLOY_PRIME_URL;
    replaceInFile(path.resolve(func, "oauth.js"), /DEPLOY_PRIME_URL/g, `"${url}"`);
    replaceInFile(path.resolve(func, "oauth-callback.js"), "DEPLOY_PRIME_URL", `"${url}"`);
    replaceInFile(path.resolve(func, "submission-created.js"), "DEPLOY_PRIME_URL", `"${url}"`, () => {
        if (!process.env.USE_NETLIFY_FORMS) {
            fs.rename(path.resolve(func, "submission-created.js"), path.resolve(func, "submit-appeal.js"), assertSuccess);
            replaceInFile(path.resolve(__dirname, "public", "form.html"), "action=\"/success\" netlify", "action=\"/.netlify/functions/submit-appeal\"");
        }
    });

    if (process.env.DISABLE_UNBAN_LINK || process.env.DISCORD_WEBHOOK_URL) {
        fs.unlink(path.resolve(func, "unban.js"), assertSuccess);
    }

    if(!process.env.DISCORD_WEBHOOK_URL) {
        // Make sure the bot token & env variables are valid.
        const headers = {
            "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        };

        const results = await Promise.all([
            fetch(`${API_ENDPOINT}/guilds/${process.env.GUILD_ID}/bans?limit=1`, {
                method: "GET",
                headers: headers,
            }),
           fetch(`${API_ENDPOINT}/channels/${process.env.APPEALS_CHANNEL}`, {
                method: "GET",
                headers: headers,
            }),
        ]);

        results.forEach(result => {
            if(!result.ok) {
                console.log(result.statusText);
                process.exit(1);
            }
        });
    }
}

main();