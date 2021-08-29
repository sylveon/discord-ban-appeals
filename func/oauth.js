exports.handler = async function (event, context) {
    const redirectUri = new URL("/.netlify/functions/oauth-callback", DEPLOY_PRIME_URL);
    let url = `https://discord.com/api/oauth2/authorize?client_id=${encodeURIComponent(process.env.DISCORD_CLIENT_ID)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify&prompt=none`;

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