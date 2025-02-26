const FLOKK = require("../models/flokk");
const INDIVIDUELT_REINSDYR = require("../models/individueltReinsdyr");
const EIER = require("../models/eier");
const BEITEOMRADE = require("../models/beiteomrade");
const TRANSACTION = require("../models/transaction");

const apiController = {
    createFlokk: async (req, res) => {
        try {
            const { navnPaFlokken, serieinndeling, buemerkeNavn } = req.body;
            const buemerkeBilde = req.file ? `/uploads/${req.file.filename}` : null;
            const eier = req.user._id;

            // Check if a flock with the same name already exists for the user
            const existingFlokk = await FLOKK.findOne({ eier: req.user._id, navnPaFlokken: navnPaFlokken });
            if (existingFlokk) {
                return res.render('nyFlokk', {
                    title: 'NyFlokk',
                    success: false,
                    msg: "En flokk med dette navnet finnes allerede!",
                    user: req.user,
                });
            }

            const newFlokk = new FLOKK({
                navnPaFlokken,
                serieinndeling,
                buemerkeNavn,
                buemerkeBilde,
                eier,
            });

            await newFlokk.save();
            res.redirect("/api/profile"); 
        } catch (error) {
            console.error("Error creating flokk:", error);
            return res.render('nyFlokk', {
                title: 'NyFlokk',
                success: false,
                msg: "Noe gikk galt, vennligst prøv igjen!",
                user: req.user,
            });
        }
    },

    // Function to add a new reindeer
    addReinsdyr: async (req, res) => {
        try {
            const { serienummer, navn, fodselsdato, flokk } = req.body;
    
            const flokkArray = Array.isArray(flokk) ? flokk : [flokk];
    
            let existingReinsdyr = await INDIVIDUELT_REINSDYR.findOne({ serienummer });
    
            if (existingReinsdyr) {
                const allFlokksAssociated = flokkArray.every(flokkId =>
                    existingReinsdyr.flokk.includes(flokkId)
                );
    
                if (allFlokksAssociated) {
                    const userFlokker = await FLOKK.find({ eier: req.user._id });
                    return res.status(400).render("add-reinsdyr", {
                        title: "Sett inn Reinsdyr",
                        msg: "Et reinsdyr med dette serienummeret eksisterer allerede i alle valgte flokker.",
                        flokker: userFlokker,
                        user: req.user,
                    });
                } else {
                    for (const flokkId of flokkArray) {
                        if (!existingReinsdyr.flokk.includes(flokkId)) {
                            existingReinsdyr.flokk.push(flokkId);
                            await FLOKK.findByIdAndUpdate(flokkId, { $addToSet: { reinsdyr: existingReinsdyr._id } });
                        }
                    }
                    await existingReinsdyr.save();
                    return res.redirect("/api/profile");
                }
            } else {
                const newReinsdyr = new INDIVIDUELT_REINSDYR({
                    serienummer,
                    navn,
                    fodselsdato,
                    flokk: flokkArray, 
                });
    
                await newReinsdyr.save();
    
                // Add the reindeer to each selected flock
                for (const flokkId of flokkArray) {
                    await FLOKK.findByIdAndUpdate(flokkId, { $addToSet: { reinsdyr: newReinsdyr._id } });
                }
    
                res.redirect("/api/profile"); 
            }
        } catch (error) {
            console.error("Error adding reindeer:", error);
    
            if (error.code === 11000 && error.keyPattern && error.keyPattern.serienummer) {
                const userFlokker = await FLOKK.find({ eier: req.user._id });
                return res.status(400).render("add-reinsdyr", {
                    title: "Sett inn Reinsdyr",
                    msg: "Et reinsdyr med dette serienummeret eksisterer allerede.",
                    flokker: userFlokker,
                    user: req.user,
                });
            }
    
            const flokker = await FLOKK.find({ eier: req.user._id });
    
            res.status(500).render("add-reinsdyr", {
                title: "Sett inn Reinsdyr",
                msg: "Noe gikk galt ved registrering av reinsdyr.",
                flokker: flokker, // Pass the flocks to the template
                user: req.user,
            });
        }
    },
    createBeiteomrade: async (req, res) => {
        try {
            const { primærBeiteomrade } = req.body; 

            const newBeiteomrade = new BEITEOMRADE({
                primærBeiteomrade, 
            });

            await newBeiteomrade.save();
            res.redirect("/api/beiteomrade");
        } catch (err) {
            console.error("Feil ved opprettelse av beiteomrade:", err);
            res.render("beiteomrade", {
                title: "Opprett beiteomrade",
                msg: "Noe gikk galt ved opprettelse av beiteomrade.",
                user: req.user,
            });
        }
    },

    // Function to associate a flock with a grazing area
    associateFlokkWithBeiteomrade: async (req, res) => {
        try {
            const { beiteomradeId, flokkId } = req.body;

            const beiteomrade = await BEITEOMRADE.findById(beiteomradeId);
            if (!beiteomrade) {
                // Fetch grazing areas and flocks to pass to the view
                const beiteomrader = await BEITEOMRADE.find();
                const flokker = await FLOKK.find({ eier: req.user._id });

                return res.render("beiteomrade", {
                    title: "Knytt flokk til beiteomrade",
                    msg: "Beiteomrade ikke funnet.",
                    user: req.user,
                    beiteomrader: beiteomrader, 
                    flokker: flokker, 
                });
            }

            const flokk = await FLOKK.findById(flokkId);
            if (!flokk) {
                const beiteomrader = await BEITEOMRADE.find();
                const flokker = await FLOKK.find({ eier: req.user._id });

                return res.render("beiteomrade", {
                    title: "Knytt flokk til beiteomrade",
                    msg: "Flokk ikke funnet.",
                    user: req.user,
                    beiteomrader: beiteomrader, 
                    flokker: flokker, 
                });
            }

            beiteomrade.flokker.push(flokkId);
            await beiteomrade.save();

            const beiteomrader = await BEITEOMRADE.find();
            const flokker = await FLOKK.find({ eier: req.user._id });

            res.render("beiteomrade", {
                title: "Knytt flokk til beiteomrade",
                msg: "Flokk ble knyttet til beiteomrade.",
                user: req.user,
                beiteomrader: beiteomrader, 
                flokker: flokker, 
            });
        } catch (err) {
            console.error("Feil ved tilknytning av flokk til beiteomrade:", err);

            const beiteomrader = await BEITEOMRADE.find();
            const flokker = await FLOKK.find({ eier: req.user._id });

            res.render("beiteomrade", {
                title: "Knytt flokk til beiteomrade",
                msg: "Noe gikk galt ved tilknytning av flokk til beiteomrade.",
                user: req.user,
                beiteomrader: beiteomrader, 
                flokker: flokker,
            });
        }
    },
};

module.exports = apiController;