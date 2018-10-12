/* Copyright (c) 2016 Markus Muetschard, markus@muet.com and 2013 Gordon Williams, Pur3 Ltd. See the file LICENSE for copying permission. */
/*

----- XPT2046 ------------------------- 77 vars, 85 with calibrated calculation.

Module for connecting to the XPT2046 / ADS7843 / ... resistive touchscreen controllers. 

The XPT2046 is pin and function compatible to ADS7843 touch screen controller.

The  module is based on the ADS7843 module structure, but externalizes
the function mapping the analog touch values to (dispolay) coordinates
Current ADS7843 touch screen controller module has challenges with touch
screen and display having different size, with touch screen having porches
(overhanging the display), with alignment of touch screen and display,
and with variation by manufacturers for the displays, touch screens, and
carrier boards. The simplified calculation of x and y from touch raw data
is fix built-in and there is no module (internal) calibration possible.

XPT2046 touch screen controller is based on ADS7843's logic for hardware
handling, but allows customizing - fine tuning and calibrating - the 
externally accessible mapping function.

To support a wide variety of customization from simple to complex to
comprehensive, the integration of the function passes also the raw data 
AND the module. The customizable calculation function defines in the 
returned array what is passed to the callback. In other words, the 
module is a solid framework to handle the hardware events where as the
calculation function is the glue to the application for delivering the
desired values and can be adjusted to the needs.

The most obvious difference to the ADS7843 module is the externalization
of the function to calculate actual x and y from raw values, value per
pixel (scale) and offset to cover all aspects of linearity and offset.
Touchscreen can extend beyond the display and therefore x and y can be
negative or larger than maximum display size.

Last but not least, the controller chip has auxiliary ADC inputs to 
measure, for example, battery power, and it has also a built-in
temperature sensor. Any of these features are not yet taken advantage
of, but could be nicely tapped into with extensions for this module.

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

Explained and Coded within ```onInit()```:

```
var touch, tMod = require("XPT2046");

function onInit() {
  // ...
  // setup touchscreen 
  SPI1.setup({sck:A5, miso:A6, mosi:A7, baud: 2000000});
  touch = tMod.connect( // spi, cs, irq, callback, calc
      SPI1, A3, A2, function(x, y, m) { // landscape input
          if (x !== undefined) { console.log(x + " @ " + y); }
      }, function(yR, xR, m) { // calc function (portraying, top/left=0/0)
      // calc function converts raw x / y to x / y screen coordinates;
      // scale and offset values are calculated using markers
      // and default calc function - values below work well for
      // common 2.2" 240x320 pixels 262K Color TFT LCD display w/ touchscreen 
      // see http://forum.espruino.com/conversations/292641 - Touchscreen     
          return [ // next two lines are code templates for calculation
      //      Math.round(xr /   xScale + xOff) // / x scale per pixel + x offset
      //    , Math.round(yr /   yScale + yOff) // / y scale per pixel + y offset
              Math.round(xr / -121.44  + 259.707) 
            , Math.round(yr /   88.904 + -19.781)
            , m // module
            ];
      }, 50).listen(); // scan interval on touch in milliseconds
  // ...
}
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
