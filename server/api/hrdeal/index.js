'use strict';

var express = require('express');
var controller = require('./hrdeal.controller');

var router = express.Router();

router.get('/', controller.deal);
router.put('/', controller.updateDeal);

module.exports = router;