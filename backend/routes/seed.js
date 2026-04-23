const express = require('express');
const router = express.Router();
const Module = require('../models/Module');
const Cours = require('../models/Cours');
const Lecon = require('../models/Lecon');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/seed/curriculum - Pour générer des cours et leçons fictifs
router.get('/curriculum', protect, adminOnly, async (req, res) => {
  try {
    // 1. Récupérer les modules existants
    const modules = await Module.find();
    if (modules.length === 0) {
      return res.status(400).json({ message: 'Aucun module trouvé. Veuillez créer des modules d\'abord.' });
    }

    // 2. Nettoyer les anciens cours et leçons (Optionnel, mais plus propre pour le seed)
    await Lecon.deleteMany({});
    await Cours.deleteMany({});

    let totalCours = 0;
    let totalLecons = 0;

    // 3. Générer des données pour chaque module
    for (const module of modules) {
      const coursData = [
        {
          module: module._id,
          titre: `Introduction à ${module.titre}`,
          description: `Les fondamentaux du module ${module.numero}. Découverte de l'environnement et des outils.`,
          ordre: 1
        },
        {
          module: module._id,
          titre: "Concepts Avancés et Logique",
          description: "Approfondissement des structures de contrôle et de la logique de programmation.",
          ordre: 2
        },
        {
          module: module._id,
          titre: "Mini-Projet Créatif",
          description: "Mise en pratique des connaissances pour réaliser une application ou un robot simple.",
          ordre: 3
        }
      ];

      const createdCours = await Cours.insertMany(coursData);
      totalCours += createdCours.length;

      // 4. Générer des leçons pour chaque cours créé
      for (const cours of createdCours) {
        const leconData = [
          {
            cours: cours._id,
            titre: `Leçon 1: Bienvenue dans ${cours.titre}`,
            description: "Découverte des objectifs et premier exercice pratique.",
            type: "pratique",
            ordre: 1,
            dureeMinutes: 45,
            contenu: {
              texte: `<p>Bienvenue dans cette première leçon sur <strong>${cours.titre}</strong> !</p><p>Aujourd'hui, nous allons apprendre à configurer notre environnement de travail.</p><h3>Objectifs :</h3><ul><li>Comprendre le fonctionnement du module</li><li>Lancer notre premier programme</li><li>S'amuser !</li></ul>`,
              videos: [{ titre: "Introduction Vidéo", url: "https://www.youtube.com/embed/dQw4w9WgXcQ" }]
            },
            pieceJointes: [{ nom: "Guide d'installation.pdf", url: "https://example.com/guide.pdf", type: "pdf" }]
          },
          {
            cours: cours._id,
            titre: `Leçon 2: Exploration et Expérimentation`,
            description: "Manipulation des variables et structures de base.",
            type: "pratique",
            ordre: 2,
            dureeMinutes: 60,
            contenu: {
              texte: "<p>Dans cette leçon, nous allons explorer les concepts de base en profondeur. Préparez-vous à coder !</p>",
              audios: [{ titre: "Explication Audio", url: "https://example.com/audio.mp3" }]
            }
          },
          {
            cours: cours._id,
            titre: "Session de Questions-Réponses",
            description: "Échange en direct avec le formateur pour valider les acquis.",
            type: "presentielle",
            ordre: 3,
            dureeMinutes: 90,
            contenu: {
              texte: "<p>Cette session se déroulera en direct. Préparez vos questions sur les leçons précédentes.</p>"
            }
          }
        ];

        const createdLecons = await Lecon.insertMany(leconData);
        totalLecons += createdLecons.length;
      }
    }

    res.status(201).json({
      message: 'Seed du curriculum réussi !',
      counts: {
        modules: modules.length,
        cours: totalCours,
        lecons: totalLecons
      }
    });

  } catch (err) {
    console.error('Seed Error:', err);
    res.status(500).json({ message: 'Erreur lors du seed', error: err.message });
  }
});

module.exports = router;
