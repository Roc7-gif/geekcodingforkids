const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Enfant = require('../models/Enfant');
const Inscription = require('../models/Inscription');
const Module = require('../models/Module');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Middleware d'authentification enfant
const protectEnfant = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Non authentifié' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.enfant = await Enfant.findById(decoded.id);
    if (!req.enfant) return res.status(401).json({ message: 'Enfant non trouvé' });
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

// POST /api/enfant/login - Connexion enfant
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const enfant = await Enfant.findOne({ username });
    if (!enfant || !(await enfant.matchPassword(password)))
      return res.status(401).json({ message: 'Identifiants incorrects' });

    res.json({ enfant: enfant.toJSON(), token: generateToken(enfant._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enfant/me - Profil enfant
router.get('/me', protectEnfant, async (req, res) => {
  res.json(req.enfant.toJSON());
});

// GET /api/enfant/mon-inscription - Voir son inscription
router.get('/mon-inscription', protectEnfant, async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.enfant.inscription)
      .populate({
        path: 'module',
        model: 'Module',
        select: 'titre numero description tarif duree format langages competences livrables'
      })
      .populate({
        path: 'parent',
        model: 'User',
        select: 'nom prenom email telephone'
      });
    
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }
    
    res.json(inscription);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/enfant/progression - Mettre à jour progression
router.put('/progression', protectEnfant, async (req, res) => {
  try {
    const { progression } = req.body;
    if (progression < 0 || progression > 100) {
      return res.status(400).json({ message: 'Progression entre 0 et 100' });
    }
    const enfant = await Enfant.findByIdAndUpdate(
      req.enfant._id,
      { progression },
      { new: true }
    );
    res.json(enfant.toJSON());
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/enfant/all - Admin: Voir tous les enfants avec credentials
router.get('/all', protect, adminOnly, async (req, res) => {
  try {
    const inscriptions = await Inscription.find({ 
      $or: [{ statut: 'confirme' }, { statut: 'paye' }]
    })
      .populate('parent', 'nom prenom email')
      .populate('module', 'titre numero')
      .populate({
        path: 'parent',
        select: 'nom prenom email'
      })
      .sort('-createdAt');
    
    const enfantsData = inscriptions.map(insc => ({
      _id: insc._id,
      inscriptionId: insc._id,
      enfant: {
        nom: insc.enfant.nom,
        prenom: insc.enfant.prenom,
        age: insc.enfant.age,
        niveau: insc.enfant.niveau,
      },
      credentials: insc.generatedCredentials || { username: '---', password: '---' },
      parent: insc.parent,
      module: insc.module,
      statut: insc.statut,
      dateDebut: insc.dateDebut,
      createdAt: insc.createdAt,
    }));
    
    res.json({ enfants: enfantsData, count: enfantsData.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = { router, protectEnfant };
