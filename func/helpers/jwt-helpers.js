const jwt = require("jsonwebtoken");

const config = require("./config.js");

function createJwt(data, durationInSeconds) {
    return jwt.sign(data, config.JWT_SECRET, {
        expiresIn: durationInSeconds,
        issuer: 'ban-appeals-backend'
    });
}

function decodeJwt(token) {
    return jwt.verify(token, config.JWT_SECRET);
}

module.exports = { createJwt, decodeJwt };