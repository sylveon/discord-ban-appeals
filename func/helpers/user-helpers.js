const fetch = require("node-fetch");

const API_ENDPOINT = "https://discord.com/api/v6";

async function getUserInfo(token) {
    const result = await fetch(`${API_ENDPOINT}/users/@me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!result.ok) {
        throw new Error("Failed to get user information");
    }

    return await result.json();
}

async function userIsBanned(userId, guildId, botToken) {
    const result = await fetch(`${API_ENDPOINT}/guilds/${encodeURIComponent(guildId)}/bans/${encodeURIComponent(userId)}`, {
        method: "GET",
        headers: {
            "Authorization": `Bot ${botToken}`
        }
    });

    return result.ok;
}

module.exports = { getUserInfo, userIsBanned };