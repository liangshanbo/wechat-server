const fs = require('fs');
const Koa = require('koa');
const crypto = require('crypto');
const cheerio = require('cheerio');
const cp = require('child_process');
const fetch = require('node-fetch');
const Router = require('koa-router');
const FormData = require('form-data');
const rp = require('request-promise');
const multer = require('koa-multer');
const bodyParser = require('koa-bodyparser');
const WXBizDataCrypt = require('./WXBizDataCrypt');
const config = require('./config');
const getMovie = require('./tools/movie');
const JingDian = require('./tools/scene');
const checkMobile = require('./tools/mobile');
const getWeather = require('./tools/weather');

let access_token = '';
const app = new Koa();
const router = new Router();
const upload = multer({ dest: './uploads/' });

// openid and session_key
router.post('/api/openid', async (ctx, next) => {
  const { code } = ctx.request.body;
  ctx.body = await rp(`${config.jscode2session}?appid=${config.appid}&secret=${config.secret}&js_code=${code}&grant_type=authorization_code`);
});

// decrypt
router.post('/api/decrypt', async (ctx, next) => {
    const { sessionKey, encryptedData, iv } = ctx.request.body;
    const pc  = new WXBizDataCrypt(config.appid, sessionKey);
    ctx.body = pc.decryptData(encryptedData, iv);
});

// video list
router.get('/api/video_list', async (ctx, next) => {
    const res = await fetch('http://tiyu.baidu.com/live/detail/5LiW55WM5p2vIzIwMTgtMDYtMjQj5b635Zu9dnPnkZ7lhbg%3D/tab/%E8%A7%86%E9%A2%91').then(res => res.text());
    const jq = cheerio.load(res);
    const images = jq('.wa-tiyu-video-small-item-play img');
    const links = jq('a.c-response-img-content');
    const durations = jq('.wa-tiyu-video-small-item-play span');
    const titles = jq('.wa-tiyu-video-small-item-info-font span');
    const fromAndDateTimes = jq('.wa-tiyu-video-small-item-info-msg');
    console.log(images);
    let list = [];
    const length = images.length;
    for (let i = 0; i < length; i++) {
        const duration =  durations[i];
        const item = {
	    url: links[i].attribs.href,
            img: images[i].attribs.src,
            title: titles[i].children[0].data,
            duration:  duration ? duration.children[0].data : '',
            fromAndDateTime: fromAndDateTimes[i].children[2].children[0].data        
	}
        list.push(item);
    }
    console.log(list);
    ctx.body = list; 
});

// token
router.get('/api/token', async (ctx, next) => {
  const res = await fetch(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appid}&secret=${config.secret}`).then(res => res.json());
  access_token = res.access_token;
  console.log(access_token);
  ctx.body = res;
});

// check image
router.post('/api/check_image', upload.single('media'), async (ctx, next) => {
  const path = ctx.req.file.path;  
  const res = cp.execSync(`curl -F media=@/home/appServer/${path} 'https://api.weixin.qq.com/wxa/img_sec_check?access_token='${access_token}`);
  ctx.body = res;
})

// wxacode
router.post('/api/wxacode', async (ctx, next) => {
  const { path } = ctx.request.body;
  const md5 = crypto.createHash('md5');
  const img_name = `${ md5.update(path).digest('hex') }.jpg`;
  const img_path = `${__dirname}/images/download/${img_name}`;
  if (!fs.existsSync(img_path)) {
      console.log(img_path);
      const res = await fetch(`https://api.weixin.qq.com/wxa/getwxacode?access_token=${access_token}`, { method: 'POST', body: JSON.stringify({ path }) }).then(res => res.arrayBuffer());
      fs.writeFileSync(img_path, Buffer.from(res), "binary");
  }  
  ctx.body = `https://wx.html5shanbo.com/images/download/${img_name}`;
})

// 查询手机号
router.get('/api/check_mobile', async (ctx, next) => {
  const { phone } = ctx.query;
  const res = await checkMobile(phone);
  ctx.body = res;
});

//查询天气
router.get('/api/weather', async (ctx, next) => {
  const { path, city } = ctx.query;
  const res = await getWeather(path, city);
  ctx.body = res;
});

//查询电影
router.get('/api/movie', async (ctx, next) => {
  const { path, city } = ctx.query;
  const res = await getMovie(path, city);
  ctx.body = res;
});

//查询景点列表
router.get('/api/jingdian/list', async (ctx, next) => {
  const { surl, pn } = ctx.query;
  const res = await JingDian.getList(surl, pn);
  ctx.body = res;
});

//查询景点
router.get('/api/jingdian/detail', async (ctx, next) => {
  const { surl, id } = ctx.query;
  const res = await JingDian.getDetail(surl, id);
  ctx.body = res;
});

router.get('/MP_verify_2r9BMS949svb1tEN.txt', ctx => {
    const text =  fs.readFileSync('./MP_verify_2r9BMS949svb1tEN.txt', { encoding: 'utf8' });
    ctx.body = text;
});

router.get('/', ctx => {
  ctx.body = 'Hello Koa';
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

app.listen(10086);

