const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const connectDB = require("./db/dbConfig.js");
const multer = require("multer");
const path = require("path"); // maybe delete this
const authRoutes = require("./routes/authRoutes.js");
const apiRoutes = require("./routes/apiRoutes.js");
const getRoutes = require("./routes/getRoutes.js");
const checkJWT = require("./utils/checkJWT.js");
const app = express();

connectDB();

// models
const EIER = require("./models/eier");
const FLOKK = require("./models/flokk");    
const INDIVIDUELT_REINSDYR = require("./models/individueltReinsdyr");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use( express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use("/", getRoutes);
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);

const authController = require("./controllers/authController.js");
const apiController = require("./controllers/apiController.js");

//port the server i running on
app.listen(process.env.PORT, () => {
    console.log('Running on http://localhost:4000');
});