#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config();

const Inscription = require('../models/Inscription');
const Module = require('../models/Module');
const Enfant = require('../models/Enfant');

async function fixNullModules() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // 1. Vérifier les inscriptions avec module null
    const nullModules = await Inscription.find({ module: null });
    console.log(`\n⚠️  Found ${nullModules.length} inscriptions with null module`);

    if (nullModules.length === 0) {
      console.log('✓ All inscriptions have modules!');
      process.exit(0);
    }

    // 2. Récupérer le premier module
    const firstModule = await Module.findOne().sort('numero');
    if (!firstModule) {
      console.error('❌ No modules found in database');
      process.exit(1);
    }

    console.log(`\n📚 Assigning module: ${firstModule.titre} (${firstModule.numero})`);

    // 3. Réparer les inscriptions
    const result = await Inscription.updateMany(
      { module: null },
      { module: firstModule._id }
    );

    console.log(`✓ Updated ${result.modifiedCount} inscriptions`);

    // 4. Mettre à jour aussi les enfants
    for (const insc of nullModules) {
      await Enfant.updateMany(
        { inscription: insc._id },
        { module: firstModule._id }
      );
    }

    console.log(`✓ Updated ${nullModules.length} enfants`);

    // 5. Vérifier le résultat
    const checkNull = await Inscription.find({ module: null });
    console.log(`\n✓ Verification: ${checkNull.length} inscriptions still with null module`);

    if (checkNull.length === 0) {
      console.log('\n🎉 All inscriptions fixed successfully!');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixNullModules();
