const express = require('express');
const router = express.Router();
const clarifai = require('../models/clarifai');

router.get('/', (req, res) => {
  clarifai.getConcepts()
    .then((concepts) => res.status(200).json({ concepts }))
    .catch(console.error);
});

router.get('/:id', (req, res) => {
  const id = req.params.id;

  clarifai.getConcepts(id)
    .then((concepts) => res.status(200).json({ concepts }))
    .catch(console.error);
});

router.post('/:id', (req, res) => {
  const name = req.params.id;

  clarifai.createConcept(name)
    .then((concept) => res.sendStatus(201))
    .catch(console.error);
});

module.exports = router;
