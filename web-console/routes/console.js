var express = require('express');
var router = express.Router();
var debug = require('debug')('web-console:app');
var hubs = require('../store').hubs;
var devices = require('../store').devices;
var moment = require('moment');

router.get('/status', function (req, res, next) {
    var context = {
        title: 'Status',
        hubs: hubs.all(),
        devices: devices.all()
    };
    res.render('status', context);
});

router.get('/ac', function (req, res, next) {
    var context = {
        title: 'Air Control',
        subTitle: 'Offline'
    };
    var allDevices = devices.all();
    if (allDevices.length > 0) {
        context.device = allDevices[0];
        context.subTitle = 'Online - seen ' + moment.utc(allDevices[0].lastSeen).fromNow();
    }
    res.render('ac', context);
});

module.exports = router;
