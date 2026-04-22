require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

// Enregistrer tous les modèles avant toute utilisation
require('./models');

const app = express();

// Connexion DB
connectDB();

// Middlewares
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://geekcoding4kids.com'
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Servir les fichiers statiques (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/modules', require('./routes/modules'));
app.use('/api/inscriptions', require('./routes/inscriptions'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/enfant', require('./routes/enfant').router);
app.use('/api/cours', require('./routes/cours'));
app.use('/api/lecons', require('./routes/lecons'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/payments', require('./routes/payment'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GeekCoding4Kids API opérationnelle 🚀' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur GeekCoding4Kids démarré sur le port ${PORT}`);
});
