const express = require('express');
const router = express.Router();
const constants = require('../helpers/constants');
const clarifai = require('../models/clarifai');

router.post('/base64', (req, res) => {
  const base64 = req.body.base64;
  const imageBlob = base64.split(',')[1];
  const model = constants.clarifai.model;

  clarifai.predictConcept(model, imageBlob)
    .then((conceptDetails) => res.status(200).json(conceptDetails))
    .catch(console.error);
});

module.exports = router;
