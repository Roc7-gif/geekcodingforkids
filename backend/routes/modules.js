const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/modules - Liste tous les modules
router.get('/', async (req, res) => {
  try {
    const modules = await Module.find({ isActive: true }).sort('numero');
    res.json(modules);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/modules/:id
router.get('/:id', async (req, res) => {
  try {
    const module = await Module.findById(req.params.id);
    if (!module) return res.status(404).json({ message: 'Module non trouvé' });
    res.json(module);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/modules - Créer module (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const module = await Module.create(req.body);
    res.status(201).json(module);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/modules/:id - Modifier module (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!module) return res.status(404).json({ message: 'Module non trouvé' });
    res.json(module);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/modules/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Module.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Module désactivé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Seed data pour initialiser les modules
router.post('/seed/init', protect, adminOnly, async (req, res) => {
  try {
    await Module.deleteMany({});
    const modules = [
      {
        numero: 1, titre: 'Découverte du Code', trancheAge: '7–10 ans',
        description: 'Initiation à la programmation avec Scratch et Blockly. Les enfants créent leurs premiers mini-jeux et découvrent l\'électronique avec Arduino.',
        dureeWeeks: 8, heuresParSemaine: 1.5,
        langages: ['Scratch', 'Blockly', 'Arduino'],
        competences: ['Logique', 'Créativité', 'Électronique de base'],
        livrables: ['Mini-jeux interactifs', 'Projets Arduino simples'],
        tarif: 55000, couleur: '#00e5ff', icone: '🎮',
      },
      {
        numero: 2, titre: 'Programmation & Robotique', trancheAge: '11–14 ans',
        description: 'Programmation intermédiaire, création de mini-sites web, robotique Arduino et introduction à la modélisation 3D avec Tinkercad.',
        dureeWeeks: 10, heuresParSemaine: 2,
        langages: ['Python', 'HTML/CSS', 'Arduino C'],
        competences: ['Programmation', 'Électronique', 'Robotique', 'Modélisation 3D'],
        livrables: ['Mini-sites web', 'Projets Arduino', 'Modèles 3D'],
        tarif: 75000, couleur: '#00ff88', icone: '🤖',
      },
      {
        numero: 3, titre: 'Technologie Avancée', trancheAge: '15–17 ans',
        description: 'Développement web, robotique avancée, projets Arduino complexes, modélisation 3D Blender et introduction à l\'IA.',
        dureeWeeks: 12, heuresParSemaine: 2.5,
        langages: ['Python', 'JavaScript', 'Arduino C', 'HTML/CSS'],
        competences: ['Programmation avancée', 'Robotique', 'IA', 'Modélisation 3D'],
        livrables: ['Applications web', 'Robots programmés', 'Modèles 3D', 'Mini-projets IA'],
        tarif: 100000, couleur: '#ff6b35', icone: '🚀',
      },
      {
        numero: 4, titre: 'Projets Intégrés & Portfolio', trancheAge: 'Tous niveaux',
        description: 'Projet final combinant code, électronique, robotique et 3D. Création d\'un portfolio complet numérique des réalisations.',
        dureeWeeks: 4, heuresParSemaine: 2.5,
        langages: ['Tous langages'],
        competences: ['Intégration', 'Créativité', 'Présentation', 'Travail collaboratif'],
        livrables: ['Robot autonome', 'Portfolio complet', 'Modèle 3D imprimable'],
        tarif: 50000, couleur: '#a855f7', icone: '🏆',
      },
    ];
    const created = await Module.insertMany(modules);
    res.json({ message: '4 modules créés', modules: created });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
