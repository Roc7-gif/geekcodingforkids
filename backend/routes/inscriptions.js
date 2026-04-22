const express = require('express');
const router = express.Router();
const Inscription = require('../models/Inscription');
const Module = require('../models/Module');
const Enfant = require('../models/Enfant');
const { protect, adminOnly } = require('../middleware/auth');

// Fonction pour générer username et password uniques
const generateChildCredentials = (prenom, nom) => {
  const username = `${prenom.toLowerCase().slice(0, 3)}${nom.toLowerCase().slice(0, 3)}${Math.floor(Math.random() * 1000)}`.substring(0, 12);
  const password = Math.random().toString(36).slice(2, 10) + Math.floor(Math.random() * 100);
  return { username, password };
};

// Attacher à l'objet router pour l'exportation
router.generateChildCredentials = generateChildCredentials;


// POST /api/inscriptions - Créer inscription
router.post('/', protect, async (req, res) => {
  try {
    const { moduleId, enfant, kitsArduino, format, dateDebut, notes } = req.body;
    const moduleData = await Module.findById(moduleId);
    if (!moduleData) return res.status(404).json({ message: 'Module non trouvé' });
    console.log(kitsArduino);
    const kitsSupp = kitsArduino === 'on' ? 22500 : 0;
    const montantTotal = moduleData.tarif + kitsSupp;

    const inscription = await Inscription.create({
      parent: req.user._id,
      enfant,
      module: moduleId,
      kitsArduino: kitsArduino === 'on' ? true : false,
      montantTotal,
      format: format || 'hybride',
      dateDebut,
      notes,
    });

    await inscription.populate('module');
    res.status(201).json(inscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/inscriptions/mes-inscriptions
router.get('/mes-inscriptions', protect, async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ parent: req.user._id })
      .populate('module')
      .sort('-createdAt');
    res.json(inscriptions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/inscriptions - Admin: toutes les inscriptions
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { statut, page = 1, limit = 20 } = req.query;
    const filter = statut ? { statut } : {};
    const inscriptions = await Inscription.find(filter)
      .populate('parent', 'nom prenom email telephone')
      .populate('module', 'titre numero tarif')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Inscription.countDocuments(filter);
    res.json({ inscriptions, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/inscriptions/:id/statut - Admin: changer statut
router.put('/:id/statut', protect, adminOnly, async (req, res) => {
  try {
    const { statut } = req.body;
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription non trouvée' });

    const oldStatut = inscription.statut;
    inscription.statut = statut;
    await inscription.save();

    // Créer compte enfant si statut passe à "confirme" ou "paye"
    if ((oldStatut === 'en_attente' || oldStatut === 'confirme') && (statut === 'confirme' || statut === 'paye')) {
      let enfant = await Enfant.findOne({ inscription: inscription._id });

      if (!enfant) {
        const { username, password } = generateChildCredentials(inscription.enfant.prenom, inscription.enfant.nom);

        // Stocker les credentials plaintext temporairement dans l'inscription
        inscription.generatedCredentials = {
          username,
          password,
          generatedAt: new Date(),
        };

        enfant = await Enfant.create({
          nom: inscription.enfant.nom,
          prenom: inscription.enfant.prenom,
          username,
          password,
          age: inscription.enfant.age,
          niveau: inscription.enfant.niveau,
          parent: inscription.parent,
          inscription: inscription._id,
          module: inscription.module,
        });

        await inscription.save();

        // Retourner les credentials générés
        await inscription.populate('module');
        await inscription.populate('parent', 'nom prenom email');

        return res.json({
          inscription,
          enfantCredentials: {
            username: enfant.username,
            password: password,
            message: 'Compte enfant créé - Partager ces identifiants avec l\'enfant'
          }
        });
      }
    }

    await inscription.populate('module');
    await inscription.populate('parent', 'nom prenom email');

    res.json(inscription);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/inscriptions/regenerate/all-credentials - Admin: Régénérer tous les credentials manquants
router.get('/regenerate/all-credentials', protect, adminOnly, async (req, res) => {
  try {
    const inscriptions = await Inscription.find({
      $or: [
        { statut: 'confirme' },
        { statut: 'paye' }
      ]
    });

    let count = 0;
    for (const inscription of inscriptions) {
      // Si pas de credentials, les générer
      if (!inscription.generatedCredentials || !inscription.generatedCredentials.username) {
        const { username, password } = generateChildCredentials(
          inscription.enfant.prenom,
          inscription.enfant.nom
        );

        inscription.generatedCredentials = {
          username,
          password,
          generatedAt: new Date(),
        };
        await inscription.save();
        count++;
      }
    }

    res.json({
      message: `${count} credentials générés`,
      count,
      total: inscriptions.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/inscriptions/:id/regenerate-credentials - Admin: Régénérer credentials pour une inscription
router.put('/:id/regenerate-credentials', protect, adminOnly, async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.id);
    if (!inscription) return res.status(404).json({ message: 'Inscription non trouvée' });

    const { username, password } = generateChildCredentials(
      inscription.enfant.prenom,
      inscription.enfant.nom
    );

    inscription.generatedCredentials = {
      username,
      password,
      generatedAt: new Date(),
    };

    // Mettre à jour aussi le compte enfant s'il existe
    const enfant = await Enfant.findOne({ inscription: inscription._id });
    if (enfant) {
      enfant.username = username;
      enfant.password = password;
      await enfant.save();
    }

    await inscription.save();

    res.json({
      message: 'Credentials régénérés',
      credentials: {
        username,
        password,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/inscriptions/check/null-modules - Admin: Vérifier les inscriptions sans module
router.get('/check/null-modules', protect, adminOnly, async (req, res) => {
  try {
    const nullModules = await Inscription.find({ module: null });

    const modules = await Module.find().select('_id titre numero');

    res.json({
      nullModuleCount: nullModules.length,
      inscriptionsWithNullModule: nullModules.map(i => ({
        _id: i._id,
        enfant: `${i.enfant.prenom} ${i.enfant.nom}`,
        statut: i.statut,
        createdAt: i.createdAt,
      })),
      availableModules: modules,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/inscriptions/fix/assign-first-module - Admin: Attacher le premier module aux inscriptions orphelines
router.put('/fix/assign-first-module', protect, adminOnly, async (req, res) => {
  try {
    const firstModule = await Module.findOne().sort('numero');
    if (!firstModule) return res.status(404).json({ message: 'Aucun module disponible' });

    const result = await Inscription.updateMany(
      { module: null },
      { module: firstModule._id }
    );

    // Mettre à jour aussi les enfants associés
    const inscriptionsUpdated = await Inscription.find({ module: firstModule._id });
    for (const insc of inscriptionsUpdated) {
      await Enfant.updateMany(
        { inscription: insc._id },
        { module: firstModule._id }
      );
    }

    res.json({
      message: `${result.modifiedCount} inscriptions réparées`,
      firstModuleAssigned: firstModule.titre,
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/inscriptions/:id/assign-module - Admin: Attacher un module spécifique
router.put('/:id/assign-module', protect, adminOnly, async (req, res) => {
  try {
    const { moduleId } = req.body;

    const module = await Module.findById(moduleId);
    if (!module) return res.status(404).json({ message: 'Module non trouvé' });

    const inscription = await Inscription.findByIdAndUpdate(
      req.params.id,
      { module: moduleId },
      { new: true }
    ).populate('module');

    // Mettre à jour aussi l'enfant
    await Enfant.updateMany(
      { inscription: inscription._id },
      { module: moduleId }
    );

    res.json({
      message: 'Module assigné',
      inscription,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/inscriptions/stats - Admin: statistiques
router.get('/stats/overview', protect, adminOnly, async (req, res) => {
  try {
    const total = await Inscription.countDocuments();
    const confirmes = await Inscription.countDocuments({ statut: 'confirme' });
    const payes = await Inscription.countDocuments({ statut: 'paye' });
    const enAttente = await Inscription.countDocuments({ statut: 'en_attente' });
    const revenusTotal = await Inscription.aggregate([
      { $match: { statut: 'paye' } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } },
    ]);
    const parModule = await Inscription.aggregate([
      { $group: { _id: '$module', count: { $sum: 1 } } },
      { $lookup: { from: 'modules', localField: '_id', foreignField: '_id', as: 'module' } },
      { $unwind: '$module' },
      { $project: { titre: '$module.titre', count: 1 } },
    ]);
    res.json({
      total, confirmes, payes, enAttente,
      revenus: revenusTotal[0]?.total || 0,
      parModule,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/inscriptions/seed/init - Enregistrer données fictives
router.post('/seed/init', protect, adminOnly, async (req, res) => {
  try {
    const User = require('../models/User');

    // Récupérer les modules et utilisateurs
    const modules = await Module.find();
    const parents = await User.find({ role: 'parent' });

    if (modules.length === 0) return res.status(400).json({ message: 'Aucun module disponible. Seed les modules d\'abord.' });
    if (parents.length === 0) return res.status(400).json({ message: 'Aucun parent disponible. Seed les utilisateurs d\'abord.' });

    // Nettoyer les anciennes inscriptions
    await Inscription.deleteMany({});

    const fakeInscriptions = [
      {
        parent: parents[0]._id, module: modules[0]._id, kitsArduino: true,
        enfant: { nom: 'Martin', prenom: 'Lucas', age: 8, niveau: 'debutant' },
        montantTotal: modules[0].tarif + 22500, statut: 'paye', format: 'presentiel',
        dateDebut: new Date('2026-05-15'), notes: 'Premier module de l\'enfant'
      },
      {
        parent: parents[1]._id, module: modules[1]._id, kitsArduino: false,
        enfant: { nom: 'Dupont', prenom: 'Emma', age: 12, niveau: 'intermediaire' },
        montantTotal: modules[1].tarif, statut: 'confirme', format: 'enligne',
        dateDebut: new Date('2026-06-01'), notes: ''
      },
      {
        parent: parents[2]._id, module: modules[0]._id, kitsArduino: true,
        enfant: { nom: 'Durand', prenom: 'Thomas', age: 9, niveau: 'debutant' },
        montantTotal: modules[0].tarif + 22500, statut: 'en_attente', format: 'hybride',
        dateDebut: new Date('2026-05-20'), notes: 'En attente de confirmation'
      },
      {
        parent: parents[3]._id, module: modules[2]._id, kitsArduino: true,
        enfant: { nom: 'Bernard', prenom: 'Sophie', age: 15, niveau: 'intermediaire' },
        montantTotal: modules[2].tarif + 22500, statut: 'paye', format: 'presentiel',
        dateDebut: new Date('2026-05-10'), notes: 'Très intéressée par la robotique'
      },
      {
        parent: parents[4]._id, module: modules[1]._id, kitsArduino: false,
        enfant: { nom: 'Thomas', prenom: 'Noah', age: 11, niveau: 'debutant' },
        montantTotal: modules[1].tarif, statut: 'paye', format: 'enligne',
        dateDebut: new Date('2026-06-05'), notes: ''
      },
      {
        parent: parents[0]._id, module: modules[3]._id, kitsArduino: true,
        enfant: { nom: 'Martin', prenom: 'Clara', age: 10, niveau: 'debutant' },
        montantTotal: modules[3].tarif + 22500, statut: 'confirme', format: 'presentiel',
        dateDebut: new Date('2026-07-01'), notes: 'Projet intégré à la fin'
      },
    ];

    const created = await Inscription.insertMany(fakeInscriptions);
    res.status(201).json({
      message: `${created.length} inscriptions fictives créées`,
      count: created.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
