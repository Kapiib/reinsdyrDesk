const express = require("express");
const router = express.Router();
const apiController = require("../controllers/apiController");
const upload = require("../utils/multerConfig.js");
const checkJWT = require("../utils/checkJWT.js");

// Ny flokk og ny reinsdyr
router.post("/nyFlokk", checkJWT, upload.single("buemerkeBilde"), apiController.createFlokk);
router.post("/add-reinsdyr", checkJWT, apiController.addReinsdyr);

// Koble til beiteområde til flokken
router.post("/beiteomrade", checkJWT, apiController.createBeiteomrade);
router.post("/beiteomrade/associate", checkJWT, apiController.associateFlokkWithBeiteomrade);



module.exports = router;