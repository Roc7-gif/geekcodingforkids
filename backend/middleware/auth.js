const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Enfant = require('../models/Enfant');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide' });
    }
  }
  if (!token) return res.status(401).json({ message: 'Non autorisé, token manquant' });
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  res.status(403).json({ message: 'Accès réservé aux administrateurs' });
};

// Middleware d'authentification enfant (partagé entre routes)
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

module.exports = { protect, adminOnly, protectEnfant };
