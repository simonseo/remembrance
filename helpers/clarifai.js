const Clarifai = require('clarifai');
const constants = require('./constants');

let client;

class Client {
  static getInstance() {
    if (!client) {
      client = new Clarifai.App({ apiKey: constants.clarifai.apiKey });
    }

    return client;
  }
}

module.exports = Client.getInstance();
