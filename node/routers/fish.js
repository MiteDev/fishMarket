const express = require('express');
const router = express.Router();
const upload = require('../config/multer');
const fishCtrl = require('../controller/fishCtrl');

router.post('/upload', upload.fishImg.single('images'), fishCtrl.upload_fish);
router.get('/', fishCtrl.get_fish_data);
router.get('/download', fishCtrl.download);
router.post('/imgDown', fishCtrl.download_image);

module.exports = router;