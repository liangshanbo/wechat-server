const fs = require('fs');
const config = require('../config');
const fetch = require('node-fetch');

module.exports = async function searchCad({ type, id = ''}) {
  const source = `${__dirname}/resources/cars/${type}_${id}.json`;
  if (fs.existsSync(source)) {
    const res = fs.readFileSync(source, { encoding: 'utf8' });
    return res;
  } else {
      const res = await fetch(`https://jisucxdq.market.alicloudapi.com/car/${type}?parentid=${id}&carid=${id}`, {
        headers: { 'Authorization': `APPCODE ${config.appCode}` },
      }).then(res => res.json());
      fs.writeFileSync(source, JSON.stringify(res), { encoding: 'utf8' });
      return res;
  }
}