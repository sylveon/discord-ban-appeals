const Discord = require("discord.js");
const fs = require("fs");
const path = require("path");
const process = require("process");

async function main() {
    if (!process.env.USE_NETLIFY_FORMS) {
        const submissionOldFunction = path.resolve(__dirname, "func", "submission-created.js");
        const submissionNewFunction = path.resolve(__dirname, "func", "submit-appeal.js");
        fs.rename(submissionOldFunction, submissionNewFunction, err => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
        });

        const form = path.resolve(__dirname, "public", "form.html");
        fs.readFile(form, "UTF-8", (err, data) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }

            data = data.replace("action=\"/success\" netlify", "action=\"/.netlify/functions/submit-appeal\"");
            fs.writeFile(form, data, "UTF-8", err => {
                if (err) {
                    console.log(err);
                    process.exit(1);
                }
            });
        });
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