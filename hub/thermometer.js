var util = require('util');
var EventEmitter = require('events').EventEmitter;
var five = require("johnny-five");

function Thermometer(path) {
    var self = this;
    self.path = path;
    self.board = null;
}
util.inherits(Thermometer, EventEmitter);


Thermometer.prototype.connect = function (callback) {
    var self = this;
    self.sensorData = [];
    self.board = new five.Board({
        port: self.path,
        repl: false
    });

    self.board.on("ready", function() {
        var thermometer = new five.Thermometer({
            controller: "LM35",
            pin: "A0",
            freq: 5000
        });
        thermometer.on("data", function() {
            self.sensorData.push(this.celsius);
        });

        setInterval(self.reportData.bind(self), 60000);

        callback(null);

        //var pin = new five.Pin('A0');
        //var timer;
        //function query () {
        //    timer = setTimeout(onTimeoutExpired, 3000);
        //    pin.query(function (state) {
        //        clearTimeout(timer);
        //        console.log("value: " + state.value, "report: " + state.report);
        //        setTimeout(query, 1000);
        //    });
        //}
        //query();
        //
        //function onTimeoutExpired () {
        //    board.emit("error", "cannot query pin value");
        //}
    });

};

Thermometer.prototype.isConnected = function () {
    var self = this;
    return self.board && self.board.isReady;
};

Thermometer.prototype.sendData = function () {
    //do nothing
};

Thermometer.prototype.reportData = function () {
    var self = this;
    var average = 0;
    if (self.sensorData.length > 0) {
        average = self.sensorData.reduce((previous, current) => previous + current) / self.sensorData.length;
    }
    self.emit("data", average);
    self.sensorData = [];
};

module.exports = Thermometer;