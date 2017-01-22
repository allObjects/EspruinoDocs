/* Copyright (c) 2016 markus muetschard, muet.com - See the file LICENSE for copying permission. */
/*

----- uiBtn ------------------------- 91 vars

ui button module - extends ui base with ui button element.

Enable ui base with uiBtn element and create a button:

```
var ui = require("ui")       // load ui base module
 　　  .add(require("uiBtn")) // add uiBtn module into base and remove from cache
      ;
ui.c(3,"btn","b01",10,20,50,30,4,7,"B_1"
                  ,function(){ (LED1.read()) ? LED1.reset() : LED1.set() }
                  ,[20,0,5,15,"RED"]);
```

Creates, adds to ui, conditionally displays and returns an active(2), visible(1) =(3)
button ("btn") with id "b01". Button is positioned at 10 @ 20 (left @ top,  x @ y)
and is sized 50 x 30 (width x height), has 4(red) / 7(white) border/fill colors, has
value object string "B_1", has (arguments ignoring) callback that toggles red LED1,
and is labeled "RED" in fontVector (size) 20, font color 0 (black) and x / y-offset
of 5 / 15.

Note: A button with border and fill colors equal to display background color (ui.bc)
creates a tap-able area that is useful to make anything, such as a displayed image,
to act like a button...

For ui base, color, label, and callback details see also ui base module. ui base
module includes also a complete working example with two buttons.

uiBtn can be changed within callback: for example in example above, the label can be
changed to indicate whether tapping will turn the LED on or off. In order to make the
ui framework redraw the button and make the label change visible, the callback has to
return truey ('JS true'). The button / callback definition for label changing button look
like this:

```
ui.c(3,"btn","b01",10,20,50,30,4,7,"B_1"
                  ,function(id, v, ui, e, t){
                     if (LED1.read()) {
                       LED1.reset();
                       e[11][4] = "RED on";
                     } else {
                       LED1.set(); 
                       e[11][4] = "RED off";
                     }
                     return true;
                   }
                  ,[20,0,5,15,"RED on"]);
```

btn ui element constructor arguments and runtime data structure are:

```
arg runtime 'object' instance of 'clazz' button
a[]  e[]
 0   [0] f  - flags focus(4), active(2), visible(1)
 .    .         0bxx1 visible  &1 visible 
 .    .         0bx1x active   &2 active / senses touch down (vs. read/display-only)
 .    .         0b1xx focus    &4 focus (by touchdown or drag in/over)  
 1   [1] c  - clazz "btn"
 2   [2] i  - id eg "b01", short, null or at least 3 chars, and ui globally unique.
              Single letter ui element id's are 'reserved' (for keyboard(s)).
 3   [3] x  - x ((left ) of focus / touch bounding box)
 4   [4] y  - y ((top  ) of focus / touch bounding box)
 5       w  - width (of focus / touch box,... 
     [5] x2 - x ((right) of focus / touch bounding box: x - w + 1)
 6       h  - height (of focus / touch box,...
     [6] y2 - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc - border color
 8   [8] fc - fill color
 9   [9] v  - value - any object, from simple string to number to complex { } object
10  [10] cb - callback on untouch after touchdown w/ args (id, value, ui, e/btn, t/event)
11  [11] l  - label (info), array with:
      l[0]  fv - fontVector (size)
      l[1]  tc - (label) text color (index)
      l[2]  x  - x offset from focus box x ( bounding box left )
      l[3]  y  - y offset from focus box y ( bounding box top  )
      l[4]  tx - label text to display (using .drawString())
```

btn - button ui element methods (like prototype to mix into ui base):
 */
exports = // "btn" (button) 'clazz' name
{ mn: "uiBtn" // module name - globally unique (used to remove code from cache)
, btnC:    function (f, c, i, x, y, w,     h,     bc, fc,  v,  cb,  l) { // constructor
// ----------> btn e[0  1  2  3  4  5(x2)  6(y2)   7   8   9   10  11] - same as arguments
    return this.rdc([f, c, i, x, y, x+w-1, y+h-1, bc, fc,  v,  cb,  l]); } // runtime obj
, vs3: function(x,y,x2,y2,p,q) { // return vertices for btn like shapes ('round' corners)
    // 12 'round corners' (4x3) defined by 0, p and q insetting combinations for x and y 
    return [ x,y+q,   x+p,y+p,   x+q,y, x2-q,y, x2-p,y+p, x2,y+q,
            x2,y2-q, x2-p,y2-p, x2-q,y2, x+q,y2, x+p,y2-p, x,y2-q]; }
, btnD: function(f,c,i,x,y,x2,y2,bc,fc,v,cb,l) { // D(isplay of) btn (ui elt incl. label)
    if (f&1) { var _=!f||this, p=Math.ceil((Math.min(x2-x,y2-y)-3)/20), m=2, b=_.bc;
      if ((bc!==fc)&&(bc!==b)) { _.clr(bc).dsp.fillPoly(_.vs3(x+m,y+m,x2-m,y2-m,p,p*3)); 
        m=5; p=Math.ceil(p-p/m); } if ((fc!==b)&&(bc!==b)) {
      _.clr(fc).dsp.fillPoly(_.vs3(x+m,y+m,x2-m,y2-m,p,p*3)); }
      if (l) { _.ld(x,y,l); } } }
, btn: function(_,e,t) { // touch event on btn ui element
    if (e===_.ef && !t.t) { // touched down, had focus (before) and is now released
      if (e[10] && e[10](e[2], e[9], _, e, t)) { _.d(e); }; } }
};
