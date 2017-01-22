<!--- Copyright (c) 2016 markus muetschard, muet.com. See the file LICENSE for copying permission. -->
Button for Modular, Extensible UI Framework
================

* KEYWORDS:
UI,GUI,graphical,user,interface,framework,base,button,element,color,display,touch,screen,controller,Graphics,ILI9341


Overview
------------------

The [[uiBtn.js]]  module extends the [[iu.js]] base with the ui button element.


Basic Usage of uiBtn (Button) ui element
-------------------

Enable ui base with uiBtn element and create a button:

```JavaScript
var ui = require("ui")       // load ui base module
 　　  .add(require("uiBtn")) // add uiBtn module into base and remove from cache
      ;
ui.c(3,"btn","b01",10,20,50,30,4,7,"B_1"
                  ,function(){ (LED1.read()) ? LED1.reset() : LED1.set() }
                  ,[20,0,5,15,"RED"]);
```

Creates, adds to ui, conditionally displays and returns an active(2), visible(1) =(3) button ("btn") with id "b01". Button is positioned at 10 @ 20 (left @ top,  x @ y) and is sized 50 x 30 (width x height), has 4(red) / 7(white) border / fill colors, has value object string "B_1", has (arguments ignoring) callback that toggles red LED1, and is labeled "RED" in fontVector (size) 20, font color 0 (black) and x / y-offset of 5 / 15.

Same button creation code presented with mnemonics as used in ui base module documentation and button constructor argument list below:

```JavaScript
//   0  1     2       3  4     5    6   7   8  9        10  11 
// flgs clazz id      x  y     w    h  bc  fc  valObj   cb  l (label array obj)
//      btn                 ->x2 ->y2                        fv tc    x  y  label text
ui.c(3,"btn","b01" , 10, 20,  50,  30,  4,  7, "B_1", function(){ (LED1.read()) 
                                                                    ? LED1.reset()
                                                                    : LED1.set() },
                                                            [20, 0,   5,15, "RED"]);
```

For ui base, color, label, and callback details see also ui base module.


Image as Button
-------------------

A button with border and fill colors equal to display background color (ui.bc) creates a tap-able area that is useful to make anything, such as a displayed image, to act like a button...


Button with dynamically changing Label
-------------------

uiBtn can be changed within callback: for example in example above, the label can be changed to indicate whether tapping will turn the LED on or off. In order to make the ui framework redraw the button and make the label change visible, the callback has to return truey ('JS true'). The button / callback definition for a label changing button looks like this:

```JavaScript
ui.c(3,"btn","b01",10,20,50,30,4,7,"B_1"
                  ,function(id, v, ui, e, t){
                     if (LED1.read()) {
                       LED1.reset();
                       e[11]\[4] = "RED on";
                     } else {
                       LED1.set(); 
                       e[11]\[4] = "RED off";
                     }
                     return true;
                   }
                  ,[20,0,5,15,"RED on"]);
```

Dynamic change of ui element property is not limited to label (text). Any property can be changed. Position, size and visibility though need additional action beyond the re-draw.

If the application has to change the look of the btn ui element independent / 'outside' of the callback, the application has to change the btn ui element ('object') properties (as above) and then invoke the iu framework's draw ui element method `ui.d(e);` with `e` being the changed btn ui element 'object'. There are several ways to get a hold of the btn ui element 'object':

- Store ui element constructor return value in a ui element dedicated variable
- Search ui element with id in ui elements array `ui.es[]`.
- Use (get) e(lement by id) function of ui extension [[uiExt.js]] `ui.e(ioe)`.


Constructor Arguments and Runtime Data Structure
-------------------

Constructor arguments array is practically straight forwarded into the runtime 'object' (array). Sole exceptions are width and height which are transformed into x2 and y2 for faster bounding-box check (x..x2 / y..y2). Bounding box is also use to draw (and un-draw) focus box to indicate focus on ui element.

| arg | rTme | prop  | rTme = runtime 'object' instance of 'clazz' button                            |
|-----|------|-------|-------------------------------------------------------------------------------|
| a[] | e[]  |                                                                                       |
|  0  |  [0] | flgs  | flags focus(4), active(2), visible(1)                                         |
|  .  |   .  | vis   | 0bxx1 visible  &1 visible                                                     |
|  .  |   .  | act   | 0bx1x active   &2 active / senses touch down (vs. read/display-only)          |
|  .  |   .  | foc   | 0b1xx focus    &4 focus (by touch down or drag in/over)                       |  
|  1  |  [1] | c     | clazz "btn"                                                                   |
|  2  |  [2] | i     | id eg "b01", short, null or at least 3 chars, and ui globally unique. Single letter ui element id's are 'reserved' (for keyboard(s)).         |
|  3  |  [3] | x     | x ((left ) of focus / touch bounding box)                                     |
|  4  |  [4] | y     | y ((top  ) of focus / touch bounding box)                                     |
|  5  |   -  | w     | width (of focus / touch box,...                                               |
|  -  |  [5] | x2    | x ((right) of focus / touch bounding box: x - w + 1)                          |
|  6  |   -  | h     | height (of focus / touch box,...                                              |
|  -  |  [6] | y2    | y ((bot  ) of focus / touch bounding box: y - h + 1)                          |
|  7  |  [7] | bc    | border color                                                                  |
|  8  |  [8] | fc    | fill color                                                                    |
|  9  |  [9] | v     | value - any object, from simple string to number to complex { } object        |
| 10  | [10] | cb    | callback on untouch after touchdown w/ args (id, value, ui, e/btn, t/event)   |
| 11  | [11] | l     | label (info) - optional (null/undefined), l(abel) 'object' / array (as below) |

| l[x] | pn | property of label 'object' / array              |
|------|----|-------------------------------------------------|
| l[0] | fv | fontVector (size)                               |
| l[1] | tc | (label) text color (index)                      |
| l[2] | x  | x offset from focus box x ( bounding box left ) |
| l[3] | y  | y offset from focus box y ( bounding box top  ) |
| l[4] | tx | label text to display (using .drawString())     |


Complete example with two buttons
------------------

*Note that this example uses PICO and PICO related SPI1, SPI2 and pins.* 

```JavaScript
// uiWithButtonsExample.js

var ui = require("ui")       // getting ui base and control code (default 8 colors)
      .add(require("uiBtn")) // add/mixin btn ui elt support (and remove from cache)
      ;
function cb(id,v) { console.log(id + ": " + v); } // sample callback
// define ui with - for example - 2 buttons b1 and b2
//   0  1     2       3  4     5    6   7   8  9        10  11 
// flgs clazz id      x  y     w    h  bc  fc  valObj   cb, l (label array obj)
//      btn                 ->x2 ->y2                       fv tc    x  y  label text
ui.c(3,"btn","b1"  ,  5, 40,  65,  35,  4,  4, "B_1",   cb, [15, 7,  13, 9, "RED"  ]);
ui.c(3,"btn","b2"  , 70, 40,  65,  35,  5,  6, {v:2},   cb, [15, 0,   9, 9, "Y-w-B"]);
// bc/fc/tc = border/fill/text colors; cb=callback(id, v, ui, e, t). id is button id,
// such as "b1"; v, ui, e, and t provide button, ui, and touch event runtime data.
// colors 1-bit depth coded w/ 0b### ###=rgb (0=black, 7 is white, 4 is red, etc) 

var dsp,   dspMod   = require("ILI9341"); // display module
var touch, touchMod = require("XPT2046"); // (or "ADS7843") touch screen module

function onInit() {
  SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 1000000}); // SPI2 for display
                     // spi,  dc, cs, rst, callback
  dsp = dspMod.connect(SPI2, B10, B1,  A4, function() {
    dsp.clear(); A1.set(); // clear display and switch backlight on
    ui.connect(dsp)        // connect ui to dsp (Espruino Graphics object)
      .w(0, 0, 240, 320)   // wipe (clear/fill) screen with screen background color
      .d()                 // display all ui elements
      .di = true;          // set to instant display
    SPI1.setup({sck:A5, miso:A6, mosi:A7, baud: 2000000}); // SPI1 for touch control
                           // spi, cs, irq, callback and calibrated touch functions
    touch = touchMod.connect(SPI1, A3,  A2, function(x,y) { // callback
      ui.evt(x,y);
    }, function(yr, xr, d) { // calbrated touch function
      return [ Math.round(xr / -121.44          + 259.70685111989) 
             , Math.round(yr /   88.90357142857 + -19.78130398103)
             ];
    });
    touch.listen();        // not applicable for ADS7843 module
  });
} // /onInit()
onInit(); // while developing only (not part of code to save)
```


API and bits of the implementation
------------------

- `.mn` "uiBtn" ui element module name (custom ui element module names have to be 6+ characters long. Used (on default) to remove ui element module code from cache after merging it into the ui base module code. 
- `.btnC(arguments)` constructor function constructs runtime btn (button) 'object', calls register-(and)-display-conditionally function of ui base module with it and returns it.
- `.vs3(x,y,x2,y2,p,q)` returns vertices - array of 12 x / y coordinate tuples - for drawing rectangle / button with 'rounded' corners. `p` and `q` are offsets for (relative) x and y to create 'corner' points, 3 corner points for each corner.
- `.btnD(f,c,i,x,y,x2,y2,bc,fc,v,cb,l)` draws the button including label (if label present).
- `.btn(_,e,t)` touch (down / drag / untouch) handler when touch coordinates within button's bounding box. It invokes on untouch / release of the button the button's callback as defined by the application, and invokes (re)draw of button if callback returned truey. Argument `_` is ui framework object, `e` is ui btn element 'obhject', and `t` is touch event object. 

