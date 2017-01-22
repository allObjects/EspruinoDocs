<!--- Copyright (c) 2016 markus muetschard, muet.com. See the file LICENSE for copying permission. -->
Resistive Touchscreen Controller with Espruino
================

* KEYWORDS:
UI,LCD,display,resistive,touch,screen,touchscreen,controller,Graphics,ILI9341,ADS7843,XPT2046


Overview
------------------

This module makes Espruino a controller for resistive touchscreens that do not have a built in controllers, such as ADS7843 or XPT2046. The implementation allows to have multiple, independent, simultaneously operating controllers (Every `.connect(...)' returns a new instance). configuration / calibration can happen on creation and while running, including change of callback (Allows the application to implement a runtime calibration function as well as dynamically direct callback).

A resistive touchscreen exposes four (4) leads which are usually labeled X+, Y+, X- and Y-. The leads can usually be wired up directly to four (4) pins. At least two (2) of the four (4) pins have to be ADC pins. One ADC pin has to be connected to either X+ or X-, and one to either Y+ or Y-. 

While X- and X+ are powered with 0V (GND) and 3.3V with two pins in output mode, voltage on Y+ or Y- is read with an ADC pin in input mode. The fourth pin has to be in plain input mode in order to not interfere with ADC reading. For Espruino, the [analog value read is between 0 and 1](https://www.espruino.com/ADC) and is proportional to the touch position on the x-axis of the touch screen and the display. Switching powering and reading to Y and X pins provides the value for the y-axis. The basic formulas for calculating the x and y display coordinates are:

```JavaScript
var x = Math.floor(xAxisValue * xAxisDisplayPixels); // 0..239
var y = Math.floor(yAxisValue * yAxisDisplayPixels); // 0..319 
```

Since most the touchscreen size and position do most of the time not exactly match those of the display and the minimum and maximum values read are not exactly 0.000 and 1.000, the formulas for calculating decent accurate x and y display coordinates have to be enhanced and feed with calibration values. The calibration values can be calculated from values obtained when touching two markers of known position displayed (near) minimum and (near) maximum for both x and y axis. To balance out non-linearities, it is best to take averages from values per pixel and offsets obtained and calculated from combinations of two of markers in all corners and in the center of the display. When the touchscreen area overlaps the display area / has porches and configuration for minimum (lowest) and maximum (highest) rerturned values permitting, the returned x and y coordinates may lay outside of the display and have to be caught by the application configuration. To use overlap area / porches, custom config has to overwrite default base config accordingly (see example using porches / overlap areas).

For more details about how a resistive touch screen is built and works and how they can be calibrated, see forum conversation at [Resistive Touchscreen directly (no touch controller)](http://forum.espruino.com/conversations/256122/).


Wiring Up
------------------- 

Example for wiring up Espruino Pico. For any board, the constraint mentioned in the *Note* has to be satisfied.

| Touch  | Espriuno | Connect | Comment                                               |
| Screen | Pico     | Arg     |                                                       |
|--------|----------|---------|-------------------------------------------------------|
| Y+     | A7       | yp      | matches 1st argument/pin in connect, MUST be ADC pin  |
| X+     | A6       | xp      | matches 2nd argument/pin in connect, MUST be ADC pin  |
| Y-     | A5       | yn      |                                                       |
| X-     | A3       | xn      |                                                       |

*Note that pins passed as 1st and 2nd argument in .connect() have to be an ADC (Analog to Digital Converter) pin. The touch controller module uses them in the analogRead(adcPin) function.*


Usage
-------------------

This example uses the configuration with default calibration for [adafruit's 2.8" TFT LCD with (Resistive) Touchscreen Breakout Board w/MicroSD Socket - ILI9341](https://www.adafruit.com/products/1770) in *Portrait format*. 

```JavaScript
var touch = require("touchRD").connect(A7, A6, A5, A3, function(x,y,t) {
    if (x !== undefined) { // or simplified: if (t.t) { ...  // touching
      console.log(x,y);
    } else {
      console.log("up");
    }
  }); // placed in level 0 of the code uploaded
touch.listen(); // usually placed in onInit() { ... } function
```

For use in *Landscape format*, a simple reassignment for x and y as first thing in the callback does the trick:

```JavaScript
var touch = require("touchRD").connect(A7, A6, A5, A3, function(x,y,t) {
    if (x !== undefined) { // or simplified: if (t.t) { ...  // touching
      x = t.y; y = t.XH - t.x; // Landscape, 90 degrees clockwise turned
      console.log(x,y);
    } else {
      console.log("up");
    }
  }); // placed in level 0 of the code uploaded
touch.listen(); // usually placed in onInit() { ... } function
```

*Note: when you plan to [save()](http://www.espruino.com/Reference#l__global_save) the code, place the line with `.listen()` invocation into the `onInit() {...}` function to ensure reliable start upon power up.*

For *probing* use when controller is *NOT* listening:

```JavaScript
var touch = require("touchRD").connect(A7, A6, A5, A3, function(x,y,t) {
    if (x !== undefined) { // or simplified: if (t.t) { ...  // touching
      console.log(x,y);
    } else {
      console.log("up");
    }
  }); // placed in level 0 of the code uploaded

// ...some code - use with registered callback
  touch.xy(touch.cb);

// ...some code - use with check of touch status
  if (touch.xy().t) {
    // ...code for touched
  } else {
    // ...code for not touched
  }  
```

Probing while controller is listening interferes with touch down watch and may create false touch events.


Example that uses Porches / Touchscreen Overlap Area
-------------------

Some touch screens have porches with printed UI controls on it for, for example, program and application functions, such as 'home', `back`, `menu`, `phone`, `calendar`,... etc. In order to use these areas and make touches available to the callback, default base Configiuration can be overwritten. Custom configuration also overswrites the tracking interval `.ti` for smoother drag/move-handling while touching.

```JavaScript
// touchRDTestPorch.js

// enables an extra 15 pixels / porch 
// at the bottom of the touch screen
// overlapping the display

// get touch module
var touchMod = require("touchRD");

// define callback
function cb(x, y, t) {
  if ( x !== undefined) { // or: if (t.t) {...
    // for Landscape (90 degrees cc-wise turned):
    // x = t.y; y = t.XH - t.x; // Landscape
    console.log(x, y, t.t);
  } else {
    console.log("up");
  }
}

// invoke connection / creates and returns touch controller
var touch = touchMod.connect(
    A7 // yp / Y+
  , A6 // xp / X+
  , A5 // yn / Y-
  , A3 // xn / X-
  , cb
  , { ti: 50  // to track touch every 50 [ms]
    , YH: 335 // enable bottom porch / where screen overlaps display
    }
  );

function onInit() {
  touch.listen();
}

onInit();
```

Configuration
-------------------

Touchcontroller has has a base or default configuration (baseC, bC) that can be overwritten with a particular custom configuration C on connect. 

The base or default configuration can be overridden by passing a configuration object *C* as the 6th argument in the *.connect(...)* function. The configuration object can be built upfront and passed or provided inline. Latter is shown in code example below (which also shows the default values the module comes with).

```JavaScript
var touch = require("touchRD").connect(
    A7 // yp / Y+ - MUST be ADC pin
  , A6 // xp / X+ - MUST be ADC pin
  , A5 // yn / Y-
  , A3 // xn / X+
  , function(x,y,tr) { // callback cb
      if (x !== undefined) { 
        console.log(x,y);
      } else {
        console.log("up");
    } }
  , { // Overwriting Config object: can include/replace above pins and callback
      X:  240     // x-axis / horizontal pixel #
    , Y:  320     // y-axis / vertical pixel #
    , XL: 0       // x-axis lowest value returned
    , XH: 239     // x-axis highest value returned
    , YL: 0       // x-axis lowest value returned
    , YH: 319     // x-axis highest value returned
    , xt: 0.08    // x-touch threshold # - see Note below
    , yt: 0.05    // y-touch threshold # - see Note below
    , xc: 0.4960  // x center value #
    , yc: 0.4795  // y center value #
    , xd: 0.00318 // x delta per px #
    , yd: 0.00251 // y delta per px #
    , ti: 100     // track interval in [ms]
    }
//, { // Optional base Config object replacing the default configuration...
//  } // ...has to provide all properties as listed in API 
  );
  
// Note: prevent negative x and y, can be lowered, but has to
touch.listen(); // usually placed in onInit() { ... } function
```

Use this code example override the values that need to be adjusted for the particular display and touchscreen at hand. Only the values that have to be overridden have to be provided as properties in the configuration object. Merging of the configuration's properties in the controller are accomplished with a simple mixin by looping through the configuration object's present properties and applying them to the controller.

Pin and callback parameters are applied first, then default or optional, overwriting base configuration, and lastly the optional, overwriting custom configuration.

API and bits of the implementation
------------------

- `.connect(xn,xp,yn,yp,callback,Config,baseConfig)` returns a controller instance. The arguments are:
  - `yp, xp, yn, xn` pins connected to the leads of the resistive touch screen and become properties of the controller (same name)
  - `callback` a `function(x,y,touch)` invoked on a touch down, on configurable interval while touching and moving, of which the last occurrence is *the* 'untouch'. Untouch is detectable by `x === undefined`. callback becomes property of controller with abbreviated name 'cb`. Callback arguments are:
    - `x, y` coordinates of touch point with `x === undefined` for 'untouch'. *Note that the coordinates can be outside of related display due to size and positioning of the touch screen compared to the display.
    - `touch` touch controller instance (useful to manipulated / calibrate controller in application on touch / drag / move / untouch events). 
    - `C` optional config object that includes the properties to overwrite. Valid to overwrite are below properties up to and including `.ti` - track interval. Theese - including the callbqck - can be modified by the application even at runtime. Any other property - marked with *read-only to appliocation* - come only through the base or default Config, which is used on controller construction.
    - `baseC` optional base config object provides all properties listed below, including the ones that are read-only to the application. 
- `.listen()` or `.listen(boolean)` initiate listening to touch events when not listening (yet) on invocation with *no or truey argument, and stop listening to touch events with *falsy* argument.
- `.xy(callback)` can be directly used when controller is not listening to probe wheter touching is going on or not. Callback is optional and works the same way as described above.
- `.X` (240 default) x-axis / horizontal pixel # or resolution
- `.Y` (320 default) y-axis / vertical pixel #
- `.XL` (0 default) minimum (lowest) x returned, usually 0
- `.XH` (239 default) maximum (highest) x returned, usually X - 1
- `.YL` (0 default) minimum (lowest) y returned, usually 0
- `.YH` (319 default) maximum (highest) y returned, usually Y - 1
- `.xt` (0.08 default) x-touch threshold, prevents negative values by mapping any analog read value below to return as 0. Can be lowered to enable negative values when touch screen overlap over display needs to be used, but can never be lower as lowest value read with no touch going on. It can be lower or equal as 'xd', but not 0. Very low values may increase sensitivity to noise and lead to false touch detection.
- `.yt` (0.05 default) y-touch threshold # - see Note below
- `.xc` (0.4960 default) x center value #
- `.yc` (0.4795 default) y center value #
- `.xd` (0.00318 default) x delta per px #
- `.yd` (0.00251 default) y delta per px #
- `.ti` (100 default) tracking interval when touching and moving
- `.xr` (0) last read value on x-axis [0..1) - read-only to application
- `.yr` (0) last read value on x-axis [0..1) - read-only to application
- `.x` (0) last calculated value on the x-axis [XL..XH] - read-only to application
- `.y` (0) last calculated value on the y-axis [XH..YH] - read-only to application
- `.t` (false) last touch state (touching, touching and moving: true, else false)  - read-only to application
- `.l` (false) listening state (listening: true / truey) - read-only to application
- `.w` (null..id) watch handle of the watch for a touch down - read-only to application
