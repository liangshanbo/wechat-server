const crypto = require('crypto');

module.exports = {
  hash: (key) => {
    const md5 = crypto.createHash('md5');
    return md5.update(key).digest('hex');
  }
};

// console.log(md5.digest('hex'));
