const pinyin = require('pinyin');
const cheerio = require('cheerio');
const fetch = require('node-fetch');

const format = function(text = '') {
    return text.replace(/\n/g, ' ').replace(/。.*/, '').slice(6);
}

module.exports = {
    getDetail: async function(name, id) {
        const res = await fetch(`http://lvyou.baidu.com/${name}?request_id=${id}`).then(res => res.text());
        const jq = cheerio.load(res);
        const dcnt = jq('.main-dcnt').text();
        const list = jq('#J_pic-slider img') || [];
        const texts = jq('.main-intro .main-besttime').text().slice(1, -2).split('\n\n\n');
        const images = [];
        const length = list.length;
        for (let i = 0; i < length; i++) {
            images.push(list[i].attribs.src);
        }
        return {
            images,
            dcnt: format(dcnt),
            type: format(texts[1]),
            season: format(texts[2]),
        };
    },
    getList: function(surl = '北京', pn = 1) {
        const address = pinyin('北京', {
            style: pinyin.STYLE_NORMAL,
        }).reduce((prev, current) => prev.concat(current), '');
        return fetch(`http://lvyou.baidu.com/destination/ajax/jingdian?format=ajax&surl=${address}&pn=${pn}&rn=18`).then(res => res.json());
    }
}