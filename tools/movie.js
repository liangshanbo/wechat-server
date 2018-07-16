const fs = require('fs');
const moment = require('moment');
const fetch = require('node-fetch');
const config = require('../config');
const crypto = require('../crypto');

module.exports = async function getMovie(path, city = '北京') {
    const today = moment().format("YYYY-MM-DD");
    const key = crypto.hash(`${today}_${path}_${city}`);
    const source = `${__dirname}/resources/movie/${key}`;
    if (fs.existsSync(source)) {
        const res = fs.readFileSync(source, { encoding: 'utf8' });
        return res;
    } else {
        const res = await fetch(`${config.movie}/${path}?city=${encodeURI(city)}`).then(res => res.json());
        fs.writeFile(source, JSON.stringify(res), { encoding: 'utf8' });
        return res;
    }
}