const jwt = require("jsonwebtoken");

function createJwt(data, durationInSeconds) {
    return jwt.sign(data, process.env.JWT_SECRET, {
        expiresIn: durationInSeconds,
        issuer: 'ban-appeals-backend'
    });
}

function decodeJwt(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { createJwt, decodeJwt };