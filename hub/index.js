var os = require('os');
var io = require('socket.io-client');
var SerialDevice = require('serialdevice');
var logger = require('./logger').getLogger('hub');
var Thermometer = require('./thermometer.js');

logger.info('Starting hub');

var socket = io('http://home-control.herokuapp.com');
var airControl = new SerialDevice('/dev/rfcomm0');
var thermometer = new Thermometer('/dev/rfcomm1');

var heartbeatId = undefined;
function heartbeat() {
    socket.emit('heartbeat');
}

socket.on('connect', function () {
    logger.info('Connected to cloud server');

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
    logger.info('Disconnected from cloud server');
    if (heartbeatId) {
        clearInterval(heartbeatId);
    };
});

socket.on('command', function (data) {
    logger.info('Received command from cloud server', data);

    if (data && data.command && airControl.isConnected()) {
        airControl.sendData(data.command);
    }
});

function connectAirControl () {
    airControl.connect(function (err) {
        if (err) {
            logger.error('Error during connection with air control, retrying in 30 seconds.');
            setTimeout(connectAirControl, 30000);
            return;
        }

        logger.info('Air control connected');
        socket.emit('device-register', {name: 'air-control'});
    });
}
airControl.on('disconnect', function () {
    socket.emit('device-unregister', {name: 'air-control'});
    logger.info('Air control disconnected, trying to reconnect in 30 seconds.');
    setTimeout(connectAirControl, 30000);
});
connectAirControl();


function connectThermometer () {
    thermometer.connect(function (err) {
        if (err) {
            logger.error('Error during connection with thermometer, retrying in 30 seconds.');
            setTimeout(connectThermometer, 30000);
            return;
        }

        logger.info('Thermometer connected');
        socket.emit('device-register', {name: 'thermometer'});
    });
}
thermometer.on('disconnect', function () {
    socket.emit('device-unregister', {name: 'thermometer'});
    logger.info('Thermometer disconnected, trying to reconnect in 30 seconds.');
    setTimeout(connectThermometer, 30000);
});
connectThermometer();

logger.info('Hub ready');
