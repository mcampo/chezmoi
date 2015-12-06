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
    var airControlDevice = devices.findOne(device => device.name === 'air-control');
    if (airControlDevice) {
        context.device = airControlDevice;
        context.subTitle = 'Online - seen ' + moment.utc(airControlDevice.lastSeen).fromNow();
    }
    res.render('ac', context);
});

router.get('/thermometer', function (req, res, next) {
    var context = {
        title: 'Thermometer',
        subTitle: 'Offline'
    };
    var thermometerDevice = devices.findOne(device => device.name === 'thermometer');
    if (thermometerDevice) {
        context.device = thermometerDevice;
        context.subTitle = 'Online - seen ' + moment.utc(thermometerDevice.lastSeen).fromNow();
    }
    res.render('thermometer', context);
});

module.exports = router;
