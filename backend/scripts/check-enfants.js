require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
require('../models');
const Inscription = require('../models/Inscription');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connecté à MongoDB\n');

  const inscriptions = await Inscription.find()
    .populate('parent', 'nom prenom email')
    .sort('-createdAt');

  console.log('=== Audit champs enfant ===\n');
  inscriptions.forEach((ins, i) => {
    const e = ins.enfant || {};
    const issues = [];
    if (!e.nom) issues.push('nom manquant');
    if (!e.prenom) issues.push('prenom manquant');
    if (!e.age) issues.push('age manquant');
    if (!e.niveau) issues.push('niveau manquant');

    const status = issues.length ? `⚠️  [${issues.join(', ')}]` : '✅';
    console.log(`#${i+1} ${status}`);
    console.log(`   Enfant  : prenom="${e.prenom}" nom="${e.nom}" age=${e.age} niveau=${e.niveau}`);
    console.log(`   Parent  : ${ins.parent?.prenom} ${ins.parent?.nom} <${ins.parent?.email}>`);
    console.log(`   Statut  : ${ins.statut}`);
    console.log('');
  });

  // Compter les inscriptions sans enfant.prenom ou enfant.nom
  const nullCount = inscriptions.filter(i => !i.enfant?.prenom || !i.enfant?.nom).length;
  console.log(`\n📊 ${nullCount} inscription(s) avec données enfant incomplètes`);

  await mongoose.disconnect();
  console.log('🔌 Déconnecté.');
}

run().catch(console.error);
