const mongoose = require('mongoose');

const inscriptionSchema = new mongoose.Schema({
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  enfant: {
    nom: { type: String, required: true },
    prenom: { type: String, required: true },
    age: { type: Number, required: true },
    niveau: { type: String, enum: ['debutant', 'intermediaire'], default: 'debutant' },
  },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  kitsArduino: { type: Boolean, default: false },
  montantTotal: { type: Number, required: true },
  statut: {
    type: String,
    enum: ['en_attente', 'confirme', 'paye', 'annule'],
    default: 'en_attente',
  },
  dateDebut: { type: Date },
  notes: { type: String },
  format: { type: String, enum: ['presentiel', 'enligne', 'hybride'], default: 'hybride' },
  generatedCredentials: {
    username: String,
    password: String,
    generatedAt: Date,
  },
  fedaTransactionId: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Inscription', inscriptionSchema);
