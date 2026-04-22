const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { nom, email, telephone, sujet, message } = req.body;
    if (!nom || !email || !sujet || !message)
      return res.status(400).json({ message: 'Tous les champs requis sont manquants' });
    const contact = await Contact.create({ nom, email, telephone, sujet, message });
    res.status(201).json({ message: 'Message envoyé avec succès', id: contact._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/contact - Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const contacts = await Contact.find().sort('-createdAt');
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/contact/:id/statut - Admin
router.put('/:id/statut', protect, adminOnly, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id, { statut: req.body.statut }, { new: true }
    );
    res.json(contact);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/contact/seed/init - Enregistrer données fictives
router.post('/seed/init', protect, adminOnly, async (req, res) => {
  try {
    await Contact.deleteMany({});

    const fakeContacts = [
      {
        nom: 'Sophie Martin', email: 'sophie@email.com', telephone: '+33612345678',
        sujet: 'Informations sur les tarifs', message: 'Bonjour, j\'aimerais plus d\'infos sur vos modules et tarifs',
        statut: 'lu'
      },
      {
        nom: 'Jean Dupont', email: 'jean@email.com', telephone: '+33687654321',
        sujet: 'Inscription module Python', message: 'Je souhaite inscrire mon fils au module Python',
        statut: 'repondu'
      },
      {
        nom: 'Marie Durand', email: 'marie@email.com', telephone: '+33699887766',
        sujet: 'Question inscription', message: 'Quand peut-on commencer une inscription pour le prochain module ?',
        statut: 'nouveau'
      },
      {
        nom: 'Pierre Bernard', email: 'pierre@email.com', telephone: '+33655443322',
        sujet: 'Horaires des cours', message: 'Quels sont les horaires disponibles pour le module robotique ?',
        statut: 'nouveau'
      },
      {
        nom: 'Isabelle Thomas', email: 'isabelle@email.com', telephone: '+33644332211',
        sujet: 'Remboursement demandé', message: 'Mon fils ne peut pas continuer, je souhaite un remboursement',
        statut: 'lu'
      },
    ];

    const created = await Contact.insertMany(fakeContacts);
    res.status(201).json({
      message: `${created.length} messages fictifs créés`,
      count: created.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
