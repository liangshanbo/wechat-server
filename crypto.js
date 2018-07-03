const crypto = require('crypto');

const md5 = crypto.createHash('md5');
console.log(md5.update('/pages/video/list/index').digest('hex'));

// console.log(md5.digest('hex'));
