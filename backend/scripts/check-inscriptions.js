require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
require('../models');
const Inscription = require('../models/Inscription');
const User = require('../models/User');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  const inscriptions = await Inscription.find()
    .populate('parent', 'nom prenom email role')
    .populate('module', 'titre numero')
    .sort('-createdAt')
    .limit(20);

  console.log(`📋 ${inscriptions.length} inscription(s) trouvée(s)\n`);

  inscriptions.forEach((ins, i) => {
    const p = ins.parent;
    const parentInfo = p
      ? `${p.prenom || '⚠️NULL'} ${p.nom || '⚠️NULL'} <${p.email}> [${p.role}]`
      : '❌ Parent introuvable (ref cassée)';

    console.log(`#${i + 1} | Statut: ${ins.statut}`);
    console.log(`   Parent  : ${parentInfo}`);
    console.log(`   Enfant  : ${ins.enfant?.prenom} ${ins.enfant?.nom}`);
    console.log(`   Module  : ${ins.module?.titre || '⚠️ null'}`);
    console.log(`   Montant : ${ins.montantTotal} F`);
    console.log('');
  });

  // Chercher les parents avec nom/prenom null
  console.log('--- Users avec nom/prenom manquant ---');
  const badUsers = await User.find({
    $or: [{ nom: null }, { prenom: null }, { nom: '' }, { prenom: '' }]
  });
  if (badUsers.length === 0) {
    console.log('✅ Tous les users ont nom et prenom.');
  } else {
    badUsers.forEach(u => console.log(`  ⚠️ ${u.email} → nom="${u.nom}" prenom="${u.prenom}"`));
    
    // Corriger automatiquement
    console.log('\n👉 Correction en cours...');
    for (const u of badUsers) {
      u.nom = u.nom || u.email.split('@')[0];
      u.prenom = u.prenom || 'Utilisateur';
      await u.save();
      console.log(`  ✅ ${u.email} mis à jour → ${u.prenom} ${u.nom}`);
    }
  }

  await mongoose.disconnect();
  console.log('\n🔌 Déconnecté.');
}

run().catch(console.error);
