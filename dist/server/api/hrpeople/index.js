'use strict';

var express = require('express');
var controller = require('./hrpeople.controller');

var router = express.Router();

router.get('/', controller.list);


module.exports = router;