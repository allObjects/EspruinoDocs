/* Copyright (c) 2016 Markus Muetschard, markus@muet.com and 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*
Module for connecting to the XPT2046 / ADS7843 resistive touchscreen controller.

The callback function has 3 arguments (x, y ans s(state). When you move your finger on the touchscreen the X and Y coordinates are reported back, and when you lift your finger, the callback function is called once with X and Y set to undefined.

```
SPI1.setup({sck:A5,miso:A6,mosi:A7});
require("ADS7843").connect(SPI1, A4, B6, 0, 0, 320, 240, function(x,y) {
  if (x!==undefined)
    LCD.fillRect(x-1,y-1,x+1,y+1);
});

exports.connect = function(spi, cs, irq, offsetx, offsety, width, height, callback) {
  spi.send([0x90,0],cs); // wake the controller up
  var watcher = function() { // look for a press
    var interval = setInterval(function () {
      if (!digitalRead(irq)) { // touch down
        var d = spi.send([0x90,0,0xD0,0,0],cs);
        callback(
          offsetx + (d[1]*256+d[2])*width/0x8000,
          offsety + (d[3]*256+d[4])*height/0x8000);
      } else {
        callback();
        clearInterval(interval);
        interval = undefined;
        setWatch(watcher, irq, { repeat : false, edge: "falling" });
      }
    }, 50);
  };
  setWatch(watcher, irq, { repeat : false, edge: "falling" });
};

```

*/

var exports = {};
exports.connect = function(spi, cs, irq, cb, calc, scan, _, u) { _ =
  { cb: cb
  , c: calc || function(xR, yR, _){ return [xR, yR, _]; }
  , p: scan || 50
  , l: u , w: u , s: u , d: u , x: 0 , y : 0 , t : 0
  , doer: function() {
      if (!irq.read()) { _.t = 2; // touch (down|scan/drag/move)
    	if (!_.s) { _.t = 1; _.w = u; _.s = setInterval(_.doer, _.p); } 
        var d = _.d = spi.send([0x90,0,0xD0,0,0], cs),
            r = _.c(d[1]*256+d[2], d[3]*256+d[4], _);
        _.x = r[0]; _.y = r[1]; if (_.l) { _.cb.apply(u,r); }
      } else { _.t = 0; // untouch
    	if (_.s) { clearInterval(_.s); _.s = u; if (_.l) { _.cb(u,u,_); } }
        if (_.l) { _.w = setWatch(_.doer, irq, {repeat:false, edge:"falling"}); }
    } }
  , listen: function(b) { if ((b = !!((b === u) || b)) && !_.l) {
      spi.send([0x90,0], cs); // wake controller up and begin watching
      _.w = setWatch(_.doer, irq, {repeat:false, edge:"falling"}); }
      _.l = b; return _; }
  }; return _;
};
