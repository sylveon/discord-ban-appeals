const fetch = require("node-fetch");

const { decodeJwt } = require("./helpers/jwt-helpers.js");

exports.handler = async function (event, context) {
    const payload = JSON.parse(event.body).payload.data;

    if (payload.banReason !== undefined &&
        payload.appealText !== undefined &&
        payload.futureActions !== undefined && 
        payload.token !== undefined) {
        
        const userInfo = decodeJwt(payload.token);

        const result = await fetch(process.env.APPEALS_WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                embeds: [{
                    title: "New appeal submitted!",
                    timestamp: new Date().toISOString(),
                    fields: [{
                        name: "Submitter",
                        value: `<@${userInfo.id}> (${userInfo.username}#${userInfo.discriminator})`
                    },
                    {
                        name: "Why where you banned?",
                        value: payload.banReason
                    },
                    {
                        name: "Why do you feel you should be unbanned?",
                        value: payload.appealText
                    },
                    {
                        name: "What will you do to avoid being banned in the future?",
                        value: payload.futureActions
                    }]
                }]
            })
        });

        if (result.ok) {
            return {
                statusCode: 200
            };
        } else {
            throw new Error("Failed to submit webhook");
        }
    }

    return {
        statusCode: 400
    };
}