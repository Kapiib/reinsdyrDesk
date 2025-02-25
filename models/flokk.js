const mongoose = require("mongoose");

const flokkSchema = new mongoose.Schema({
    navnPaFlokken: { type: String, required: true },
    serieinndeling: { type: String },
    buemerkeNavn: { type: String },
    buemerkeBilde: { type: String },
    eier: { type: mongoose.Schema.Types.ObjectId, ref: "EIER", required: true }, // Reference to EIER model
});

const FLOKK = mongoose.model("FLOKK", flokkSchema);

module.exports = FLOKK;