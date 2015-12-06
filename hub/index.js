var os = require('os');
var io = require('socket.io-client');
var SerialDevice = require('serialdevice');
var debug = require('debug')('chezmoi');
var Thermometer = require('./thermometer.js');

debug('Starting hub');

var socket = io('http://www.chezmoi.io/');
var airControl = new SerialDevice('/dev/rfcomm0');
var thermometer = new Thermometer('/dev/rfcomm1');

var heartbeatId = undefined;
function heartbeat() {
    socket.emit('heartbeat');
}

socket.on('connect', function () {
    debug('Connected to cloud server');

    socket.emit('who', {name: os.hostname()});

    if (airControl.isConnected()) {
        socket.emit('device-register', {name: 'air-control'});
    }
    if (thermometer.isConnected()) {
        socket.emit('device-register', {name: 'thermometer'});
    }

    heartbeatId = setInterval(heartbeat, 60000);
});

socket.on('disconnect', function () {
    debug('Disconnected from cloud server');
    if (heartbeatId) {
        clearInterval(heartbeatId);
    };
});

socket.on('command', function (data) {
    debug('Received command from cloud server', data);

    if (data && data.command && airControl.isConnected()) {
        airControl.sendData(data.command);
    }
});

function connectAirControl () {
    airControl.connect(function (err) {
        if (err) {
            debug('Error during connection with air control, retrying in 30 seconds.');
            setTimeout(connectAirControl, 30000);
            return;
        }

        debug('Air control connected');
        socket.emit('device-register', {name: 'air-control'});
    });
}
airControl.on('disconnect', function () {
    socket.emit('device-unregister', {name: 'air-control'});
    debug('Air control disconnected, trying to reconnect in 30 seconds.');
    setTimeout(connectAirControl, 30000);
});
connectAirControl();

debug('Hub ready');

function connectThermometer () {
    thermometer.connect(function (err) {
        if (err) {
            debug('Error during connection with thermometer, retrying in 30 seconds.');
            setTimeout(connectThermometer, 30000);
            return;
        }

        debug('Thermometer connected');
        socket.emit('device-register', {name: 'thermometer'});
    });
}
thermometer.on('disconnect', function () {
    socket.emit('device-unregister', {name: 'thermometer'});
    debug('Thermometer disconnected, trying to reconnect in 30 seconds.');
    setTimeout(connectThermometer, 30000);
})
thermometer.on('data', function (data) {
    socket.emit('device-data', {device: 'thermometer', data: data.celsius});
});

connectThermometer();
