const client = require('../helpers/clarifai');
const constants = require('../helpers/constants');
const CONCEPT_LIST_UPDATE_INTERVAL = 3000;

let conceptsList = [];
const conceptMetadata = {};

function Clarifai() {
  getConcepts = (id) => {
    if (id) {
      return client.concepts.get(id);
    }

    return client.concepts.list({ perPage: 200 });
  };

  createConcept = (name, details) => {
    return new Promise((resolve, reject) => {
      conceptMetadata[name] = details;

      if (conceptsList.indexOf(name) >= 0) {
        return resolve(name);
      }

      return client.concepts.create({ id: name, name })
        .then(() => resolve(name))
        .catch(reject);
    });
  };

  trainInput = (concept, base64) => {
    let isFound = false;
    let value;
    let tmpObj;

    const concepts = [];

    conceptsList.forEach((currConcept) => {
      tmpObj = { id: currConcept, value: false };

      if (concept === currConcept) {
        tmpObj.value = true;
        isFound = true;
      }

      concepts.push(tmpObj);
    });

    if (!isFound) {
      concepts.push({ id: concept, value: true });
      conceptsList.push(concept);
    }

    return client.inputs.create({ base64, concepts });
  };

  mergeConceptWithModel = (concept) => {
    const model = constants.clarifai.model;
    const conceptsMutuallyExclusive = false;
    const closedEnvironment = false;
    const concepts = [ concept ];

    return client.models.update({
      id: model,
      name: model,
      conceptsMutuallyExclusive,
      closedEnvironment,
      concepts,
    });
  };

  predictConcept = (model, base64) => {
    return client.models.predict(model, { base64 })
      .then((predictions) => {
        const name = predictions.outputs[0].data.concepts[0].name || '';
        const details = conceptMetadata[name] || '';

        return { name, details };
      });
  };

  getModels = () => {
    return client.models.list({ perPage: 200 });
  };

  trainModel = () => {
    const modelId = constants.clarifai.model;

    return client.models.train(modelId);
  };

  return {
    getConcepts,
    createConcept,
    trainInput,
    mergeConceptWithModel,
    predictConcept,
    getModels,
    trainModel,
  };
};

const clarifaiClient = new Clarifai();

// cache aside pattern that fetches the newest concepts every 3 seconds
setInterval(() => {
  clarifaiClient.getConcepts()
    .then((newConceptsList) => {
      let list = [];

      newConceptsList.rawData.forEach((concept) => {
        list.push(concept.id);
      });

      list = [...new Set(list)];

      conceptsList = list;
    })
    .catch(console.error);
}, CONCEPT_LIST_UPDATE_INTERVAL);


module.exports = clarifaiClient;
