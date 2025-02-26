const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    reinsdyr: { type: mongoose.Schema.Types.ObjectId, ref: 'INDIVIDUELT_REINSDYR', required: true },
    fromEier: { type: mongoose.Schema.Types.ObjectId, ref: 'EIER', required: true },
    toEierEmail: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted_by_new', 'pending_final_confirmation', 'completed', 'rejected'],
        default: 'pending'
    },
    timestamp: { type: Date, default: Date.now }
});

const TRANSACTION = mongoose.model('TRANSACTION', transactionSchema);

module.exports = TRANSACTION;