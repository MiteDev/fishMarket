const fishDAO = require('../model/fishDAO');
const axios = require('axios');
const dayjs = require('dayjs');
const fastcsv = require('fast-csv');
const fs = require('fs');

const condition = (parameters) => {
    const time = dayjs().format('YYYY-MM-DD');

    if (parameters.end_date === undefined || parameters.end_date === "") parameters.end_date = time;
    if (parameters.start_date === undefined || parameters.start_date === "") parameters.start_date = "2020-01-01";
    if (parameters.market === undefined || parameters.market == '/') {
        parameters.market = "";
    } else if (parameters.market === "") {

    } else {
        parameters.marketQuery = parameters.market;
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

        if (pytest.data.status === 0) {
            try {
                fs.unlinkSync(`../files/original/${original_file_name}`);
                console.log(original_file_name)
                res.status(200).send({'data': 'Not Found'});
            } catch (error) {
                if(error.code == 'ENOENT'){
                    res.status(500);
                    console.log("파일 삭제 Error 발생");
                }
            }
            
        } else {
            console.log(pytest.data)
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
                length: name_split[3] + '.' + name_split[4],
                height: name_split[5] + '.' + name_split[6],
                weight: result.weight,
                species: result.species,
                image_name: result.img_rename
            }

            const test = await fishDAO.getMarketNum(parameters);

            parameters.market_name = test[0].market_name;

            await fishDAO.uploadFish(parameters);

            res.status(200).send({
                'data': parameters
            })
        }
    } catch (err) {
        console.log(err);
        res.sendStatus(500);
    }
}

const get_fish_data = async (req, res) => {
    if (req.query.page === undefined) {
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

    let page_num = Math.max(1, parseInt(req.query.page));
    page_num = !isNaN(page_num)?page_num:1;

    await condition(parameters);

    try {
        parameters.end_date += ' 23:59:59';
        const data = await fishDAO.getFishData(parameters);
        const pageCnt = await fishDAO.page_count(parameters);

        let cnt = 0;
        if (pageCnt[0].COUNT % 10 === 0) {
            cnt = parseInt(pageCnt[0].COUNT / 10);
        } else {
            cnt = parseInt(pageCnt[0].COUNT / 10) + 1;
        }

        data.forEach((el) => {
            let day = dayjs(el.date);
            el.date = day.format('YYYY-MM-DD HH:mm:ss');
        })

        console.log(data.length);
        console.log(pageCnt)

        res.render('fish', { data: data, cnt: cnt, query: parameters, pageCnt: pageCnt[0].COUNT, pageNum: page_num, start_date: parameters.start_date, end_date: parameters.end_date });
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
        const data = await fishDAO.downloadFish(parameters);
        data.forEach((el) => {
            let day = dayjs(el.date);
            el.date = day.format('YYYY-MM-DD');
        })

        const ws = await fs.createWriteStream(__dirname + '/../public/csv/' + time + ".csv");
        console.log(ws.path)

        await fastcsv.write(data, { headers: true })
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