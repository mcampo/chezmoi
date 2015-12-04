var util = require('util');
var EventEmitter = require('events').EventEmitter;
var five = require("johnny-five");

function Thermometer(path) {
    var self = this;
    self.path = path;
}
util.inherits(Thermometer, EventEmitter);


Thermometer.prototype.connect = function (callback) {
    var self = this;
    self.board = new five.Board({
        port: self.path
    });

    self.board.on("ready", function() {
        var temperature = new five.Thermometer({
            controller: "LM35",
            pin: "A0",
            freq: 1000
        });
        temperature.on("data", function() {
            self.emit("data", this.celsius);
            console.log(this.celsius + "°C");
        });

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

};



