const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  numero: { type: Number, required: true, unique: true },
  titre: { type: String, required: true },
  description: { type: String, required: true },
  trancheAge: { type: String, required: true },
  dureeWeeks: { type: Number, required: true },
  heuresParSemaine: { type: Number, required: true },
  langages: [{ type: String }],
  competences: [{ type: String }],
  livrables: [{ type: String }],
  tarif: { type: Number, required: true },
  couleur: { type: String, default: '#00c2ff' },
  icone: { type: String, default: '💻' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

moduleSchema.virtual('dureeTotal').get(function () {
  return this.dureeWeeks * this.heuresParSemaine;
});

module.exports = mongoose.model('Module', moduleSchema);
