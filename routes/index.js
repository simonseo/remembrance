var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index', { title: 'Remembrance' });
});

router.get('/new', function(req, res) {
  res.render('train', { title: 'Remembrance' });
});

module.exports = router;
