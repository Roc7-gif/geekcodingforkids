const mongoose = require('mongoose');

const progressionLeconSchema = new mongoose.Schema({
  enfant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enfant',
    required: true,
  },
  lecon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecon',
    required: true,
  },
  completee: { type: Boolean, default: false },
  dateCompletee: { type: Date },
  tempsPasseMinutes: { type: Number, default: 0 }, // futur: suivi temps passé
}, { timestamps: true });

// Un enfant ne peut avoir qu'une entrée par leçon
progressionLeconSchema.index({ enfant: 1, lecon: 1 }, { unique: true });

module.exports = mongoose.model('ProgressionLecon', progressionLeconSchema);
