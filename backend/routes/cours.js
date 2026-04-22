const express = require('express');
const router = express.Router();
const Cours = require('../models/Cours');
const Lecon = require('../models/Lecon');
const { protect, adminOnly, protectEnfant } = require('../middleware/auth');

// ─── ROUTES ENFANT (lecture seule) ───────────────────────────────────────────

// GET /api/cours?moduleId=... — Lister les cours d'un module
router.get('/', protectEnfant, async (req, res) => {
  try {
    const { moduleId } = req.query;
    if (!moduleId) return res.status(400).json({ message: 'moduleId requis' });
    const cours = await Cours.find({ module: moduleId, isActive: true }).sort('ordre');
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/cours/:id — Détail d'un cours + ses leçons
router.get('/:id', protectEnfant, async (req, res) => {
  try {
    const cours = await Cours.findById(req.params.id).populate('module', 'titre numero');
    if (!cours || !cours.isActive) return res.status(404).json({ message: 'Cours non trouvé' });
    const lecons = await Lecon.find({ cours: cours._id, isActive: true }).sort('ordre');
    res.json({ cours, lecons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ROUTES ADMIN (CRUD) ──────────────────────────────────────────────────────

// GET /api/cours/admin/all — Admin: tous les cours (sans filtre isActive)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { moduleId } = req.query;
    const filter = moduleId ? { module: moduleId } : {};
    const cours = await Cours.find(filter)
      .populate('module', 'titre numero couleur')
      .sort({ module: 1, ordre: 1 });
    res.json(cours);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cours — Créer un cours (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const cours = await Cours.create(req.body);
    res.status(201).json(cours);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/cours/:id — Modifier un cours (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cours = await Cours.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!cours) return res.status(404).json({ message: 'Cours non trouvé' });
    res.json(cours);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/cours/:id — Désactiver un cours (soft delete admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Cours.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Cours désactivé' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
