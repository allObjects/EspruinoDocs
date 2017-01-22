<!--- Copyright (c) 2016 markus muetschard, muet.com. See the file LICENSE for copying permission. -->
Modular, Extensible UI Framework - Base Module
================

* KEYWORDS:
UI,GUI,graphical,serial,interface,framework,base,button,element,color,display,touch,screen,controller,Graphics,ILI9341


Overview
------------------

The Graphical [[ui.js]] UI Framework Base takes care of most of the plumbing and data flow between touch screen (or physical buttons) and display as input and output components. Some UI elements can be used as output - read-only - ui elements only for just displaying values in characters or otherwise.

The following ui elements are available as extensions:

 - Button [[uiBtn.js]]
 - Check box [[uiChk.js]]
 - Radio button [[uiRad.js]]
 - Slider [[uiSli.js]]
 - Input field [[uiInp.js]]
 - Keyboard [[uiKbd3x10Btns.js]] (using uiBtn buttons)
 - Base enhancing extension [[uiExt.js]] (supports extended color schemes, advanced labels, some drawing, and more...)

Because of the framework's modular implementation approach and independence of most ui elements, the application needs to pull in only the elements it wants to use to save variables.

Additional - custom - ui elements are easy to create and integrate as extensions based on the modular architecture and available documentation and examples. Extensions can either be implemented inline - in the application - or externally as modules (locally in Web IDE's sandbox modules folder or on the Web). To avoid naming conflict when mixing your custom code with existing and planned ui base and element extensions, use property and function names with four or more (4+) characters.

For the sake of least, most frugal variable / memory usage (of only 254 vars for the base when used minified), the framework abstains from version handling. This current - first - detailed documented version of the modular implementation has matured over extended time in several projects of different complexity which rendered it quite comprehensive and very stable. Last but not least, it has pushed and  exploits the envelope of resource limitations as is unique of MCs in general and of Espruino in particular. Performance wise, it has kept responsiveness for serially / SPI connected displays as much as possible. With faster connected displays, additional options and much more 'snappy' UIs are possible.


Basic Usage of ui Base and - for example - uiBtn (Button) ui element
-------------------

To get you going, follow these 5 simple coding steps (first all steps in one block to quickly copy all at once into Espruino Web IDE edit pane for uploading and then the explaining descriptionof each step).

```JavaScript
// Step 1. Get ui base and ui element(s) / extensions as needed
var ui = require("ui")       // ui base and control code (default 8 colors)
      .add(require("uiBtn")) // add/mixin btn ui elt code (and remove from cache)
      ;

// --- Step  2. Define callback(s)
function cb(id,v) { console.log(id + ": " + v); } // sample callback

// --- 3. Define UI by c(reating) elements (in this example: 2 buttons b1 and b2)
//   0  1     2       3  4     5    6   7   8  9        10  11 
// flgs clazz id      x  y     w    h  bc  fc  valObj   cb, l (label array obj)
//      btn                 ->x2 ->y2                        fv tc    x  y  label text
ui.c(3,"btn","b01" ,  5, 40,  65,  35,  4,  4, "B_1",   cb, [15, 7,  13, 9, "RED"  ]);
ui.c(3,"btn","b02" , 70, 40,  65,  35,  5,  6, {v:2},   cb, [15, 0,   9, 9, "Y-w-B"]);
// bc/fc/tc = border/fill/text colors; cb=callback(id, v, ui, e, t). id is button id,
// such as "b01"; v, ui, e, and t provide button, ui, and touch event runtime data.
// colors 1-bit depth coded w/ 0b### ###=rgb (0=black, 7 is white, 4 is red, etc)
 
// --- 4. Pull in output and input device(s)' modules
var dsp,   dspMod   = require("ILI9341"); // display
var touch, touchMod = require("TouchRD"); // resistive touch screen direct w/o controller

// --- 5. Step: Bind everything together
function onInit() {
  SPI2.setup({sck:B13, miso:B14, mosi:B15, baud: 1000000}); // SPI2 for display
  dsp = dspMod.connect(SPI2, B10, B1,  A4, function() {
    dsp.clear(); A1.set(); // clear display and switch backlight on
    ui.connect(dsp)        // connect ui to dsp (Espruino Graphics object)
      .w(0, 0, 240, 320)   // wipe (clear/fill) screen with screen background color
      .d()                 // display all ui elements
      .di = true;          // set to instant display
    SPI1.setup({sck:A5, miso:A6, mosi:A7, baud: 2000000}); // SPI1 for touch control
    touch = touchMod.connect(SPI1, A3,  A2, function(x,y) { // callback
      ui.evt(x,y);
    }, function(yr, xr, d) { // calibrated touch function
      return [ Math.round(xr / -121.44          + 259.70685111989) 
             , Math.round(yr /   88.90357142857 + -19.78130398103)
             ];
    });
    touch.listen();        // not applicable for ADS7843 / Touchscreen modules
  });
} // /onInit()
```

 1. Get ui base and ui element(s) / extensions as needed, such as uiBtn, uiSli(der),... --- Get ui base and ui elements in level 0 to save vars. Code placed in level 0 is immediately executed on Espruino on upload only the result and part of source code is stored. `save()` (after upload of completely developed application code) will save the state of the `ui` and start it and render  
 2. Define callback(s)... --- Callbacks can be created upfront or inline as anonymous in next step. This sample callback just logs on press or change event the `id` of the ui element and - if it is a value holding element - such as a check box, the `v(alue).
 3. Define UI by c(reating) elements on code upload but do not display it yet... --- When defining the ui - set of buttons, check boxes, radio buttons, etc. - in level 0, the build happens at upload to the board and the source code of ui definition is not consuming any runtime memory in order to save variables.`save()` (after upload of completely developed application code) will save the state of the `ui` and start it and render it on the display from within `onInit()` on power up. The code for this step 3 is repeated below this list with some additional info.
 4. Pull in output and input device(s)' modules - done on upload - once... --- There can be multiple input devices. Physical buttons or sensors can sent event information to the ui as well in their callbacks.
 5. Bind everything together in `onInit(){...}` - done every time on power up (and on `save()`)... --- Connect Espruino to the display, connect the ui to the display, connect Espruino the touch screen, and connect the
ui to the touch screen. *Note the the pins used are PICO board oriented. You may need to adjust for the board you are using and your other needs.*

Structure of code in step 3 explained:

The ui element c(reate) parameters for defining the ui are arranged in columns. Each column has a two (2) part header consisting of the index of the argument (and array element in runtime array object) and a mnemonic hinting the purpose. The comment below the code contain brief explanation about how to specify colors and callbacks. 

```JavaScript
// --- 3. Define UI by c(reating) elements (in this example: 2 buttons "b1" and "b2")
//   0  1     2       3  4     5    6   7   8  9        10  11 
// flgs clazz id      x  y     w    h  bc  fc  valObj   cb, l (label array obj)
//      btn                 ->x2 ->y2                        fv tc    x  y  label text
ui.c(3,"btn","b1"  ,  5, 40,  65,  35,  4,  4, "B_1",   cb, [15, 7,  13, 9, "RED"  ]);
ui.c(3,"btn","b2"  , 70, 40,  65,  35,  5,  6, {v:2},   cb, [15, 0,   9, 9, "Y-w-B"]);
// bc/fc/tc = border/fill/text colors; cb=callback(id, v, ui, e, t). id is button id,
// such as "b1"; v, ui, e, and t provide button, ui, and touch event runtime data.
// colors are 3-bit depth coded w/ 0b###, ###=rgb (0=black, 7 is white, 4 is red, etc).
```

If your (resistive) touch screen does not have a controller but rather exposes its four bare leads (labeled something like X+, Y+, X-, and Y-), you can use the [[touchRD.js]] module instead of [[ADS7843.js]] or [[ADS7843.js]]  / [[Touchscreen.js]] modules. Details about the [[touchRD.js]] module are included the forum conversation [Resistive Touchscreen directly (no touch controller)](http://forum.espruino.com/conversations/256122/). 

API and bits of the implementation
------------------

ui is currently implemented as singleton. At runtime it does hold on to base code and data and also to the code and data of the on-demand added and created ui elements. Adding or extending the ui with a ui element mixes the code and data into the ui object. 

All ui elements handled by ui framework have (internally) about twelve (12) common properties in same structure, of which only the first nine (9) - index [0..8] - are really mandatory:

| index   | property                                             |
|---------|------------------------------------------------------|
| [0]     | flags - bit coded focus(4), active(2), visible(1)    |
| [1]     | clazz (or 'type' of ui element)                      |
| [2]     | id - ui unique, short but at least 3 characters      |
| [3]     | x position                                           |
| [4]     | y position                                           |
| [5]     | width (in constructor) --> x2 pos (in runtime obj)   |
| [6]     | height (in construcgtor) --> y2 pos (in runtime obj) |
| [7]     | border color                                         |
| [8]     | fill colors                                          |
| [9]     | value object                                         |
| [10]    | callback                                             |
| [11...] | some label and other 'object(s)', specific to clazz  |
 
Same values in same structure lead to implementation of the ui elements as *lightweight, lean array objects* in order to save memory instead of full blown (prototype based) objects, hence the array with index notation in the list above (with and height are converted on creation into x2 and y2 for speedy in-bounding-box check on touch event, some other properties are transformed and complemented as well).  

ui singleton holds the *ui state in static and dynamic value properties*. All properties can be queried, some can be changed by the application at runtime, but most are 'taboo' (t! - *DON'T TOUCH*) to change by the application.

| prop    |value  | comment                                                              |
|---------|-------|----------------------------------------------------------------------|
| `.clrs` | [...] | color lookup tab w/ [0]=bit color coder, [1..]=[r,g,b] tripplets     | 
| `.dsp`  | null  | !t display (Espruino Graphics object)                                |
| `.mn`   | "ui"  | !t reserved, used to remove added ui element code from cache         |
| `.bc`   | 0     | background color r*g*b* bit coded, if <0 looked up [[R,G,B],...]     |
| `.tc`   | 7     | touch / focus color r*g*b* bit coded, if <0, looked up [[R,G,B],...] |
| `.di`   | false | display instantly on create/change (defer until after save())        |
| `.es`   | []    | !t ui elements                                                       |
| `.ef`   | null  | !t (ui) element (in) focus                                           |
| `.lf`   | null  | !t (ui element) last (in) focus                                      |
| `.it`   | false | !t (display) is touched                                              |
| `.td`   | false | !t is touch down (event)                                             |
| `.tt`   | 0     | !t touch down time                                                   |
| `.lx`   | 0     | !t last x (touched)                                                  |
| `.ly`   | 0     | !t last y (touched)                                                  |
| `.dx`   | -1    | !t (last) x (touch) down                                             |
| `.dy`   | -1    | !t (last) y (touch) down                                             |
| `.te`   | {t:0} | !t (last) touch event                                                |

ui provides *core and convenience functions / methods* to kbe use by application to deal with ui elements as well as plain graphics. Due to ui's extensibility, you can add easily your own ui element or plain function extensions as desired (with `.add(module, keep);`).

 - `.evt(x,y)` (and `.evt()`) triggers a ui action: touch down/drag @ `x` and `y` (and untouch) and invocation of related callback. Callback is usually invoked on untouch in order to keep control of single thread blocking as easy and predictable as possible.
 - `.iib(x,y,e)` returns true when `x` and `y` lay in bounding box of ui element `e`
 - `.foc(e)` set focus to element `e` (and take it away from element that had it so far)
 - `.blr(e)` blur/unfocus element `e` (if `.blr()`, element currently in focus is blurred)
 - `.w(x,y,w,h,c)` wipe rectangular area at `x`/`y` and `w`/`h` of display with color `c`
 - `.c(arguments)` generic, single point entry for creating ui elements. Uses first`arguments[1]` as class or type name and concatenates it with "C" for specific create entry. To create a custom ui element and integrate it (with `.add(require("customUiElementModule"))` is discussed in a separate publication. Element is registered, drawn conditionally (`.di`), and returned. Complete constructor arguments (array) is documented in detail with each ui element.
 - `.d(e)` redraw element `e`, and when just `.d()`, redraw the whole ui (all ui elements). In general, a ui is built on upload without displaying it to save variables and displayed on demand or in `onInit() {...}` to re-display on every re-power up or reset.
 - `.clr(c,i)` set color according `this.clrs{0](c,i)` (customizable) function. Default is set for bit coded value for 3-bit (r,g,b) color depth and provides 8 colors: `b&000=0=black`, `b&111=7=white`, `b&100=4=red`, etc. `this.clrs[0]()` can be customized to support any color depth - coded, table looked up, or literal. For details see Colors section.
 - `.fnt(fv)` set fontVector (size) ...currently w/ no frills, as opposed to `.clr()`. More font options will be implemented at a later time.
 - `.w(x,y,x2,y2,c)` wipe/fill rectangle with (optional) color `c`. If color is absent / undefined, use displays background color `.bc` (default `0`, `black`).
 - `.ld(x,y,l(abelInfoArray))` label draw function. For details about label info array see Label section.
 - `.add(module,keep)` extend ui module with ui element module and other extensions (implements modularity). `module` can be a module name as string literal `'moduleName"` or string variable, or the module as object. If `keep` is absent or falsy, module is removed from cache after module code is merged into ui base code to save variables. For more details see Note2.
 - `.connect(dsp)` connects w/ initialized Espruino `Grapics` obj (after save()) 
     
*Note1:* The reason for x and xOffset - and y and yOffset - is because `.ld()` is used in conjunction with a ui element that has a bounding box which provides x and y for usually the left-top corner. xOffset and yOffset are used to place the label relative to the ui elements supplied corner coordinates.
      
*Note2:* For the purpose of removing a module from the cache by ui after adding it, the module has to know its name in `mn` property.

For example, for a module `onOff.js` switching backlight on/off on pin `B2`, is defined by this module code:

```JavaScript
exports = { mn:"onOff", on: function(on) { digitalWrite(B2, on || on===undefined); }
```

`ui.add(require("onOff"))` adds it (in) to ui so it can be used like `ui.on();`. 

Adding above module as object directly or anonymously to ui in level 0 does not require the module to have a name and know it - it is an anonymous module / object similar to anonymous function:

```JavaScript
ui.add({ on: function(on) { digitalWrite(B2, on || on===undefined); });
```

When module is loaded via string variable, the module has to go to the cache by other means, 
like already being built-in into the binary, by a separate `require("moduleNameAsStringLiteral")` or programmatically.

Without module file but still going through the cache, modules can also be put into cache directly on upload in level 0 (and pulled/served with `require()` with module name provided as variable to escape regular module detection and pre-upload from modules sources).

How to add a (ui element as) module programmatically to the `Modules` cache and then to `ui`:

```JavaScript
var mName = "onOff";
Modules.addCached(mName,'{ mn:"onOff", on: function(on) { ' // add ui element
  + 'digitalWrite(B2, on || on===undefined); }'); // as module by source to cache
ui.add("onOff"); // add ui element (in) to ui and remove from cache
```


Colors - c
------------------

Any color - mostly referred to by the variable named c - can be specified in three ways: 

 - By bit coded (r,g,b) triplet as single integer number
 - By index into array of (r,g,b) triplets as single negative integer number
 - Literally by [r,g,b] triplet as array of Espruino base color values 0..1

For (r,g,b) - red, green, blue - specification, Espruino `Graphics` modules accepts for each r,g,b the normalized value 0..1. Under the hood and with help of the module for the presenting display, this normalized color specification is transformed - most of the time into a bit coded color again but specific to the display hardware and usually more complicated. For example, different number of bits are used for each base color r, g, b, for example (hardware display specific), 5, 6, 5 bits, and sometimes even in a different sequence, such as r, b, g.

ui module already includes a default color converter from *bit coded rgb value* to Espruino's normalized [r,g,b] 0..1 triplet which makes bit coded colors independent from the display's coding. ui's default color converter supports 3-bit color depth coded colors, one bit for each of the base colors r, g, and b: - 2^1^3 = 8 colors. It is stored as function in `.clrs[0]` property). 

For higher color depth you can provide a custom bit coded color coder. For still relatively easy specification of colors in the application are 2 and 3 bits for each r, g, and b base colors. 6 bit color depth enables 2^2^3 = 64 colors. Red in 6 bit color depth would be coded as 0b110000 = 32  + 16 = 48, and blue as 0b000011 = 2 + 1 = 3. 9 bit color depth enables 2^3^3 = 512 colors. Red in 9 bit color depth would be coded as 0b111000000 = 256 + 128 + 164 = 448, and blue as 0b000000111 = 4 + 2 + 1 = 7.

Using pretty elaborate, accessibility conforming colors with a *color lookup table* is s great alternative to bit coding in the application. Lookup is triggered with a negative color number, which is - taken absolutely - the index into the lookup table of normalized (r,g,b) triplets, with values for r, g, and b ranging from 0..1.

To add custom lookup colors to the ui base, for example, a light, medium, and dark grey specifiable in the application with -1, -2 and -3, use the following code:

```JavaScript
ui.crls = [ui.clrs[0],[0.75,0.75.0.75],[0.5,0.5,0.5],[0.25,0.25,0.25]];
```
The code above keeps the current n bit color depth color coder (as element with index 0) and provides the three different grey for lookup. The code for coloring, for example,  the button `b1` of the basic usage example above dark grey (-3) with medium grey border (-2) and light grey text label (-1), looks like this:

```JavaScript
// Dark grey button with medium grey border and light grey label with look-up colors
//   0  1     2       3  4     5    6    7   8  9        10  11 
// flgs clazz id      x  y     w    h   bc  fc  valObj   cb, l (label array obj)
//      btn                 ->x2 ->y2                         fv tc   x  y  label text
ui.c(3,"btn","b1"  ,  5, 40,  65,  35,  -2, -1, "B_1",   cb, [15,-3, 13, 9, "G=s"  ]);
// bc/fc/tc = border/fill/text colors; cb=callback(id, v, ui, e, t). id is button id,
// such as "b1"; v, ui, e, and t provide button, ui, and touch event runtime data.
// colors are looked up in .clrs[] using absolute value as index.
```

ui supports the mix and match of ways of color specifications.


Labels - l
------------------

Labels are optional. If parameter has to be furnished because there are parameters after the label parameter in the constructor, falsy can be passed (`null`, `undefined`, 0, false).
 
Basic 'label object' includes these information elements:
 
| l_elt  | comment                                                         |
|--------|-----------------------------------------------------------------|
| `l[0]` | fontVector (size), values < 7 reserved for future font options  |
| `l[1]` | color (see Colors section)                                      |
| `l[2]` | xOffset to x - left of bounding box of label (.drawString(...)) |
| `l[3]` | yOffset to y - top  of bounding box of label (.drawString(...)) |
| `l[4]` | label text (used in .drawString(...))                           |

Depending on the ui element 'clazz', there may be multiple labels and as well the label object may include additional properties - values and functions - for, for example, range definition, formatting, etc.  


Callback / UI Event Handlers - cb
------------------

Each UI element has an event handler - callback function specified - short name: cb. If a falsy (false, 0, null, undefined,...) callback is provided at ui element creation or set later on, the ui element is or becomes a read-only, display-only ui element, useful for displaying variable states / values.

Callbacks can be shared, but may need to include decoding to figure out which ui element has caused the callback invocation to take intended action in application. Crafty ui element ids (and/or values and combinations thereof) can be of good use for decoding... all up to the implementor's creativity.

Each callback is furnished with five (5) arguments: 

 1. `id` id of the invocation triggering ui element
 2. `v` current value (object) of the ui element
 3. `ui` ui singleton (to provide access for enhanced ui usage)
 4. `e` ui element (array / light weight object) itself for read and modify access. Note that when modified and modification requires a redraw - such as changing the label text or any colors, the callback has to return true / a truey value in order to make ui redraw the modified ui element which - of course - happens after completion of the callback. 
 5. `t` touch event object (for, for example, determine the position within the ui element where the touch happened... enables implementation of a freehand drawing / signing area).
 
Most callbacks need none or two arguments to fullfill their application defined duty and look therefore like these:

```JavaScript
function cb0() { // button
  // code to handle button for which and which only cb0 is the handler
}
function cb2(id,v) { // check box, radio button,...)
  // code to handle (new/changed) value of element for which cb2 is the handler
}
```

Arguments 3 thru 5 allow very elaborate application ui behavior, such as chnanging colors, labels, ui element interdependent actions as modifying / enabling / disabling ui element sets by a designated ui element, etc. The Espruino-Sky is the limit of imagination... but be careful with changing values and the use of (non-documented) internals to avoid undesired side effects. Any property can be changed. Position, size and visibility though need additional action beyond callback return value triggered re-draw. 


UI Touch and Untouch / Drag / Tap Events and Event Object - t
------------------

ui action is triggered by invoking `.evt(...)` with `x` and `y` for touch-down and touch-drag parameters and no parameters for untouch. `x` and `y` are the coordinates where the touch occurs with x on horizontal and y on vertical axis and (0,0) as left-top corner of rectangular touch screen and display area. ui maintains information to detect whether it is an initial touch - touch-down - or a drag - subsequent touch at a (different) location. ui als maintains the information of the last touch position in a touch life cycle. For further processing and convenience, a touch event object is composed with all touch life cycle pertinent information and passed around, even through the callback to the application.

The touch event object `t` and other objects, such as the `ui` / `_` and the ui element `e` themselves, are passed around for easy access of the ui element implementation as well as in the application. The touch event object has this structure:

```JavaScript
t = // (touch) event object
   { x: x // current or last touched x coordinate
   , y: y // current or last touched y coordinate
   , t: t // touching: (truey), not touching (anymore): falsy
   };
```

Note that the touch object should be used read-only in order to stay in sync with the ui framework's internal house keeping and preserve its integrity.s

 
