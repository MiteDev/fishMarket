const multer = require('multer');
const imgFilePath = "../files/img";

const fish_img = multer.diskStorage({
    destination(req, file, cb){
        // cb(null, '../../../../../data/fish_market/image');
        cb(null, imgFilePath)
    },
    filename(req, file, cb) {
        cb(null, `${file.originalname}`);
    }
});

const fishImg = multer({
    storage : fish_img,
    fileFilter : (req, file, cb) => {
        if(file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
            cb(null, true);
        } else {
            req.fileValidationError = "jpg,jpeg,png,gif,webp 파일만 업로드 가능합니다.";
            // cb({msg: '.png .jpg .jpeg 형식의 파일만 업로드 가능합니다.'}, false);
            cb(null, false);
        }
    }
});

module.exports = {
    fishImg
}