import jwt from "jsonwebtoken";

export function createJwt(data, duration) {
    const options = {
        issuer: 'ban-appeals-backend'
    };

    if (duration) {
        options.expiresIn = duration;
    }

    return jwt.sign(data, process.env.JWT_SECRET, options);
}

export function decodeJwt(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}
