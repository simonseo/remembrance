const express = require('express');
const router = express.Router();
const clarifai = require('../models/clarifai');

router.get('/', (req, res) => {
  clarifai.getModels()
    .then((models) => res.status(200).json({ models }))
    .catch(console.error);
});

router.put('/:id/train', (req, res) => {
  const modelId = req.params.id;

  clarifai.trainModel(modelId)
    .then(() => res.sendStatus(200))
    .catch(console.error);
});

module.exports = router;
