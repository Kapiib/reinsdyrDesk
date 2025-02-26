const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const upload = require("../utils/multerConfig.js");
const checkJWT = require("../utils/checkJWT.js");

// Route to handle the form submission for creating a new flokk
router.post("/nyFlokk", checkJWT, upload.single("buemerkeBilde"), apiController.createFlokk);
router.post("/add-reinsdyr", checkJWT, apiController.addReinsdyr);

router.post("/beiteomrade", checkJWT, apiController.createBeiteomrade);
router.post("/beiteomrade/associate", checkJWT, apiController.associateFlokkWithBeiteomrade);
module.exports = router;