const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/jwtUtils.js");

const checkJWT = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        const decodedToken = verifyToken(token);

        if (decodedToken) {
            req.user = decodedToken; 
            console.log("Decoded user:", req.user); 
        } else {
            req.user = null;
        }
    } else {
        req.user = null;
    }
    next();
};

module.exports = checkJWT;