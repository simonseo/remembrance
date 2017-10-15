const clarifaiApiKey = process.env.CLARIFAI_API_KEY || '';
const clarifaiModelName = process.env.CLARIFAI_MODEL_NAME || '';

module.exports = {
  clarifai: {
    apiKey: clarifaiApiKey,
    model: clarifaiModelName,
  },
};
