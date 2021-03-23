const axios = require('axios');
const dotenv = require('dotenv');

const result = dotenv.config();
if (result.error) {
  console.log(result.error.message);
  process.exit(1);
}
const apiKey = process.env.apiKey;

const Weather = {

    getWeather: async function(lat,long) {
    const weatherRequest = `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${apiKey}`
    try{
        const response = await axios.get(weatherRequest)
        if (response.status == 200) {
          weather = response.data
        }
      }
      catch(err){
        console.log(err);
      }
      console.log(weather);
    }
}

module.exports = Weather;