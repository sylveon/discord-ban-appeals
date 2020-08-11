const config = require("./helpers/config.js");

exports.handler = async function (event, context) {
    const redirectUri = new URL("/.netlify/functions/oauth-callback", process.env.URL);
    return {
        statusCode: 303,
        headers: {
            "Location": `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(config.DISCORD_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri.toString())}&response_type=code&scope=identify&prompt=none`
        }
    };
}