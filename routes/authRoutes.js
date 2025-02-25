const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController.js");
const limiter = require("../utils/rateLimitConfig.js");
   
router.post("/register", limiter, authController.register);
router.post("/login", limiter, authController.login);
router.get("/logout", authController.logout);

module.exports = router;