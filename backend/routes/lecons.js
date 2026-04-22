const express = require('express');
const router = express.Router();
const Lecon = require('../models/Lecon');
const ProgressionLecon = require('../models/ProgressionLecon');
const { protect, adminOnly, protectEnfant } = require('../middleware/auth');

// ─── ROUTES ENFANT ────────────────────────────────────────────────────────────

// GET /api/lecons?coursId=... — Lister les leçons d'un cours
router.get('/', protectEnfant, async (req, res) => {
  try {
    const { coursId } = req.query;
    if (!coursId) return res.status(400).json({ message: 'coursId requis' });
    const lecons = await Lecon.find({ cours: coursId, isActive: true })
      .select('-contenu.texte') // On n'envoie pas le texte entier dans la liste
      .sort('ordre');
    res.json(lecons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lecons/ma-progression — Progressions de l'enfant connecté
router.get('/ma-progression', protectEnfant, async (req, res) => {
  try {
    const progressions = await ProgressionLecon.find({
      enfant: req.enfant._id,
      completee: true,
    }).select('lecon dateCompletee');
    // Retourner un Set d'IDs de leçons complétées pour lookup rapide côté frontend
    const leconIds = progressions.map((p) => p.lecon.toString());
    res.json({ completees: leconIds, total: leconIds.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/lecons/:id — Détail complet d'une leçon (avec contenu)
router.get('/:id', protectEnfant, async (req, res) => {
  try {
    const lecon = await Lecon.findById(req.params.id)
      .populate('cours', 'titre module ordre');
    if (!lecon || !lecon.isActive) return res.status(404).json({ message: 'Leçon non trouvée' });

    // Récupérer la progression de l'enfant pour cette leçon
    const progression = await ProgressionLecon.findOne({
      enfant: req.enfant._id,
      lecon: lecon._id,
    });

    // Leçons précédente et suivante
    const [precedente, suivante] = await Promise.all([
      Lecon.findOne({ cours: lecon.cours._id, ordre: lecon.ordre - 1, isActive: true }).select('_id titre ordre'),
      Lecon.findOne({ cours: lecon.cours._id, ordre: lecon.ordre + 1, isActive: true }).select('_id titre ordre'),
    ]);

    res.json({
      lecon,
      completee: progression?.completee || false,
      precedente,
      suivante,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/lecons/:id/progression — Marquer leçon comme complétée
router.patch('/:id/progression', protectEnfant, async (req, res) => {
  try {
    const lecon = await Lecon.findById(req.params.id);
    if (!lecon || !lecon.isActive) return res.status(404).json({ message: 'Leçon non trouvée' });

    const progression = await ProgressionLecon.findOneAndUpdate(
      { enfant: req.enfant._id, lecon: req.params.id },
      {
        completee: true,
        dateCompletee: new Date(),
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progression });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ROUTES ADMIN ─────────────────────────────────────────────────────────────

// GET /api/lecons/admin/all — Admin: toutes les leçons (avec filtre optionnel coursId)
router.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const { coursId } = req.query;
    const filter = coursId ? { cours: coursId } : {};
    const lecons = await Lecon.find(filter)
      .populate('cours', 'titre module')
      .sort({ cours: 1, ordre: 1 });
    res.json(lecons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/lecons — Créer une leçon (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const lecon = await Lecon.create(req.body);
    res.status(201).json(lecon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT /api/lecons/:id — Modifier une leçon (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const lecon = await Lecon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lecon) return res.status(404).json({ message: 'Leçon non trouvée' });
    res.json(lecon);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE /api/lecons/:id — Désactiver une leçon (soft delete admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Lecon.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Leçon désactivée' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
