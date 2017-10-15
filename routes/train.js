const express = require('express');
const router = express.Router();
const clarifai = require('../models/clarifai');

router.post('/base64/:concept', (req, res) => {
  const concept = req.params.concept;
  const details = req.body.details;
  const payload = req.body.base64;
  const imageBlob = payload.split(',')[1];

  clarifai.createConcept(concept, details)
    .then(() => clarifai.mergeConceptWithModel(concept))
    .then(() => clarifai.trainInput(concept, imageBlob))
    .then(() => clarifai.trainModel())
    .then(() => res.status(200).json({ concept }))
    .catch(console.error);
});

module.exports = router;
