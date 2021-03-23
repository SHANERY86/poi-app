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
//      console.log(weather);

      const report = {
        temp : Math.round(weather.main.temp - 273.15),
        feelsLike : Math.round(weather.main.feels_like -273.15),
        clouds : weather.weather[0].description,
        windSpeed: weather.wind.speed,
        humidity : weather.main.humidity
      }
      return report;
    }
}

module.exports = Weather;