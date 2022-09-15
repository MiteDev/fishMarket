const fishDAO = require('../model/fishDAO');
const axios = require('axios');
const dayjs = require('dayjs');
const fastcsv = require('fast-csv');
const fs = require('fs');

// const marketString = {
//     "부공동어시장": 1, "부산시수협 다대공판장": 2, "부산시수협 자갈치공판장": 3, "부산시수협 민락위판장": 4, "기장수협 대변위판장": 5, "기장수협 학리위판장": 6, "제 1,2구 잠수기 수협 부산위판장": 7, "부산국제수산물도매시장": 8, "수협중앙회 인천위판장": 9, "인천수협 연안위판장": 10,
//     "인천수협 소래위판장": 11, "옹진 수협 연안위판장": 12, "영흥수협 영흥위판장": 13, "경인북부수협 새우젓산지(와포리) 위판장": 14, "울산수협 울산수협공판장": 15, "울산수협 방어진 위판장": 16, "울산수협 강동위판장": 17, "경기남부수협 궁평리위판장": 18, "옹진수협 대부(방아머리) 위판장": 19, "옹진수협 대부도(탄도) 위판장": 20,
//     "속초시수협 청호항위판장": 21, "속초시수협 동명항위판장": 22, "강릉시수협 주문진항위판장": 23, "강릉시수협 사천진항위판장": 24, "동해시수협 묵호항위판장": 25, "삼척수협 삼척위판장": 26, "삼척수협 장호항위판장": 27, "원덕수협 임원항위판장": 28, "대포수협 대포항위판장": 29, "양양군수협 남애항위판장": 30, "양양군수협 동산항위판장": 31,
//     "양양군수협 기사문항위판장": 32, "양양군수협 물치위판장": 33, "강원 고성군수협 아야진항위판장": 34, "고성군수협 거진항위판장": 35, "고성군수협 대진항위판장": 36, "죽왕수협 가진항위판장": 37, "죽왕수협 공현진항위판장": 38, "죽왕수협 오호항위판장": 39, "죽왕수협 문암1리위판장": 40, "죽왕수협 문왕2리위판장": 41, "서산수협 안흥위판장": 42,
//     "서산수협 모항위판장": 43, "서산수협 채석포 위판장": 44, "태안남부수협 몽산포위판장": 45, "태안남부수협 마검포위판장": 46, "태안남부수협 드르니 위판장": 47, "태안남부수협 당암위판장": 48, "안면도수협 백사장위판장": 49, "안면도수협 영목위판장": 50, "대천서부수협 대천항위판장": 51, "서천서부수협 홍원위판장": 52, "서천서부수협 마량위판장": 53,
//     "보령수협 오천사업소위판장": 54, "보령수협 대천항 위판장": 55, "제 3,4구 잠수기수협 오천위판장": 56, "보령수협 무창포어촌계위판장": 57, "서천군수협 장항위판장": 58, "보령수협 삼길포항 위판장": 59, "군산시수협 해망동위판장": 60, "군산시수협 비흥항위판장": 61, "부안수협 격포위판장": 62, "군산시수협 선유도위판장": 63, "여수수협 군내위판장": 64,
//     "여수수협 국동위판장": 65, "목포수협 동부위판장": 66, "목포수협 서부위판장": 67, "제 3,4구 잠수기수협 국동위판장": 68, "완도금일수협 활선어위판장": 69, "고흥군수협 녹동위판장": 70, "나로도수협 나로도위판장": 71, "강진군수협 마량(활선어)위판장": 72, "신안군수협 송도위판장": 73, "신안군수협 흑산도 위판장": 74, "거문도수협 거문도 위판장": 75,
//     "영광군수협 법성위판장": 76, "진도군수협 서망위판장": 77, "장흥군수협 정남진위판장": 78, "후포수협 후포위판장": 79, "후포수협 구산위판장": 80, "후포수협 사동위판장": 81, "강구수협 강구위판장": 82, "구룡포수협 구룡포 위판장": 83, "구룡포수협 호미곶위판장": 84, "구룡포수협 장기위판장": 85, "포항수협 죽도위판장": 86, "포항수협 송도활어위판장": 87,
//     "죽변수협 죽변위판장": 88, "죽변수협 오산위판장": 89, "경주시수협 감포위판장": 90, "영덕북부수협 축산위판장": 91, "울릉군수협 저동위판장": 92, "울릉군수협 태하위판장": 93, "울릉군수협 천부위판장": 94, "울릉군수협 천부위판장": 95, "삼천포수협 삼천포(선어)위판장": 96, "거제수협 장승포위판장": 97, "거제수협 성포위판장": 98, "통영수협 통영위판장": 99,
//     "마산수협 마산위판장": 100, "제 1,2구 잠수기수협 거제위판장": 101, "제 1,2구 잠수기수협 남해위판장": 102, "제 1,2구 잠수기수협 통영위판장": 103, "제 1,2구 잠수기수협 마산위판장": 104, "멸치권현망수협 통영위판장": 105, "멸치권현말수협 마산위판장": 106, "남해군수협 미조(선어)위판장": 107, "진해시수협 속천위판장": 108, "의창수협 용원위판장": 109,
//     "의창수협 안골위판장": 110, "경남고성군수협 남포항(수남)위판장": 111, "사천수협 활어위판장": 112, "사량수협 사량위판장": 113, "하동군수협 노량위판장": 114, "제주시수협 제주위판장": 115, "한림수협 한림위판장": 116, "서귀포수협 수산물유통센터": 117, "서귀포수협 태흥(남원)위판장": 118, "성산포수협 성산포위판장": 119, "추자도수협 추자항위판장": 120, 
//     "모슬포수협 모슬포위판장": 121
// }

const condition = (parameters) => {
    const time = dayjs().format('YYYY-MM-DD');

    if (parameters.end_date === undefined || parameters.end_date === "") parameters.end_date = time;
    if (parameters.start_date === undefined || parameters.start_date === "") parameters.start_date = "2020-01-01";
    if (parameters.market === undefined || parameters.market == '/') {
        parameters.market = "";
    } else if (parameters.market === "") {

    } else {
        parameters.marketQuery = parameters.market;
        // parameters.market = marketString[parameters.market];
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

            // const marketKey = Object.keys(marketString);

            // marketKey.find(key => {
            //     if (marketString[key] == parameters.market) {
            //         parameters.market_name = key;
            //     }
            // })

            res.status(200).send({
                'data': parameters
            });
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

    // const parameters = {
    //     end_date: req.query.end_date,
    //     start_date: req.query.start_date,
    //     market: req.query.market,
    //     offset: result_paging.offset,
    //     limit: result_paging.limit
    // }

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

        // const marketKey = Object.keys(marketString);

        data.forEach((el) => {
            let day = dayjs(el.date);
            el.date = day.format('YYYY-MM-DD HH:mm:ss');
            // const market = parseInt(el.market);
            // marketKey.find(key => {
            //     if (marketString[key] === market) {
            //         el.market_name = marketKey[market - 1];
            //     }
            // })
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
        // const marketKey = Object.keys(marketString);
        const data = await fishDAO.downloadFish(parameters);
        data.forEach((el) => {
            let day = dayjs(el.date);
            el.date = day.format('YYYY-MM-DD');
            // const market = parseInt(el.market);
            // marketKey.find(key => {
            //     if (marketString[key] === market) {
            //         el.market_name = marketKey[market - 1];
            //     }
            // })
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