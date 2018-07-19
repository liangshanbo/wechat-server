const fs = require('fs');
const config = require('../config');
const fetch = require('node-fetch');

module.exports =  async function checkMobile(phone) {
  const source = `${__dirname}/resources/cardID/${phone}.json`;
  if (fs.existsSync(source)) {
    const res = fs.readFileSync(source, { encoding: 'utf8' });
    return res;
  } else {
    const res = await fetch(`https://jshmgsdmfb.market.alicloudapi.com/shouji/query?shouji=${phone}`, {
      headers: { 'Authorization': `APPCODE ${config.appCode}` },
    }).then(res => res.json());
    fs.writeFileSync(source, JSON.stringify(res), { encoding: 'utf8' });
    return res;
  }
}