const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./db/dbConfig.js");
const authRoutes = require("./routes/authRoutes.js");
const getRoutes = require("./routes/getRoutes.js");
const app = express();

connectDB();

// models
const EIER = require("./models/eier");
const FLOKK = require("./models/flokk");    
const INDIVIDUELT_REINSDYR = require("./models/individueltReinsdyr");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));
app.use("/", getRoutes);
app.use("/auth", authRoutes);

const authController = require("./controllers/authController.js");

// rendering sites
app.get("/", (req, res) => {
    res.render("index", {title: 'ReinsdyrDesk'});
});;

//port the server i running on
app.listen(process.env.PORT, () => {
    console.log('Running on http://localhost:4000');
});