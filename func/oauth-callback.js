const fetch = require("node-fetch");

const { getUserInfo, getBan, isBlocked } = require("./helpers/user-helpers.js");
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
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: "authorization_code",
                code: event.queryStringParameters.code,
                redirect_uri: new URL(event.path, DEPLOY_PRIME_URL),
                scope: "identify"
            })
        });

        const data = await result.json();

        if (!result.ok) {
            console.log(data);
            throw new Error("Failed to get user access token");
        }

        const user = await getUserInfo(data.access_token);
        if (isBlocked(user.id)) {
            return {
                statusCode: 303,
                headers: {
                    "Location": `/error?msg=${encodeURIComponent("You cannot submit ban appeals with this Discord account.")}`,
                },
            };
        }

        if (process.env.GUILD_ID && !process.env.SKIP_BAN_CHECK) {
            const ban = await getBan(user.id, process.env.GUILD_ID, process.env.DISCORD_BOT_TOKEN);
            if (ban === null) {
                return {
                    statusCode: 303,
                    headers: {
                        "Location": "/error"
                    }
                };
            }
        }

        const userPublic = {
            id: user.id,
            avatar: user.avatar,
            username: user.username,
            discriminator: user.discriminator
        };
        let url = `/form?token=${encodeURIComponent(createJwt(userPublic, data.expires_in))}`;
        if (event.queryStringParameters.state !== undefined) {
            url += `&state=${encodeURIComponent(event.queryStringParameters.state)}`;
        }

        return {
            statusCode: 303,
            headers: {
                "Location": url
            }
        };
    }

    return {
        statusCode: 400
    };
}