const fishDAO = require("../model/fishDAO");
const axios = require("axios");
const dayjs = require("dayjs");
const fastcsv = require("fast-csv");
const fs = require("fs");

const imgFilePath = "../files/img/";
const csvFilePath = "../files/csv/";

const condition = (parameters) => {
  const time = dayjs().format("YYYY-MM-DD");

  if (parameters.end_date === undefined || parameters.end_date === "")
    parameters.end_date = time;
  if (parameters.start_date === undefined || parameters.start_date === "")
    parameters.start_date = "2020-01-01";
  if (parameters.market === undefined || parameters.market == "/") {
    parameters.market = "";
  } else if (parameters.market === "") {
  } else {
    parameters.marketQuery = parameters.market;
  }
};

const paging = (currentPage) => {
  const default_start_page = 1;
  const page_size = 10;
  if (currentPage < 1 || !currentPage) currnetPage = default_start_page;

  let result = {
    offset: (currentPage - 1) * page_size,
    limit: Number(page_size),
  };

  return result;
};

// #고등어
function calc_mackerel(length) {
  return Math.round(0.0044 * length ** 3.362 * 100) / 100;
}

// #전갱이
function calc_horse_mackerel(length) {
  return Math.round(0.0236 * length ** 2.8362 * 100) / 100;
}

// #갈치
function calc_cutlessfish(length) {
  return Math.round(0.0307 * length ** 2.7828 * 100) / 100;
}

// #조기
function calc_croaker(length) {
  return Math.round(0.0049 * length ** 3.2153 * 100) / 100;
}

// #오징어
function calc_squid(length) {
  return Math.round(0.0248 * length ** 2.9961 * 100) / 100;
}

// #삼치
function calc_spanish_mackerel(length) {
  return Math.round(6.577 * length ** 3.002 * 100) / 100;
}

// #참홍어
function calc_skate(length) {
  return Math.round(0.0063 * length ** 3.3992 * 100) / 100;
}

// #붉은대게
function calc_red_snow_crab(length) {
  return Math.round(0.0011 * length ** 2.79 * 100) / 100;
}

const calc_weight = {
  mackerel: calc_mackerel,
  horse_mackerel: calc_horse_mackerel,
  cutlessfish: calc_cutlessfish,
  croaker: calc_croaker,
  squid: calc_squid,
  spanish_mackerel: calc_spanish_mackerel,
  skate: calc_skate,
  red_snow_crab: calc_red_snow_crab,
};

const upload_fish = async (req, res) => {
  try {
    //위판장id_날짜_시간_체장_체고
    const content = {
      original_file_name: req.file.originalname,
      path: imgFilePath,
    };
    const split_arr = content.original_file_name.split(/[.]|_/);

    const split_data = {
      market: split_arr[0],
      date: split_arr[1],
      time: split_arr[2],
      length: [split_arr[3].slice(0, -1), ".", split_arr[3].slice(-1)].join(""),
      height: [split_arr[4].slice(0, -1), ".", split_arr[4].slice(-1)].join(""),
      camera_dist: split_arr[5],
      type: split_arr[6],
    };

    //flask에 파일 이름 전달
    const pytest = await axios.post("http://localhost:5000/", {
      content,
    });

    if (pytest.data.status === 0) {
      try {
        fs.unlinkSync(imgFilePath + content.original_file_name);
        res.status(200).send({ data: "Not Found" });
      } catch (error) {
        console.log(error);
        if (error.code == "ENOENT") {
          console.log("파일 삭제 Error 발생");
          res.status(500);
        }
      }
    } else {
      //nodejs에서 flask로의 post요청에 대한 응답
      const fish_list = {
        mackerel: "고등어",
        horse_mackerel: "전갱이",
        cutlessfish: "갈치",
        croaker: "조기",
        squid: "오징어",
        spanish_mackerel: "삼치",
        skate: "참홍어",
        red_snow_crab: "붉은대게",
      };
      split_data.species = fish_list[pytest.data.species];
      split_data.weight = calc_weight[pytest.data.species](
        Number(split_data.length)
      );
      split_data.dateTime = dayjs(split_data.date + split_data.time).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      // const insert_data = '_' + split_data.weight + '_' + split_data.species
      // const test = content.original_file_name
      //   .replace(/([.])/, `_${split_data.weight}$1`)
      //   .replace(/([.])/, `_${split_data.species}$1`);
      // console.log(test);

      split_data.image_name =
        split_data.market +
        "_" +
        split_data.date +
        "_" +
        split_data.time +
        "_" +
        split_data.length +
        "_" +
        split_data.height +
        "_" +
        split_data.camera_dist +
        "_" +
        split_data.weight +
        "_" +
        split_data.species +
        "." +
        split_data.type;

      fs.renameSync(
        imgFilePath + content.original_file_name,
        imgFilePath + split_data.image_name
      );

      split_data.date = split_data.dateTime;
      delete split_data.dateTime;
      delete split_data.time;
      delete split_data.camera_dist;
      delete split_data.type;

      const marketName = await fishDAO.getMarketNum(split_data);

      split_data.market_name = marketName[0].market_name;

      await fishDAO.uploadFish(split_data);

      // const aiobserver = {
      //     market_name : test[0].market_name,
      //     date: day,
      //     length: name_split[3] + '.' + name_split[4],
      //     height: name_split[5] + '.' + name_split[6],
      //     weight: result.weight,
      //     species: result.species,
      //     image_name: result.img_rename
      // }

      // await fishDAO.uploadFish2(aiobserver);

      res.status(200).send({
        data: split_data,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.sendStatus(500);
  }
};

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
    limit: result_paging.limit,
  };

  let page_num = Math.max(1, parseInt(req.query.page));
  page_num = !isNaN(page_num) ? page_num : 1;

  await condition(parameters);

  try {
    parameters.end_date += " 23:59:59";
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
      el.date = day.format("YYYY-MM-DD HH:mm:ss");
    });

    res.render("fish", {
      data: data,
      cnt: cnt,
      query: parameters,
      pageCnt: pageCnt[0].COUNT,
      pageNum: page_num,
      start_date: parameters.start_date,
      end_date: parameters.end_date,
    });
  } catch (err) {
    console.log(err);
    res.redirect("/?page=1");
  }
};

const download = async (req, res) => {
  const parameters = {
    end_date: req.query.end_date,
    start_date: req.query.start_date,
    market: req.query.market,
  };

  await condition(parameters);

  const time = dayjs().format("YYYY-MM-DD");

  try {
    parameters.end_date += +" 23:59:59";
    const data = await fishDAO.downloadFish(parameters);

    data.forEach((el) => {
      let day = dayjs(el.date);
      el.date = day.format("YYYY-MM-DD");
      console.log(el);
    });

    const ws = await fs.createWriteStream(csvFilePath + time + ".csv", {
      encoding: "utf16le",
    });
    console.log(ws.path);

    await fastcsv
      .write(data, { headers: true })
      .pipe(ws)
      .on("finish", () => {
        console.log(data);
        console.log("write csv successfully");
        res.download(csvFilePath + time + ".csv");
      });
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
};

const download_image = async (req, res) => {
  try {
    const parameters = {
      fish_num: req.body.fish_num,
    };
    const file_name = await fishDAO.downloadImage(parameters);

    res.download(imgFilePath + file_name[0].image_name);
  } catch (err) {
    console.log("Image Download Error" + err);
  }
};

module.exports = {
  upload_fish,
  get_fish_data,
  download,
  download_image,
};
