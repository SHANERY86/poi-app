const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}

const apiKey = process.env.apiKey;

const Weather = {
    getWeather: {

    }
}