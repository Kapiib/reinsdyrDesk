const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
    windowMs: 5 * 1000,
    max: 5, 
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = limiter;