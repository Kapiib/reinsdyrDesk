const FLOKK = require("../models/flokk");

// Function to create a new flokk
const createFlokk = async (req, res) => {
    try {
        // check if flokk is aleready in mongodb database
        const existingFlokk = await FLOKK.findOne({ eier: req.user._id });
        if (existingFlokk) {
            return res.render('nyFlokk', {
                title: 'NyFlokk',
                success: false,
                msg: "Flokken finnes allerede!",
                user: req.user
            });
        }

        console.log("req.user:", req.user); // Debugging
        const { navnPaFlokken, serieinndeling, buemerkeNavn } = req.body;
        const buemerkeBilde = req.file ? `/uploads/${req.file.filename}` : null;
        const eier = req.user._id; // Use req.user._id

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
        conole.log("NyFlokk error:", error);
        return res.render('nyFlokk', {
            title: 'NyFlokk',
            success: false,
            msg: "Something went wrong, please try again!",
            user: req.user
        });
    }
};

module.exports = { createFlokk };