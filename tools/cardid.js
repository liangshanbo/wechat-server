const fs = require('fs');
const config = require('../config');
const fetch = require('node-fetch');

module.exports = async function searchCardID(code) {
  const source = `${__dirname}/resources/cardID/${code}.json`;
  if (fs.existsSync(source)) {
    const res = fs.readFileSync(source, { encoding: 'utf8' });
    return res;
  } else {
      const res = await fetch(`http://idquery.market.alicloudapi.com/idcard/query?number=${code}`, {
        headers: { 'Authorization': `APPCODE ${config.appCode}` },
      }).then(res => res.json());
      fs.writeFileSync(source, JSON.stringify(res), { encoding: 'utf8' });
      return res;
  }
}