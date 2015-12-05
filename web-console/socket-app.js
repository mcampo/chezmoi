var debug = require('debug')('web-console:socket');
var devices = require('./store').devices;
var hubs = require('./store').hubs;

function SocketApp(io) {
    console.log('listening connections');
    io.on('connection', function (socket) {
        debug('Socket connected %s', socket.id);
        var hub = {
            name: '< Unknown >',
            lastSeen: Date.now()
        };
        hubs.add(hub);
        attachHandlers(socket, hub);
    });

};

function attachHandlers(socket, hub) {
    socket.on('who', function (data) {
        debug('who: %s', JSON.stringify(data));
        hub.name = data.name;
    });
    socket.on('device-register', function (data) {
        debug('device connected: %s', JSON.stringify(data));

        if (!data || !data.name) {
            //TODO: ack con error
            return;
        }

        var device = {
            id: generateId(),
            name: data.name,
            hub: hub,
            socket: socket,
            lastSeen: Date.now()
        };
        devices.add(device);
    });

    socket.on('device-unregister', function (data) {
        debug('device disconnected: %s', JSON.stringify(data));

        if (!data || !data.name) {
            //TODO: ack with error
            return;
        }

        var devicesToRemove = devices.all().filter(function (device) {
            return device.name === data.name;
        });
        devicesToRemove.forEach(devices.remove);
    });

    socket.on('heartbeat', function () {
        debug('Heartbeat from socket %s', socket.id);
        var now = Date.now();
        hub.lastSeen = now;
        var devicesToUpdate = devices.all().filter(function (device) {
            return device.socket === socket;
        });
        devicesToUpdate.forEach(function (device) {
            device.lastSeen = now;
        });
    });

    socket.on('disconnect', function () {
        debug('Socket disconnected %s', socket.id);

        hubs.remove(hub);
        var devicesToRemove = devices.all().filter(function (device) {
            return device.socket === socket;
        });
        devicesToRemove.forEach(devices.remove);
    });
}

function generateId() {
    return (+new Date()).toString(36);
}

module.exports = SocketApp;