const fetch = require("node-fetch");

const { API_ENDPOINT } = require("./discord-helpers.js");

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

function callBanApi(userId, guildId, botToken, method) {
    return fetch(`${API_ENDPOINT}/guilds/${encodeURIComponent(guildId)}/bans/${encodeURIComponent(userId)}`, {
        method: method,
        headers: {
            "Authorization": `Bot ${botToken}`
        }
    });
}

async function userIsBanned(userId, guildId, botToken) {
    return (await callBanApi(userId, guildId, botToken, "GET")).ok;
}

async function unbanUser(userId, guildId, botToken) {
    const result = await callBanApi(userId, guildId, botToken, "DELETE");

    if (!result.ok) {
        throw new Error("Failed to unban user");    
    }
}

module.exports = { getUserInfo, userIsBanned, unbanUser };