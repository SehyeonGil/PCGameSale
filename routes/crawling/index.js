const express = require('express');
const controls = require('./controller');
const router = express.Router();

/* GET home page. */
router.get('/', controls.getSteamTest);

module.exports = router;
