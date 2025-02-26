const mongoose = require("mongoose");

const flokkSchema = new mongoose.Schema({
    navnPaFlokken: { type: String, required: true },
    serieinndeling: { type: String },
    buemerkeNavn: { type: String },
    buemerkeBilde: { type: String },
    eier: { type: mongoose.Schema.Types.ObjectId, ref: "EIER", required: true },
    reinsdyr: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "INDIVIDUELT_REINSDYR",
        },
    ],
});

const FLOKK = mongoose.model("FLOKK", flokkSchema);

module.exports = FLOKK;