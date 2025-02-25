const { verifyToken } = require("./jwtUtils.js");

const authenticateUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return res.redirect("/auth/login");
    }

    const decodedToken = verifyToken(token);

    if (!decodedToken) {
        res.clearCookie("jwt");
        return res.redirect("/auth/login");
    }

    req.user = decodedToken;
    next();
};

module.exports = { authenticateUser };