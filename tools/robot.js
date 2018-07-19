const fs = require('fs');
const config = require('../config');
const fetch = require('node-fetch');
const crypto = require('../crypto');

module.exports =  async function getAnswer(question) {
  const key = crypto.hash(question);
  const source = `${__dirname}/resources/robot/${key}.json`;
  if (fs.existsSync(source)) {
    const res = fs.readFileSync(source, { encoding: 'utf8' });
    return res;
  } else {
    const res = await fetch(`https://jisuznwd.market.alicloudapi.com/iqa/query?question=${encodeURI(question)}`, {
      headers: { 'Authorization': `APPCODE ${config.appCode}` },
    }).then(res => res.json());
    fs.writeFileSync(source, JSON.stringify(res), { encoding: 'utf8' });
    return res;
  }
}