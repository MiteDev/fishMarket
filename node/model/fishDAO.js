const db = require('../config/db_conn');
// const db2 = require('../config/fish_conn');

const uploadFish = (parameters) => {
    return new Promise((resolve, reject) => {
        console.log(parameters)
        db.query(`INSERT INTO image SET ?`, parameters, (err, result) => {
            if(err) reject(err);
            else resolve(result)
        })
    })
}

// const uploadFish2 = (parameters) => {
//     return new Promise((resolve, reject) => {
//         console.log(parameters);
//         db2.query(`INSERT INTO Land SET ?`, parameters, (err, result) => {
//             if(err) reject(err);
//             else resolve(result)
//         })
//     })
// }

const downloadImage = (parameters) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT image_name FROM image WHERE fish_num = ?`, [parameters.fish_num], (err, db_data) => {
            if(err) reject(err);
            else resolve(db_data);
        })
    })
}

const getMarketNum = (parameters) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT market_name FROM marketTable WHERE market_num = ?`, parameters.market, (err, db_data) => {
            if(err) {
                reject(err);
            } else {
                resolve(db_data);
            }
        })
    })
}

const getFishData = (parameters) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM image WHERE (date BETWEEN ? AND ?) AND market_name LIKE ? ORDER BY fish_num DESC LIMIT ?,?`, [parameters.start_date, parameters.end_date, `%${parameters.market}%`, parameters.offset, parameters.limit], (err, db_data) => {
            if(err) reject(err);
            else {
                resolve(db_data);
            }
        })
    })
}

const downloadFish = (parameters) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT * FROM image WHERE (date BETWEEN ? AND ?) AND market_name LIKE ? ORDER BY fish_num DESC`, [parameters.start_date, parameters.end_date, `%${parameters.market}%`], (err, db_data) => {
            if(err) reject(err);
            else resolve(db_data);
        })
    })
}

//SELECT COUNT(CASE WHEN date LIKE ? && market LIKE ? THEN fish_num END) AS COUNT FROM image
const page_count = (parameters) => {
    return new Promise((resolve, reject) => {
        db.query(`SELECT COUNT(CASE WHEN (date BETWEEN ? AND ?) && market_name LIKE ? THEN fish_num END) AS COUNT FROM image`, [parameters.start_date, parameters.end_date, `%${parameters.market}%`], (err, db_data) => {
            if(err) {
                reject(err);
            } else {
                resolve(db_data);
            }
        })
    })
}

module.exports = {
    uploadFish,
    getFishData,
    page_count,
    downloadFish,
    downloadImage,
    getMarketNum,
    // uploadFish2
}