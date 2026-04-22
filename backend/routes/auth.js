const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/register
router.post('/register', [
  body('nom').notEmpty().withMessage('Nom requis'),
  body('prenom').notEmpty().withMessage('Prénom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe min 6 caractères'),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { nom, prenom, email, password, telephone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email déjà utilisé' });

    const user = await User.create({ nom, prenom, email, password, telephone });
    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/google
router.post('/google', async (req, res) => {
  try {
    const { tokenId } = req.body;
    
    // Vérifier le token avec Google
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { sub, email, family_name, given_name, picture } = payload;

    // 1. Chercher par googleId
    let user = await User.findOne({ googleId: sub });
    
    if (!user) {
      // 2. Chercher par email pour lier le compte
      user = await User.findOne({ email });
      
      if (user) {
        // Lier le compte Google au compte email existant
        user.googleId = sub;
        if (!user.avatar) user.avatar = picture;
        await user.save();
      } else {
        // 3. Créer un nouveau compte Parent
        user = await User.create({
          nom: family_name || 'Utilisateur',
          prenom: given_name || 'Google',
          email,
          googleId: sub,
          avatar: picture,
          role: 'parent' // Par défaut parent
        });
      }
    }

    res.json({
      user,
      token: generateToken(user._id)
    });
  } catch (err) {
    console.error('Erreur Google Auth:', err);
    res.status(401).json({ message: 'Authentification Google échouée' });
  }
});

// POST /api/auth/login

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json(req.user);
});

// GET /api/auth/create-admin - Créer premier admin
router.get('/create-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    // if (adminExists) return res.status(403).json({ message: 'Un admin existe déjà' });

    const { nom, prenom, email, password, telephone } = req.body;
    const user = await User.create({
      nom: nom || 'Admin',
      prenom: prenom || 'Gérer',
      email: email || 'zos@gmail.com',
      password: 'zmzzmzzmz',
      role: 'admin',
      telephone: telephone || '',
    });

    res.status(201).json({
      message: 'Admin créé avec succès',
      user,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/seed/users - Enregistrer données fictives
router.post('/seed/users', protect, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') return res.status(403).json({ message: 'Accès refusé' });

    // Supprimer les anciens utilisateurs (sauf admin)
    await User.deleteMany({ role: { $ne: 'admin' } });

    const fakeUsers = [
      {
        nom: 'Martin', prenom: 'Sophie', email: 'sophie.martin@email.com',
        password: 'password123', role: 'parent', telephone: '+33612345678'
      },
      {
        nom: 'Dupont', prenom: 'Jean', email: 'jean.dupont@email.com',
        password: 'password123', role: 'parent', telephone: '+33687654321'
      },
      {
        nom: 'Durand', prenom: 'Marie', email: 'marie.durand@email.com',
        password: 'password123', role: 'parent', telephone: '+33699887766'
      },
      {
        nom: 'Bernard', prenom: 'Pierre', email: 'pierre.bernard@email.com',
        password: 'password123', role: 'parent', telephone: '+33655443322'
      },
      {
        nom: 'Thomas', prenom: 'Isabelle', email: 'isabelle.thomas@email.com',
        password: 'password123', role: 'parent', telephone: '+33644332211'
      },
    ];

    const created = await User.insertMany(fakeUsers);
    res.status(201).json({
      message: `${created.length} utilisateurs fictifs créés`,
      count: created.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
