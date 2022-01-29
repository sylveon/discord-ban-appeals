import fetch from 'node-fetch';

import { API_ENDPOINT } from "./discord-helpers.js";

export async function getUserInfo(token) {
    const result = await fetch(`${API_ENDPOINT}/users/@me`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await result.json();

    if (!result.ok) {
        console.log(data);
        throw new Error("Failed to get user information");
    }

    return data;
}

function callBanApi(userId, guildId, botToken, method) {
    return fetch(`${API_ENDPOINT}/guilds/${encodeURIComponent(guildId)}/bans/${encodeURIComponent(userId)}`, {
        method: method,
        headers: {
            "Authorization": `Bot ${botToken}`
        }
    });
}

export async function getBan(userId, guildId, botToken) {
    const result = await callBanApi(userId, guildId, botToken, "GET");

    if (result.ok) {
        return await result.json();
    } else if (result.status === 404) {
        return null;
    } else {
        console.log(await result.json());
        throw new Error("Failed to get user ban");
    }
}

export async function unbanUser(userId, guildId, botToken) {
    const result = await callBanApi(userId, guildId, botToken, "DELETE");

    if (!result.ok && result.status !== 404) {
        console.log(await result.json());
        throw new Error("Failed to unban user");
    }
}

export function isBlocked(userId) {
    if (process.env.BLOCKED_USERS) {
        const blockedUsers = process.env.BLOCKED_USERS.replace(/"/g, "").split(",").filter(Boolean);
        if (blockedUsers.indexOf(userId) > -1) {
            return true;
        }
    }

    return false;
}
