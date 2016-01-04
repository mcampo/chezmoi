var os = require('os');
var io = require('socket.io-client');
var SerialDevice = require('serialdevice');
var debug = require('debug')('chezmoi');
var Thermometer = require('./thermometer.js');

debug('Starting hub');

var socket = io('http://www.chezmoi.io/');
var airControl = new SerialDevice('/dev/rfcomm0');
var thermometer = new Thermometer('/dev/rfcomm1');

airControl.name = 'air-control';
thermometer.name = 'thermometer';
var devices = [airControl, thermometer];

var heartbeatId = undefined;
function heartbeat() {
    socket.emit('heartbeat');
}

socket.on('connect', function () {
    debug('Connected to cloud server');

    socket.emit('who', {name: os.hostname()});

    devices.forEach(device => {
        if (device.isConnected()) {
            socket.emit('device-register', { name: device.name })
        }
    });

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
    var device = devices.find(device => device.name === data.name);

    if (data && data.command && device && device.isConnected()) {
        device.sendData(data.command);
    }
});

function connectDevice (device) {
    device.connect(function (err) {
        if (err) {
            debug(`Error during connection with device ${device.name}, retrying in 30 seconds.`);
            setTimeout(connectDevice.bind(null, device), 30000);
            return;
        }

        debug(`${device.name} connected`);
        socket.emit('device-register', {name: device.name});
    });
}

devices.forEach(device => {
    device.on('disconnect', function () {
        socket.emit('device-unregister', {name: device.name});
        debug(`${device.name} disconnected, trying to reconnect in 30 seconds.`);
        setTimeout(connectDevice.bind(null, device), 30000);
    });

    device.on('data', function (data) {
        socket.emit('device-data', {device: device.name, data: data});
    });

    connectDevice(device);
});

debug('Hub ready');