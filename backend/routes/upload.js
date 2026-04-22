const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect, adminOnly } = require('../middleware/auth');

// Route POST /api/upload
// accessible uniquement par les admins
router.post('/', protect, adminOnly, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Aucun fichier envoyé' });
  }

  // Retourner l'URL du fichier
  const fileUrl = `${req.protocol}://${req.get('host')}/${req.file.path}`;

  res.json({
    message: 'Fichier uploadé avec succès',
    url: fileUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size
  });
});

module.exports = router;
