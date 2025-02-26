const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BEITEOMRADE_FYLKER_MAPPING = {
    Sør: ["Trøndelag", "Nordland", "Jämtland", "Västernorrland"],
    Ume: ["Västerbotten"],
    Pite: ["Norrbotten"],
    Lule: ["Nordland", "Norrbotten"],
    Nord: ["Finnmark", "Troms", "Nordland", "Norrbotten", "Lappi"],
    Enare: ["Lappi"],
    Skolt: ["Lappi", "Murmansk oblast"],
    Akkala: ["Murmansk oblast"],
    Kildin: ["Murmansk oblast"],
    Ter: ["Murmansk oblast"],
};

const beiteomradeSchema = new Schema({
    primærBeiteomrade: {
        type: String,
        enum: Object.keys(BEITEOMRADE_FYLKER_MAPPING),
        required: true,
    },
    fylker: [
        {
            type: String,
            enum: [
                "Nordland",
                "Troms",
                "Finnmark",
                "Trøndelag",
                "Norrbotten",
                "Västerbotten",
                "Jämtland",
                "Västernorrland",
                "Lappi",
                "Murmansk oblast",
                "Republikken Karelen",
            ],
            required: true,
        },
    ],
    flokker: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "FLOKK",
        },
    ],
});

beiteomradeSchema.pre("save", function (next) {
    if (this.isModified("primærBeiteomrade") || this.isNew) {
        this.fylker = BEITEOMRADE_FYLKER_MAPPING[this.primærBeiteomrade] || [];
    }
    next();
});

const BEITEOMRADE = mongoose.model("BEITEOMRADE", beiteomradeSchema);

module.exports = BEITEOMRADE;

