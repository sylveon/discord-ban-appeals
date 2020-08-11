const fetch = require("node-fetch");

const { decodeJwt } = require("./helpers/jwt-helpers.js");

exports.handler = async function (event, context) {
    if (event.httpMethod !== "GET") {
		return {
			statusCode: 405
		};
    }

    if (event.queryStringParameters.banReason !== undefined &&
        event.queryStringParameters.appealText !== undefined &&
        event.queryStringParameters.futureActions !== undefined && 
        event.queryStringParameters.token !== undefined) {
        
        const userInfo = decodeJwt(event.queryStringParameters.token);

        const result = await fetch(process.env.APPEALS_WEBHOOK, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
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
                        value: event.queryStringParameters.banReason
                    },
                    {
                        name: "Why do you feel you should be unbanned?",
                        value: event.queryStringParameters.appealText
                    },
                    {
                        name: "What will you do to avoid being banned in the future?",
                        value: event.queryStringParameters.futureActions
                    }]
                }]
            })
        });

        if (result.ok) {
            return {
                statusCode: 303,
                headers: {
                    "Location": `/success.html?msg=${encodeURIComponent("Your appeal has been submitted!")}`
                }
            };
        } else {
            throw new Error("Failed to submit webhook");
        }
    }

    return {
        statusCode: 400
	};
}