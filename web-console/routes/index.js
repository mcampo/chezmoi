var express = require('express');
var router = express.Router();
var debug = require('debug')('web-console:app');
var devices = require('../store').devices;

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
    device.socket.emit('command', { command: command });

    res.end();
});

module.exports = router;
