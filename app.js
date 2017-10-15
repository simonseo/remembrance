require('dotenv').config(); // load api keys from env into process.env

const Promise = require('bluebird');
const path = require('path');
const stylus = require('stylus');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));app.use(cookieParser());

app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

const index = require('./routes/index');
const models = require('./routes/models');
const train = require('./routes/train');
const predict = require('./routes/predict');
const concepts = require('./routes/concepts');

app.use('/', index);
app.use('/train', train);
app.use('/models', models);
app.use('/predict', predict);
app.use('/concepts', concepts);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Application started on port ${PORT}...`)
});
