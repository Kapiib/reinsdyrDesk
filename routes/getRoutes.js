const express = require("express");
const router = express.Router();

router.get("/auth/register", (req, res) => {
    res.render("register", {title: 'Register'});
});

router.get("/auth/login", (req, res) => {
    res.render("login", {title: 'Login'});
});

module.exports = router;