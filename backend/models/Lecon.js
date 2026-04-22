const mongoose = require('mongoose');

const pieceJointeSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  url: { type: String, required: true },
  source: { type: String, enum: ['link', 'upload'], default: 'upload' },
  type: { type: String, enum: ['pdf', 'image', 'zip', 'video', 'audio', 'autre'], default: 'autre' },
  taille: { type: Number }, // taille en Ko
}, { _id: true });

const mediaSchema = new mongoose.Schema({
  titre: { type: String, trim: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['embed', 'upload'], default: 'embed' },
}, { _id: true });

const contenuSchema = new mongoose.Schema({
  texte: { type: String, default: '' },    // HTML riche (ReactQuill)
  videos: [mediaSchema],
  audios: [mediaSchema],
}, { _id: false });

const leconSchema = new mongoose.Schema({
  cours: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cours',
    required: true,
    index: true,
  },
  titre: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['pratique', 'presentielle'],
    required: true,
    default: 'pratique',
  },
  ordre: { type: Number, required: true, default: 1 },
  dureeMinutes: { type: Number, default: 0 },
  contenu: { type: contenuSchema, default: () => ({ videos: [], audios: [] }) },
  pieceJointes: [pieceJointeSchema],
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Index composé pour tri rapide par cours
leconSchema.index({ cours: 1, ordre: 1 });

module.exports = mongoose.model('Lecon', leconSchema);
