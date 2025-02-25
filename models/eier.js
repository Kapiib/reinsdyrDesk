    const mongoose = require("mongoose");
    const { randomUUID } = require('crypto');

    const eierSchema = new mongoose.Schema({
        navn: { type: String, required: true },
        uniktNummer: { type: String, default: () => randomUUID(),required: true, unique: true },
        epost: { type: String, required: true, unique: true },
        passord: { type: String, required: true },
        kontaktsprak: { type: String },
        telefonnummer: { type: String },
    });

    const EIER = mongoose.model("EIER", eierSchema);

    module.exports = EIER;
