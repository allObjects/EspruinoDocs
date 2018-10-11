/* Copyright (c) 2016 Markus Muetschard, markus@muet.com and 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*

----- XPT2046 ------------------------- 77 vars, 85 with calibrated calculation.

Module for connecting to the XPT2046 / ADS7843 / ... resistive touchscreen controllers. 

The XPT2046 is pin and function compatible to ADS7843 touch screen controller.

The callback function has four arguments (X, Y, readData and module). When you
move your finger on the touchscreen the X and Y coordinates are reported back,
and when you lift your finger, the callback function is called once with X and
Y and readData set to undefined.

Connect expects a calculation function that converts raw x and raw y to x and
y. Calculation formula is rawValue / rawValuePerPixel + offset for x and y.
Calculation arguments are rawX, rawY, readData and module. Calculation returns
x, y, readData and module.


Usage

Portrait format:

```
SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 2000000});
var touch = require("XPT2046").connect(
  SPI2, B10, B1, function(x, y){
      if (x !== undefined) {
        console.log( x + " @ " + y);
      }
    }, function(yR, xR, m) { // portrait 240 x 320
        return [ //rawVal / valPerPx + offset
            Math.round(xR / -121.44  + 259.707) 
          , Math.round(yR /   88.904 + -19.781)
          , d, m
          ];
    }).listen();
```

Creates this output when swiping diagonally from top/left to
bottom/right on a 240 x 320 portrait display w/ touch screen:

```
24 @ 30
45 @ 64
66 @ 108
100 @ 153
139 @ 203
171 @ 262
208 @ 308
```

Landscape format:

```
      ...  
      }, function(xR, yR, m) { // landscape 320 x 240
          return [ //rawVal / valPerPx + offset
              Math.round(xR /  -88.904 +  339.781)
            , Math.round(yR / -121.44  +  259.707) 
      ...
```

 */

exports = // XPT2046 module
{ scan: 50 // default scan interval for tracking moving touch
, calc: function(xRaw, yRaw, module) {  // default x / y calc...
      return [xRaw, yRaw, module]; // ...is just a pass through
    }
, lstn: false // is listening to touch and untouch (calling back)
, d: null // data as last read from XPT2046 touch controller
, t: 0 // 0 = not touching, 1 = touch down, 3 = scan / tracking move
, x: 0 // last (t=0)/current(t>0) x touch
, y: 0 // last (t=0)/current(t>0) y touch
, connect: function(spi, cs, irq, callback, calc, scan, _, u) {
    _ = _ || this; // _ and u force shortening of code (performance?)
    if (calc) { _.calc = calc; } // overwrite default pass thru calc
    if (scan) { _.scan = scan; } // overwrite default scan of 50 [mx]
    spi.send([0x90,0],cs); // wake the controller up
    var watch = function() { // look for a press
      var interval = setInterval(function () {
        if (!digitalRead(irq)) { // touch/ing
          _.t = (_.t) ? _.t |= 2 : 1;
          var d = _.d = spi.send([0x90,0,0xD0,0,0], cs),
              c = _.calc(d[1]*256+d[2], d[3]*256+d[4], _);
          _.x = c[0]; _.y = c[1];
          if (_.lstn) { callback.apply(u, c); }
        } else { // 'untouch'
          clearInterval(interval);
          _.t = 0;
          interval = u;
          if (_.lstn) { callback(u, u, _); }
          setWatch(watch, irq, { repeat : false, edge: "falling" });
        }
      }.bind(_), _.scan);
    }.bind(_);
    setWatch(watch, irq, { repeat : false, edge: "falling" });
    return _;
  }
, listen:  function(lstn) {
    this.lstn = ((lstn === undefined) || lstn);
    return this;
  }
};
