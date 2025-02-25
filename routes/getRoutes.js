const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../utils/authMiddlewear.js");

const FLOKK = require("../models/flokk.js");
const checkJWT = require("../utils/checkJWT.js");

// public Routes
router.get("/", checkJWT, (req, res) => {
    res.render("index", {title: 'ReinsdyrDesk', user: req.user || null});
});

router.get("/auth/register", checkJWT, (req, res) => {
    res.render("register", {title: 'Register', user: req.user || null});
});

router.get("/auth/login", checkJWT, (req, res) => {
    res.render("login", {title: 'Login', user: req.user || null});
});

// Private Routes
router.get("/api/profile", checkJWT, authenticateUser, async (req, res) => {
    console.log("req.user in route handler:", req.user); 
    res.render("profile", { title: "Profile",  user: req.user });
});

router.get("/api/nyFlokk", checkJWT, authenticateUser, (req, res) => {
    res.render("nyFlokk", {title: 'Lage flokk', msg: null, user: req.user});
});

router.get("/add-reinsdyr", checkJWT, authenticateUser, async (req, res) => {
    res.render("add-reinsdyr", { title: 'Sett inn Reinsdyr', user: req.user });
});

module.exports = router;