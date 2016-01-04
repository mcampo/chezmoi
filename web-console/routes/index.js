var express = require('express');
var router = express.Router();
var debug = require('debug')('web-console:app');
var passport = require('passport');
var devices = require('../store').devices;

router.get('/login', function (req, res, next) {
    var context = {
        title: 'Login'
    };
    res.render('login', context);
});

router.get('/auth/google',
    passport.authenticate('google', { scope: 'email' }));

router.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    function(req, res) {
        res.redirect('/console/status');
    }
);

router.post('/devices/:id/command', function (req, res, next) {
    var device = devices.get(req.params.id);
    if (!device) {
        res.sendStatus(404);
        return;
    }
    var command = req.body.command;
    if (!command) {
        res.sendStatus(400);
        return;
    }

    debug("Sending command for %s: %s", device.id, JSON.stringify(command));
    device.socket.emit('command', { name: device.name, command: command });

    res.end();
});

module.exports = router;
