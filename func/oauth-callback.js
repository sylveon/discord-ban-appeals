const fetch = require("node-fetch");

const config = require("./helpers/config.js");
const { getUserInfo, userIsBanned } = require("./helpers/user-helpers.js");
const { createJwt } = require("./helpers/jwt-helpers.js");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "GET") {
		return {
			statusCode: 405
		};
    }

    if (event.queryStringParameters.code !== undefined) {
        const result = await fetch("https://discord.com/api/oauth2/token", {
            method: "POST",
            body: new URLSearchParams({
                client_id: config.DISCORD_CLIENT_ID,
                client_secret: config.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: event.queryStringParameters.code,
                redirect_uri: new URL(event.path, process.env.URL),
                scope: "identify"
            })
        });

        if (!result.ok) {
            throw new Error("Failed to get user access token");
        }

        const data = await result.json();

        const user = await getUserInfo(data.access_token);
        if (config.DISCORD_BOT_TOKEN) {
            if (!await userIsBanned(user.id, config.GUILD_ID, config.DISCORD_BOT_TOKEN)) {
                return {
                    statusCode: 303,
                    headers: {
                        "Location": `/error.html?msg=${encodeURIComponent("It seems like you aren't banned. Try joining the server from a different IP.")}`
                    }
                };
            }
        }

        return {
            statusCode: 303,
            headers: {
                "Location": `/form.html?token=${encodeURIComponent(createJwt(user, data.expires_in))}`
            }
        };
    }

    return {
        statusCode: 400
	};
}