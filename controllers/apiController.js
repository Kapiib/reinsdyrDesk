const FLOKK = require("../models/flokk");
const INDIVIDUELT_REINSDYR = require("../models/individueltReinsdyr");
const EIER = require("../models/eier");
const BEITEOMRADE = require("../models/beiteomrade");
const TRANSACTION = require("../models/transaction");

// Function to create a new flokk
const apiController = {
    // Function to create a new flokk
    createFlokk: async (req, res) => {
        try {
            const { navnPaFlokken, serieinndeling, buemerkeNavn } = req.body;
            const buemerkeBilde = req.file ? `/uploads/${req.file.filename}` : null;
            const eier = req.user._id; // Use req.user._id

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

            // Create a new flock
            const newFlokk = new FLOKK({
                navnPaFlokken,
                serieinndeling,
                buemerkeNavn,
                buemerkeBilde,
                eier,
            });

            await newFlokk.save();
            res.redirect("/api/profile"); // Redirect after successful creation
        } catch (error) {
            console.error("Error creating flokk:", error); // Debugging
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
    
            // Ensure flokk is an array
            const flokkArray = Array.isArray(flokk) ? flokk : [flokk];
    
            // Check if a reindeer with the same serienummer already exists
            let existingReinsdyr = await INDIVIDUELT_REINSDYR.findOne({ serienummer });
    
            if (existingReinsdyr) {
                // Check if the reindeer is already associated with all selected flokks
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
                    // Add the reinsdyr to the flokks it's not already associated with
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
                // Create a new reindeer
                const newReinsdyr = new INDIVIDUELT_REINSDYR({
                    serienummer,
                    navn,
                    fodselsdato,
                    flokk: flokkArray, // Assign the reindeer to the selected flocks
                });
    
                await newReinsdyr.save();
    
                // Add the reindeer to each selected flock
                for (const flokkId of flokkArray) {
                    await FLOKK.findByIdAndUpdate(flokkId, { $addToSet: { reinsdyr: newReinsdyr._id } });
                }
    
                res.redirect("/api/profile"); // Redirect after successful registration
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
    
            // Fetch the user's flocks to pass to the template
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
            const { primærBeiteomrade } = req.body; // Ensure this matches the form field name

            const newBeiteomrade = new BEITEOMRADE({
                primærBeiteomrade, // Ensure this matches the model field name
            });

            await newBeiteomrade.save();
            res.redirect("/api/beiteomrade"); // Redirect back to the beiteomrade page
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
                    beiteomrader: beiteomrader, // Pass grazing areas to the template
                    flokker: flokker, // Pass flocks to the template
                });
            }

            const flokk = await FLOKK.findById(flokkId);
            if (!flokk) {
                // Fetch grazing areas and flocks to pass to the view
                const beiteomrader = await BEITEOMRADE.find();
                const flokker = await FLOKK.find({ eier: req.user._id });

                return res.render("beiteomrade", {
                    title: "Knytt flokk til beiteomrade",
                    msg: "Flokk ikke funnet.",
                    user: req.user,
                    beiteomrader: beiteomrader, // Pass grazing areas to the template
                    flokker: flokker, // Pass flocks to the template
                });
            }

            beiteomrade.flokker.push(flokkId);
            await beiteomrade.save();

            // Fetch grazing areas and flocks to pass to the view
            const beiteomrader = await BEITEOMRADE.find();
            const flokker = await FLOKK.find({ eier: req.user._id });

            res.render("beiteomrade", {
                title: "Knytt flokk til beiteomrade",
                msg: "Flokk ble knyttet til beiteomrade.",
                user: req.user,
                beiteomrader: beiteomrader, // Pass grazing areas to the template
                flokker: flokker, // Pass flocks to the template
            });
        } catch (err) {
            console.error("Feil ved tilknytning av flokk til beiteomrade:", err);

            // Fetch grazing areas and flocks to pass to the view
            const beiteomrader = await BEITEOMRADE.find();
            const flokker = await FLOKK.find({ eier: req.user._id });

            res.render("beiteomrade", {
                title: "Knytt flokk til beiteomrade",
                msg: "Noe gikk galt ved tilknytning av flokk til beiteomrade.",
                user: req.user,
                beiteomrader: beiteomrader, // Pass grazing areas to the template
                flokker: flokker, // Pass flocks to the template
            });
        }
    },
};

module.exports = apiController;