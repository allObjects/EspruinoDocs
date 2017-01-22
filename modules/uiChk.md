<!--- Copyright (c) 2016 markus muetschard, muet.com. See the file LICENSE for copying permission. -->
Checkbox for Modular, Extensible UI Framework
================

* KEYWORDS:
UI,GUI,graphical,user,interface,framework,base,checkbox,element,color,display,touch,screen,controller,Graphics,ILI9341


Overview
------------------

The [[uiChk.js]]  module extends the [[iu.js]] base with the ui checkbox element.

Basic Usage of uiChk (Checkbox) ui element
-------------------

Enable ui base with uiChk element and create a checkbox:

```JavaScript
var ui = require("ui")       // load ui base module
 　　  .add(require("uiChk")) // add uiChk module into base and remove from cache
      ;
ui.c(3,"chk","c01",140,45,25,0,2,7,"H"
                  ,function(id,v){ (v) ? LED2.set() : LED2.reset() }
                  ,[12,7,3,5,"On"]);
```

Creates, adds to ui, conditionally displays and returns an active(2), visible(1) =(3) checkbox ("chk") with id "c01". Checkbox is positioned at 145 @ 40 (left @ top, x @ y) and sized 25 (both width and height), has 2(green) / 7(white) border / fill colors, is initially unchecked (0), has value object "H" (when checked and undefined when unchecked), has callback that sets and resets green LED2 accordingly, and is labeled "On" in fontVector (size) 12, font color 7(white) and x / y-offset 3 / 5.

Same button creation code presented with mnemonics as used in ui base module documentation and button constructor argument list below:

```JavaScript
//   0  1     2       3  4     5    6   7   8  9        10  11 
// flgs clazz id      x  y     w    h  bc  fc  valObj   cb  l (label array obj)
//      chk                 ->x2 ->y2                        fv tc    x  y  label text
ui.c(3,"chk","c01" , 20, 20,  50,  30,  2,  7, "H", function(id,v){ (v) 
                                                                    ? LED2.set()
                                                                    : LED2.reset() },
                                                            [12, 7,   3, 5, "On"]);
```

For ui base, color, label, and callback details see also ui base module.

If the application has to *change look* of the ui element (independent / 'outside' of the callback), the application has to change the ui element ('object') properties (as above) and then invoke the iu framework's draw ui element function `ui.d(e);`.

If the application has to *change state* / *check or uncheck* the checkbox ui element, the application cabn invoke the ui framework's (value) update method when ui extension module [[uiExt.js]] is loaded: `ui.u(ioe,v,p)`, where `ioe` is the id of the checkbox ui element or the checkbox ui element, `v` - for value - is truey for check and falsy for uncheck, and `p` - for propagate - is to be truey if the application expects the callback to be invoked. 

When ui extension module [[uiExt.js]] is *NOT* loaded, the application has to invoke `ui.chkU(_,e,t,s,p)`, where `_` is the ui, `e` is the checkbox ui element to change / check or uncheck, `t` is the touch object which can be passed as `null` since the change is not touch event triggered, `s` is truey for check and falsy for uncheck, and `p` - for propagate - is to be truey if the application expects the callback to be invoked.

There are several ways to get a hold of the ui element 'object':

- Store ui element constructor return value in a ui element dedicated variable
- Search ui element with id in ui elements array `ui.es[]`.
- Use (get) e(lement by id) function of ui extension [[uiExt.js]] `ui.e(ioe)` (`ioe` = `idOfElement_or_element`)


Constructor Arguments and Runtime Data Structure
-------------------

Constructor arguments array is practically straight forwarded into the runtime 'object' (array). Sole exceptions are width and height which are transformed into x2 and y2 for faster bounding-box check (x..x2 / y..y2). Bounding box is also use to draw (and un-draw) focus box to indicate focus on ui element.

| arg | rTme | prop  | rTme = runtime 'object' instance of 'clazz' checkbox                          |
|-----|------|-------|-------------------------------------------------------------------------------|
| a[] | e[]  |                                                                                       |
|  0  |  [0] | flgs  | flags focus(4), active(2), visible(1)                                         |
|  .  |   .  | vis   | 0bxx1 visible  &1 visible                                                     |
|  .  |   .  | act   | 0bx1x active   &2 active / senses touch down (vs. read/display-only)          |
|  .  |   .  | foc   | 0b1xx focus    &4 focus (by touch down or drag in/over)                       |  
|  1  |  [1] | c     | clazz "chk"                                                                   |
|  2  |  [2] | i     | id eg "c01", short, null or at least 3 chars, and ui globally unique. Single letter ui element id's are 'reserved' (for keyboard(s)).         |
|  3  |  [3] | x     | x ((left ) of focus / touch bounding box)                                     |
|  4  |  [4] | y     | y ((top  ) of focus / touch bounding box)                                     |
|  5  |   -  | w     | width (of focus / touch box,...                                               |
|  -  |  [5] | x2    | x ((right) of focus / touch bounding box: x - w + 1)                          |
|  6  |   -  | h     | height (of focus / touch box,...                                              |
|  -  |  [6] | y2    | y ((bot  ) of focus / touch bounding box: y - h + 1)                          |
|  7  |  [7] | bc    | border color                                                                  |
|  8  |  [8] | fc    | fill color                                                                    |
|  9  |  [9] | v     | value - any object, from simple string to number to complex { } object. Note that the value object passed to callback is undefined when chk is unchecked.         |
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
    }, function(yr, xr, d) { // calibrated touch function
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

- `.mn` "uiChk" ui element module name (custom ui element module names have to be 6+ characters long. Used (on default) to remove ui element module code from cache after merging it into the ui base module code. 
- `.chkC(arguments)` constructor function constructs runtime chk (checkox) 'object', calls register-(and)-display-conditionally function of ui base module with it.
- `.vs2(x,y,x2,y2,p)` returns vertices - array of 8 x / y coordinate tuples - for drawing rectangle / checkbox with beveled corners. `p` is offsets for (relative) x and y to create corner points, 2 corner points for each corner.
- `chkD(f,c,i,x,y,x2,y2,bc,fc,v,cb,l)` draws the checkbox including label (if label present).
- `.chk(_,e,t)` touch (down / drag / untouch) handler when touch coordinates within checkbox's bounding box. It invokes (indirectly / through `.chkU(...)`) on untouch of the checkbox the checkbox's callback as defined by the application, and invokes (re)draw of the checkbox if callback returned truey. Argument `_` is ui framework object, `e` is ui btn element 'object', and `t` is touch event object. 
- `.chkG(e)` get value object or state of checkbox ui element `e`. Unchecked checkbox returns `undefined` as value object.
- `.chkU(_,e,t,s,p)` update checkbox ui element `e` with state `s` - truey or falsy for check and uncheck, respective. If update results in a state change - checked to unchecked or unchecked to checked - checkbox is updated and - if `p` (for propagate) is truey - the callback is invoked. `_` is the ui, `t` is the touch event object (if available). `.chkU(...)` is usually called by `.chk(...)` or `.u(...)` (latter is ui element update method as part of the ui extension module [[uiExt.js]], but can also be called by the application when, for example, a state change happens based on a different event than a touch event, especially when the checkox is used for display only / read-only to display a boolean value, for example: 'connected').
- `chkDu(_,x,y,x2,y2,bc,fc,s,b)` display / draw updated of checkbox, internal / private and optimized method, invoked by `.chkU(...)` when state has changed and display / drawing of state only has to be updated (draw or erase x check mark). 
