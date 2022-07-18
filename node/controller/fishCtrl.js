const fishDAO = require('../model/fishDAO');
const axios = require('axios');
const dayjs = require('dayjs');
const fastcsv = require('fast-csv');
const fs = require('fs');

const marketString = {
    "부산": 1, "감천": 2, "다대포": 3, "사천": 4, "마산": 5, "창원": 6, "목포": 7, "영광": 8, "거제": 9, "구룡포": 10,
    "강구": 11, "축산": 12, "경주": 13, "후포": 14, "죽변": 15, "속초": 16, "삼척": 17, "보령": 18, "인천": 19, "제주": 20,
    "서귀포": 21
}

const condition = (parameters) => {
    const time = dayjs().format('YYYY-MM-DD');

    if (parameters.end_date === undefined || parameters.end_date === "") parameters.end_date = time;
    if (parameters.start_date === undefined || parameters.start_date === "") parameters.start_date = "2020-01-01";
    if (parameters.market === undefined || parameters.market == '/') {
        parameters.market = "";
    } else if(parameters.market === "") {

    } else {
        parameters.marketQuery = parameters.market;
        parameters.market = marketString[parameters.market];
    }
}

const paging = (currentPage) => {
    const default_start_page = 1;
    const page_size = 10;
    if (currentPage < 1 || !currentPage) currnetPage = default_start_page;

    let result = {
        offset: (currentPage - 1) * page_size,
        limit: Number(page_size)
    }

    return result;
}

const upload_fish = async (req, res) => {
    try {
        //위판장id_날짜_시간_체장_체고
        const original_file_name = req.file.originalname;
        //flask에 파일 이름 전달
        const pytest = await axios.post('http://localhost:5000/', {
            content: original_file_name
        });

        //nodejs에서 flask로의 post요청에 대한 응답
        const result = pytest.data
        const name_split = result.img_rename.split(/_|[.]/); //정규식 활용해서 문자열 자르기

        const dateTime = name_split[1] + name_split[2];

        //파일명에 적힌 날짜와 시간을 sql의 datetime 형식에 맞게 변환
        let day = dayjs(dateTime);
        day = day.format('YYYY-MM-DD HH:mm:ss');

        //잘라진 문자열을 parameter객체에 알맞게 저장
        const parameters = {
            market: name_split[0],
            date: day,
            length: name_split[3],
            height: name_split[4],
            weight: result.weight,
            species: result.species,
            image_name: result.img_rename
        }

        fishDAO.uploadFish(parameters);

        const marketKey = Object.keys(marketString);

        marketKey.find(key => {
            if(marketString[key] == parameters.market) {
                parameters.market_name = key;
            }
        })

        res.status(200).send({
            'data': parameters
        });
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

const get_fish_data = async (req, res) => {
    if(req.query.page === undefined) {
        req.query.page = 1;
    }

    const result_paging = paging(req.query.page);
    
    const parameters = {
        end_date: req.query.end_date,
        start_date: req.query.start_date,
        market: req.query.market,
        offset: result_paging.offset,
        limit: result_paging.limit
    }

    await condition(parameters);

    try {
        parameters.end_date += ' 23:59:59';
        const data = await fishDAO.getFishData(parameters);
        const pageCnt = await fishDAO.page_count(parameters);

        let cnt = 0;
        if(pageCnt[0].COUNT % 10 === 0) {    
            cnt = parseInt(pageCnt[0].COUNT / 10);
        } else {
            cnt = parseInt(pageCnt[0].COUNT / 10)+1;
        }

        const marketKey = Object.keys(marketString);

        data.forEach((el) => {
            let day = dayjs(el.date);
            el.date = day.format('YYYY-MM-DD HH:mm:ss');
            const market = parseInt(el.market);
            marketKey.find(key => {
                if(marketString[key] === market) {
                    el.market_name = marketKey[market-1];
                }
            })
        })

        res.render('fish', { data: data, cnt: cnt, query: parameters, pageCnt: pageCnt[0].COUNT });
    } catch (err) {
        console.log(err);
        res.redirect('/?page=1');
    }
}

const download = async (req, res) => {
    const parameters = {
        end_date: req.query.end_date,
        start_date: req.query.start_date,
        market: req.query.market
    }

    await condition(parameters);

    const time = dayjs().format('YYYY-MM-DD');

    try {
        parameters.end_date += + ' 23:59:59'
        const marketKey = Object.keys(marketString);
        const data = await fishDAO.downloadFish(parameters);
        data.forEach((el) => {
            let day = dayjs(el.date);
            el.date = day.format('YYYY-MM-DD');
            const market = parseInt(el.market);
            marketKey.find(key => {
                if(marketString[key] === market) {
                    el.market_name = marketKey[market-1];
                }
            })
        })

        const ws = await fs.createWriteStream(__dirname + '/../public/csv/' + time + ".csv");
        console.log(ws.path)

        fastcsv.write(data, { headers: true })
            .on("finish", () => {
                console.log("write csv successfully");
            })
            .pipe(ws);

        setTimeout(() => {
            res.download(__dirname + '/../public/csv/' + time + '.csv')
        }, 500)
    } catch (err) {
        console.log(err);
        res.sendStatus(500)
    }
}

const download_image = async (req, res) => {
    const parameters = {
        fish_num: req.body.fish_num
    }
    const file_name = await fishDAO.downloadImage(parameters);
    
    res.download(__dirname + '/../../files/original/' + file_name[0].image_name);
}

module.exports = {
    upload_fish,
    get_fish_data,
    download,
    download_image
}