const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const enfantSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  username: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  age: { type: Number, required: true },
  niveau: { type: String, enum: ['debutant', 'intermediaire'], default: 'debutant' },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Inscription' },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  avatar: { type: String, default: '' },
  progression: { type: Number, default: 0 }, // En pourcentage
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// Hash password avant de sauvegarder
enfantSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Méthode pour comparer les mots de passe
enfantSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Ne pas retourner le password en JSON
enfantSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Enfant', enfantSchema);
