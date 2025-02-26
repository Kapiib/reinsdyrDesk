const express = require("express");
const router = express.Router();
const FLOKK = require("../models/flokk.js");
const BEITEOMRADE = require("../models/beiteomrade.js");
const TRANSACTION = require("../models/transaction.js");
const checkJWT = require("../utils/checkJWT.js");
const { authenticateUser } = require("../utils/authMiddlewear.js");

// public Routes
router.get("/", checkJWT, async (req, res) => {
    try {
        // Fetch all flocks
        const flokker = await FLOKK.find().populate("eier", "navn"); // Populate the owner's name
        res.render("index", {
            title: "ReinsdyrDesk",
            flokker: flokker, // Pass all flocks to the template
            user: req.user || null, // Pass the user (if logged in)
        });
    } catch (error) {
        console.error("Error fetching flocks for index:", error);
        res.status(500).render("index", {
            title: "ReinsdyrDesk",
            msg: "Noe gikk galt ved henting av flokker.",
            user: req.user || null,
        });
    }
});

router.get("/auth/register", checkJWT, (req, res) => {
    res.render("register", {title: 'Register', user: req.user || null});
});

router.get("/auth/login", checkJWT, (req, res) => {
    res.render("login", {title: 'Login', user: req.user || null});
});

router.get("/api/databaseInfo", checkJWT, (req, res) => {
    res.render("databaseInfo", {title: 'Database Informasjon', user: req.user});
});

// Private Routes
router.get("/api/profile", checkJWT, authenticateUser, async (req, res) => {
    try {
        const user = req.user;
        const flokker = await FLOKK.find({ eier: user._id });

        res.render("profile", {
            title: "Profile",
            flokker: flokker,
            msg: null,
            user: user,
            error: req.query.error || null // Pass error query param
        });
    } catch (error) {
        console.error(error);
        res.redirect(`/api/profile?error=${encodeURIComponent("Noe gikk galt ved henting av flokker")}`);
    }
});

router.get("/api/add-reinsdyr", checkJWT, authenticateUser, async (req, res) => {

    try {
        // Fetch the user's flocks
        const flokker = await FLOKK.find({ eier: req.user._id });
        
        res.render("add-reinsdyr", {
            title: "Sett inn Reinsdyr",
            flokker: flokker, // Pass the flocks to the template
            msg: null,
            user: req.user, // Pass the user
        });
    } catch (error) {
        console.error("Error fetching flocks:", error);
        res.status(500).render("add-reinsdyr", {
            title: "Sett inn Reinsdyr",
            msg: "Noe gikk galt ved henting av flokker.",
            user: req.user,
        });
    }
});

router.get("/api/nyFlokk", checkJWT, authenticateUser, (req, res) => {
    res.render("nyFlokk", {title: 'Lage flokk', msg: null, user: req.user});
});

router.get("/api/beiteomrade", checkJWT, authenticateUser, async (req, res) => {
    try {
        // Fetch all grazing areas and flocks for the logged-in user
        const beiteomrader = await BEITEOMRADE.find();
        const flokker = await FLOKK.find({ eier: req.user._id });

        res.render("beiteomrade", {
            title: 'Lage beiteomrade',
            msg: null,
            user: req.user,
            beiteomrader: beiteomrader, // Pass grazing areas to the template
            flokker: flokker, // Pass flocks to the template
        });
    } catch (error) {
        console.error("Error fetching data for beiteomrade:", error);
        res.render("beiteomrade", {
            title: 'Lage beiteomrade',
            msg: "Noe gikk galt ved henting av data.",
            user: req.user,
        });
    }
});

router.get("/api/faq", checkJWT, (req, res) => {
    res.render("faq", {title: 'FAQ', msg: null, user: req.user});
});

// router that gets the id of a flock only to the owner of the flock by using the cookie
router.get("/flokk/:flokkId", authenticateUser, async (req, res) => {
    const { flokkId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    try {
        // Find flock and verify ownership
        const flokk = await FLOKK.findOne({ 
            _id: flokkId,
            eier: req.user._id 
        }).populate({
            path: 'reinsdyr',
            options: {
                skip: skip,
                limit: limit,
                sort: { serienummer: 1 }
            }
        });

        if (!flokk) {
            return res.redirect(`/api/profile?error=${encodeURIComponent("Ingen tilgang")}`);
        }

        const totalReinsdyr = await FLOKK.findById(flokkId).select('reinsdyr');
        const totalPages = Math.ceil(totalReinsdyr.reinsdyr.length / limit);

        res.render("flokk", {
            title: flokk.navnPaFlokken,
            user: req.user,
            flokk: flokk,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.error("Error fetching flokk:", error);
        res.redirect(`/api/profile?error=${encodeURIComponent("Serverfeil")}`);
    }
});

module.exports = router;