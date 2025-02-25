const express = require("express");
const router = express.Router();
const { createFlokk } = require("../controllers/apiController");
const upload = require("../utils/multerConfig.js");
const checkJWT = require("../utils/checkJWT.js");

// Route to handle the form submission for creating a new flokk
router.post("/nyFlokk", checkJWT, upload.single("buemerkeBilde"), createFlokk);

module.exports = router;