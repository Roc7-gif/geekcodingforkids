const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true },
  telephone: { type: String },
  sujet: { type: String, required: true },
  message: { type: String, required: true },
  statut: { type: String, enum: ['nouveau', 'lu', 'repondu'], default: 'nouveau' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
