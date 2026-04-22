require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'parent', 'enfant'], default: 'parent' },
  telephone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

userSchema.methods.matchPassword = async function (pwd) {
  return bcrypt.compare(pwd, this.password);
};

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  const TARGET_EMAIL = 'roc@gmail.com';

  // 1. Chercher l'utilisateur
  const user = await User.findOne({ email: TARGET_EMAIL });

  if (!user) {
    console.log(`❌ Utilisateur ${TARGET_EMAIL} introuvable.\n`);
    console.log('👉 Création en cours...');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const newUser = await User.create({
      nom: 'Admin',
      prenom: 'Roc',
      email: TARGET_EMAIL,
      password: hashedPassword,
      role: 'admin',
      isActive: true,
    });

    console.log('✅ Admin créé avec succès :');
    console.log(`   Email    : ${newUser.email}`);
    console.log(`   Mot passe: admin123  ← à changer !`);
    console.log(`   Rôle     : ${newUser.role}`);
    console.log(`   Nom      : ${newUser.prenom} ${newUser.nom}`);
  } else {
    console.log(`✅ Utilisateur trouvé :`);
    console.log(`   ID    : ${user._id}`);
    console.log(`   Email : ${user.email}`);
    console.log(`   Nom   : ${user.prenom} ${user.nom}`);
    console.log(`   Rôle  : ${user.role}`);
    console.log(`   Actif : ${user.isActive}`);

    if (user.role !== 'admin') {
      console.log('\n⚠️  Le rôle n\'est PAS admin. Correction...');
      user.role = 'admin';
      await user.save();
      console.log('✅ Rôle mis à jour → admin');
    } else {
      console.log('\n✅ Rôle admin déjà correct.');
    }

    if (!user.nom || !user.prenom) {
      console.log('\n⚠️  Nom/Prénom manquant (null null). Correction...');
      user.nom = user.nom || 'Admin';
      user.prenom = user.prenom || 'Roc';
      await user.save();
      console.log(`✅ Nom mis à jour → ${user.prenom} ${user.nom}`);
    }
  }

  // 2. Lister tous les admins
  console.log('\n--- Tous les admins en base ---');
  const admins = await User.find({ role: 'admin' }).select('-password');
  if (admins.length === 0) {
    console.log('Aucun admin trouvé !');
  } else {
    admins.forEach(a => {
      console.log(`  • ${a.email} | ${a.prenom} ${a.nom} | actif: ${a.isActive}`);
    });
  }

  await mongoose.disconnect();
  console.log('\n🔌 Déconnecté.');
}

run().catch(console.error);
