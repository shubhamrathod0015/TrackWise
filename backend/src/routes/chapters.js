//  # API endpoints


// routes/chapters.js
const router = require('express').Router();
const controller = require('../controllers/chapters');
const { isAdmin } = require('../middlewares/auth');
const cache = require('../middlewares/cache');
const rateLimit = require('../middlewares/rateLimit');
const upload = require('../utils/upload');

router.get('/', rateLimit, cache(3600), controller.getChapters);
router.get('/:id', rateLimit, controller.getChapterById);
router.post('/', isAdmin, upload, controller.uploadChapters);

module.exports = router;