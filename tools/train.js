const fs = require('fs');
const pinyin = require("pinyin");
const moment = require('moment');
const fetch = require('node-fetch');
const config = require('../config');
const crypto = require('../crypto');
const station_names = require('./resources/train/station_name');

const tody = moment().format('YYYY-MM-DD');

module.exports = {
    favorite_name: async function () {
        const source = `${__dirname}/resources/train/favorite.json`;
        if (fs.existsSync(source)) {
            const res = fs.readFileSync(source, { encoding: 'utf8' });
            return res;
        } else {
            const res = await fetch(`https://kyfw.12306.cn/otn/resources/js/framework/favorite_name.js`).then(res => res.text());    
            const stationMap = [];
            const stationList = res.slice(23, -3).split('@').slice(1);
            for (let i = 0; i < stationList.length; i++) {
                const names = stationList[i].split('|');
                stationMap.push({
                    key: names[2],
                    value: names[1],
                });
            }
            fs.writeFileSync(source, JSON.stringify(stationMap), { encoding: 'utf8' });
            return stationMap;
        }
    },
    station_name: async function ({ version = '1.9059' }) {
        const key = crypto.hash(version);
        const source = `${__dirname}/resources/train/${key}.json`;
        if (fs.existsSync(source)) {
            const res = fs.readFileSync(source, { encoding: 'utf8' });
            return res;
        } else {
            const res = await fetch(`https://kyfw.12306.cn/otn/resources/js/framework/station_name.js?station_version=${version}`).then(res => res.text());    
            const stationMap = {};
            const stationList = res.slice(20, -3).split('@').slice(1);
            for (let i = 0; i < stationList.length; i++) {
                const line = stationList[i];
                const names = line.split('|');
                const firstChar = line.charAt(0);
                if (firstChar in stationMap) {
                    stationMap[firstChar].push({
                        key: names[2],
                        value: names[1],
                    });
                } else {
                    stationMap[firstChar] = [{
                        key: names[2],
                        value: names[1],
                    }];
                }
            }
            fs.writeFileSync(source, JSON.stringify(stationMap), { encoding: 'utf8' });
            return stationMap;
        }
    },
    suggest: async function ({ code = '' }) {
        const key = crypto.hash(`${code}`);
        const source = `${__dirname}/resources/train/${key}`;
        if (fs.existsSync(source)) {
            const res = fs.readFileSync(source, { encoding: 'utf8' });
            return res;
        } else {
            if (code.length === 1) {
                return code in station_names ? station_names[code] : [];
            } else if (code.length > 1) {
                const firstChar = code[0];
                if (firstChar in station_names) {
                    return station_names[firstChar].filter(name => name.match(code));
                }
                return [];
            }
        }
    },
    search:  async function ({ from = 'BJP', to = 'SHH', date = tody }) {
        const res = await fetch(`https://kyfw.12306.cn/otn/leftTicket/query?leftTicketDTO.train_date=${date}&leftTicketDTO.from_station=${from}&leftTicketDTO.to_station=${to}&purpose_codes=ADULT`).then(res => res.json());  
        const { data: { map, result } } = res;
        const formatedRes = result.filter(line => {
           return !line.startsWith('|预订') && !line.startsWith('|列车停运');
        }).map(line => {
            const items = line.split('|');
            const len = items.length;
            return {
                no: items[3],
                from: map[items[4]],
                arrive: map[items[5]],
                startTime: items[8],
                arriveTime: items[9],
                duration: items[10],
                motorBerth: items[len - 4], // 动卧
                business: items[len - 5],
                firstClass: items[len - 6],
                secondClass: items[len - 7],
                hardSeat:  items[len - 8],
                hardBerth: items[len - 9],
                softSeat: items[len - 13],
                noneSeat:  items[len -11],
                softBerth: items[len -14], // 软卧
                highGrade:  items[len -16],// 高级软卧
                hasTicket: items[11] === 'Y' ? true : false,
            };
        });
        return formatedRes;
    },
};

