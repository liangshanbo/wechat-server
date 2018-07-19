const config = require('../config');
const fetch = require('node-fetch');

module.exports = function searchExpress(code) {
  return fetch(`https://wuliu.market.alicloudapi.com/kdi?no=${code}`, {
    headers: { 'Authorization': `APPCODE ${config.appCode}` },
  }).then(res => res.json());
}