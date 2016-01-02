var os = require('os');
var io = require('socket.io-client');
var debug = require('debug')('mock-hub');

debug('Starting mock hub');

var socket = io('http://localhost:3000/');

var heartbeatId = undefined;
function heartbeat() {
    socket.emit('heartbeat');
}

socket.on('connect', function () {
    debug('Connected to dev server');

    socket.emit('who', {name: os.hostname()});

    socket.emit('device-register', {name: 'air-control'});
    socket.emit('device-register', {name: 'thermometer'});

    heartbeatId = setInterval(heartbeat, 60000);
});

socket.on('disconnect', function () {
    debug('Disconnected from dev server');
    if (heartbeatId) {
        clearInterval(heartbeatId);
    };
});

socket.on('command', function (data) {
    debug('Received command from cloud server', data);
});

debug('Mock hub ready');