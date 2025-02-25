const mongoose = require("mongoose");

const individueltReinsdyrSchema = new mongoose.Schema({
    serienummer: { type: String, required: true, unique: true },
    navn: { type: String },
    fodselsdato: { type: Date },
    flokk: { type: mongoose.Schema.Types.ObjectId, ref: "FLOKK", required: true }, // Reference to FLOKK model
});

const INDIVIDUELT_REINSDYR = mongoose.model("INDIVIDUELT_REINSDYR", individueltReinsdyrSchema);

module.exports = INDIVIDUELT_REINSDYR;
