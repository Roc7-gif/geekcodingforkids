const express = require('express');
const router = express.Router();
const { FedaPay, Transaction } = require('fedapay');
const Inscription = require('../models/Inscription');
const Enfant = require('../models/Enfant');
const { protect } = require('../middleware/auth');
const { generateChildCredentials } = require('./inscriptions');

// Configuration FedaPay
const configureFedaPay = () => {
  FedaPay.setApiKey(process.env.FEDAPAY_SECRET_KEY);
  FedaPay.setEnvironment('sandbox'); // Toujours en sandbox pour ce projet
};

// POST /api/payments/create-link/:inscriptionId
// Créer un lien de paiement pour une inscription spécifique
router.post('/create-link/:inscriptionId', protect, async (req, res) => {
  try {
    const inscription = await Inscription.findById(req.params.inscriptionId)
      .populate('module')
      .populate('parent');

    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée' });
    }

    // Vérifier que c'est bien l'inscription du parent connecté
    if (inscription.parent._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    configureFedaPay();

    const transaction = await Transaction.create({
      description: `Paiement Module: ${inscription.module.titre} - Enfant: ${inscription.enfant.prenom}`,
      amount: inscription.montantTotal,
      currency: { iso: 'XOF' },
      callback_url: `${process.env.FRONTEND_URL}/payment-callback`,
      customer: {
        firstname: req.user.prenom,
        lastname: req.user.nom,
        email: req.user.email,
        phone_number: {
          number: req.user.telephone || '00000000',
          country: 'BJ'
        }
      }
    });

    const token = await transaction.generateToken();

    // Sauvegarder l'ID de transaction dans l'inscription
    inscription.fedaTransactionId = transaction.id;
    await inscription.save();

    res.json({ url: token.url });
  } catch (err) {
    console.error('FedaPay Error:', err);
    res.status(500).json({ message: 'Erreur lors de la création du paiement' });
  }
});

// GET /api/payments/verify/:transactionId
// Vérifier le statut d'un paiement
router.get('/verify/:transactionId', protect, async (req, res) => {
  try {
    configureFedaPay();

    const transaction = await Transaction.retrieve(req.params.transactionId);
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction non trouvée' });
    }

    const inscription = await Inscription.findOne({ fedaTransactionId: req.params.transactionId });
    if (!inscription) {
      return res.status(404).json({ message: 'Inscription non trouvée pour cette transaction' });
    }

    if (transaction.status === 'approved') {
      const oldStatut = inscription.statut;
      inscription.statut = 'paye';

      // Logique de création de compte enfant (identique à inscriptions.js)
      let enfant = await Enfant.findOne({ inscription: inscription._id });
      let credentials = null;

      if (!enfant) {
        const { username, password } = generateChildCredentials(inscription.enfant.prenom, inscription.enfant.nom);

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

        credentials = { username, password };
      }

      await inscription.save();

      return res.json({
        success: true,
        message: 'Paiement approuvé',
        inscription,
        enfantCredentials: credentials
      });
    } else {
      return res.json({
        success: false,
        message: `Statut du paiement: ${transaction.status}`,
        status: transaction.status
      });
    }
  } catch (err) {
    console.error('Verify Error:', err);
    res.status(500).json({ message: 'Erreur lors de la vérification' });
  }
});
// generateChildCredentials
module.exports = router;
