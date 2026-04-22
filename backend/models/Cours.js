const mongoose = require('mongoose');

const coursSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: true,
    index: true,
  },
  titre: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  ordre: { type: Number, required: true, default: 1 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index composé pour tri rapide par module
coursSchema.index({ module: 1, ordre: 1 });

module.exports = mongoose.model('Cours', coursSchema);
