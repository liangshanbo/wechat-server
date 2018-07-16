const config = require('../config');
const fetch = require('node-fetch');

module.exports = function checkMobile(phone) {
    return fetch(`https://jshmgsdmfb.market.alicloudapi.com/shouji/query?shouji=${phone}`, {
      headers: { 'Authorization': `APPCODE ${config.appCode}` },
    }).then(res => res.json());
}