const fetch = require('node-fetch');
const config = require('../config');

module.exports = function getWeather(path, city) {
    return fetch(`https://jisutqybmf.market.alicloudapi.com/weather/${path}?city=${encodeURI(city)}`, {
      headers: { 'Authorization': `APPCODE ${config.appCode}` },
    }).then(res => res.json());
}