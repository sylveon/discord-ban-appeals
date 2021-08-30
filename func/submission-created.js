const fetch = require("node-fetch");

const { API_ENDPOINT, MAX_EMBED_FIELD_CHARS, MAX_EMBED_FOOTER_CHARS } = require("./helpers/discord-helpers.js");
const { createJwt, decodeJwt } = require("./helpers/jwt-helpers.js");
const { getBan, isBlocked } = require("./helpers/user-helpers.js");

const timezones = {
    "gmt_minus12": "GMT -12:00",
    "gmt_minus11": "GMT -11:00",
    "gmt_minus10": "GMT -10:00",
    "gmt_minus930": "GMT -09:30",
    "gmt_minus9": "GMT -09:00",
    "gmt_minus8": "GMT -08:00",
    "gmt_minus7": "GMT -07:00",
    "gmt_minus6": "GMT -06:00",
    "gmt_minus5": "GMT -05:00",
    "gmt_minus4": "GMT -04:00",
    "gmt_minus330": "GMT -03:30",
    "gmt_minus3": "GMT -03:00",
    "gmt_minus2": "GMT -02:00",
    "gmt_minus1": "GMT -01:00",
    "gmt": "GMT ±00:00",
    "gmt_plus1": "GMT +01:00",
    "gmt_plus2": "GMT +02:00",
    "gmt_plus3": "GMT +03:00",
    "gmt_plus330": "GMT +03:30",
    "gmt_plus4": "GMT +04:00",
    "gmt_plus430": "GMT +04:30",
    "gmt_plus5": "GMT +05:00",
    "gmt_plus530": "GMT +05:30",
    "gmt_plus545": "GMT +05:45",
    "gmt_plus6": "GMT +06:00",
    "gmt_plus630": "GMT +06:30",
    "gmt_plus7": "GMT +07:00",
    "gmt_plus8": "GMT +08:00",
    "gmt_plus845": "GMT +08:45",
    "gmt_plus9": "GMT +09:00",
    "gmt_plus930": "GMT +09:30",
    "gmt_plus10": "GMT +10:00",
    "gmt_plus1030": "GMT +10:30",
    "gmt_plus11": "GMT +11:00",
    "gmt_plus12": "GMT +12:00",
    "gmt_plus1245": "GMT +12:45",
    "gmt_plus13": "GMT +13:00",
    "gmt_plus14": "GMT +14:00"
};

const activeTime = {
    "lessThanAMonth": "Less than a month",
    "oneTo7Months": "1-7 months",
    "sevenTo12Months": "7-12 months",
    "oneTo2Years": "1-2 years",
    "twoTo3Years": "2-3 years",
    "moreThan3Years": "3+ years",
    "iDontKnow": "I don't know"
};

const experience = {
    "lessThanAYear": "Less than a year",
    "oneTo2Years": "1-2 years",
    "twoTo3Years": "2-3 years",
    "moreThan3Years": "3+ years",
    "offPlatform": "Some on other platforms, but none on Discord",
    "noExperience": "I have no experience moderating"
};

function isValid(values, input) {
    return values.hasOwnProperty(input);
}

function radioToText(values, input) {
    return values[input];
}

exports.handler = async function (event, context) {
    let payload;

    if (process.env.USE_NETLIFY_FORMS) {
        payload = JSON.parse(event.body).payload.data;
    } else {
        if (event.httpMethod !== "POST") {
            return {
                statusCode: 405
            };
        }

        const params = new URLSearchParams(event.body);
        payload = {
            timezone: params.get("timezone") || undefined,
            timeAsActiveUser: params.get("timeAsActiveUser") || undefined,
            experience: params.get("experience") || undefined,
            reasoning: params.get("reasoning") || undefined,
            icebreaker: params.get("icebreaker") || undefined,
            additionalDetails: params.get("additionalDetails") || undefined,
            token: params.get("token") || undefined
        };
    }

    if (payload.timezone !== undefined &&
        isValid(timezones, payload.timezone) &&
        payload.timeAsActiveUser !== undefined &&
        isValid(activeTime, payload.timeAsActiveUser) &&
        payload.experience !== undefined && 
        isValid(experience, payload.experience) &&
        payload.reasoning !== undefined && 
        payload.token !== undefined) {
        
        const userInfo = decodeJwt(payload.token);
        if (isBlocked(userInfo.id)) {
            return {
                statusCode: 303,
                headers: {
                    "Location": `/error?msg=${encodeURIComponent("You cannot submit mod applications with this Discord account.")}`,
                },
            };
        }
        
        const message = {
            embed: {
                title: "New application submitted!",
                timestamp: new Date().toISOString(),
                fields: [
                    {
                        name: "Submitter",
                        value: `<@${userInfo.id}> (${userInfo.username}#${userInfo.discriminator})`
                    },
                    {
                        name: "Which timezone do you currently live in?",
                        value: radioToText(timezones, payload.timezone)
                    },
                    {
                        name: "How long have you been an active user of Discord?",
                        value: radioToText(activeTime, payload.timeAsActiveUser)
                    },
                    {
                        name: "How much moderation experience do you have on Discord?",
                        value: radioToText(experience, payload.experience)
                    },
                    {
                        name: "Why do you want to be a moderator of this particular server?",
                        value: payload.reasoning.slice(0, MAX_EMBED_FIELD_CHARS)
                    }
                ]
            }
        }

        if (payload.icebreaker !== undefined) {
            message.embed.fields.push({
                name: "Tell us about yourself!",
                value: payload.icebreaker.slice(0, MAX_EMBED_FIELD_CHARS)
            });
        }

        if (payload.additionalDetails !== undefined) {
            message.embed.fields.push({
                name: "Anything else you want to say?",
                value: payload.additionalDetails.slice(0, MAX_EMBED_FIELD_CHARS)
            });
        }

        const result = await fetch(`${API_ENDPOINT}/channels/${encodeURIComponent(process.env.APPEALS_CHANNEL)}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bot ${process.env.DISCORD_BOT_TOKEN}`
            },
            body: JSON.stringify(message)
        });

        if (result.ok) {
            if (process.env.USE_NETLIFY_FORMS) {
                return {
                    statusCode: 200
                };
            } else {
                return {
                    statusCode: 303,
                    headers: {
                        "Location": "/success"
                    }
                };
            }
        } else {
            console.log(JSON.stringify(await result.json()));
            throw new Error("Failed to submit message");
        }
    }

    return {
        statusCode: 400
    };
}
