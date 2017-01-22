/* Copyright (c) 2016 markus muetschard, muet.com - See the file LICENSE for copying permission. */
/*

----- ui ------------------------- 253 vars

modular and extensible ui framework - base module

The Graphical UI Framework Base takes care of most of the plumbing and data flow
between touch screen (or physical buttons) and display as input and output components. 
Some UI elements can be used as output - read-only - ui elements only for just displaying
values in characters or otherwise.

ui usage example with uiBtn ui element extended (SPI1/2 and pins related to PICO):

```
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
    touch.listen();        // not applicable for ADS7843 / Touchscreen modules
  });
} // /onInit()
onInit(); // while developing only (not part of code to save)
```

 */
exports = // ui base / 'DOM/ui e(lement) data & code holder, singleton, for mixins)
{ dsp: null // display (Espruino Graphics object)
, mn: "ui"  // reserved, used temporary
, bc: 0     // dsp background color r*g*b* bit coded; <0: looked up [R,G,B], or [R,G,B]
, tc: 7     // touch / focus color r*g*b* bit coded; <0: looked up [...,[R,G,B],...]
, di: false // display instantly on create/change (not defer until after save())
, es: []    // ui elements
, ef: null  // (ui) element (in) focus
, lf: null  // (ui element) last (in) focus
, it: false // (display) is touched
, td: false // is touch down (event)
, tt: 0     // touch down time
, lx: 0     // last x (touched)
, ly: 0     // last y (touched)
, dx: -1    // (last) x (touch) down
, dy: -1    // (last) y (touch) down
, te: {t:0} // (last) touch event
, clrs:     // default - bit coded color of 1 bit color-depth - 2^1^3(rgb) = 8 colors
    [function(c,i){ var v=(i)?c^7:c; return [v>>2&1,v>>1&1,v&1]; }.bind(exports)
    ]
, evt: function(x,y,_) { // common handling of touch / untouch / tap event
    _=_||this; var a=_.es, i=-1, m=a.length, e=_.ef, t={t:undefined!==x}; _.te=t;
    if (_.td = !_.it && t.t) { _.dx=x; _.dy=y; _.tt=getTime(); } // touch down
    if (_.it=t.t) { _.lx=t.x=x; _.ly=t.y=y; // touching
      if (e) { if (_.iib(e,x,y)) { return _[e[1]](_,e,t); } // xy event/move in focus elt
        _.blr(e) } // just moved out
      while (++i<m) { if (((e=a[i])[0]&2) && _.iib(e,x,y)) { // loop through active elts
        if (!(e[0]&4) && (_.td || (t.t && (e===_.lf)))) { _.foc(e); } // adj focus
        _[e[1]](_,e,t); return; } } if (_.td) { _.lf=null; } // handle hit / miss
    } else { if (e) { t.x=_.lx; t.y=_.ly; // untouch
      if (!_[e[1]](_,e,t)) { _.blr(e); } _.lf=null; _.dx=_.dy=-1; } } }
, iib: function(e,x,y) { // (if x y) is in (element bounding) box return true, else false)
    return ((x>=e[3])&&(y>=e[4])&&(x<=e[5])&&(y<=e[6])); }
, foc: function(e,_) { // focus elt (unfocus elt in focus); visual: draw rectangle in...
    _=_||this; if (e!==_.ef) { if (_.ef) { _.blr(_.ef); } // ...touch color around elt
    _.clr(_.tc).dsp.drawRect(e[3],e[4],e[5],e[6]); e[0]|=4; _.ef=_.lf=e; }
    return _; }
, blr: function(e,_) { // blur elt (all if e falsy); visual: draw rectangle in display...
    _=_||this; _.clr(_.bc); (e?[e]:_.es).forEach(function(e){ // ...background clr around 
        if (e[0]&4) { _.dsp.drawRect(e[3],e[4],e[5],e[6]); e[0]&=3; } }); _.ef=null;
    return _; }
, rdc: function(e) { // register ui element, draw/display it conditionally, and return it
    this.es.push(e); if (((e[0]&=7)&1) && this.di) { this.d(e); }
    return e; }
, w: function(x,y,x2,y2,c) { // wipe rectangle (fill w/ c(olor) or display backgrnd color)
    this.clr((c===undefined)?this.bc:c); this.dsp.fillRect(x,y,x2,y2); return this; }
, c: function() { // c(reate) ui element like DOM.createElement(), where arguments[1]...
    // ...defines ui element clazz and points to ui element specific constructor method
    var a=arguments, c=this[a[1]+"C"]; if (c) {
    return c.apply(this,a); } }  // undefined ui classes returns undefined as ui element
, d: function(e) { // display / redraw ui element e, redraw all if e falsy
    ((e)?[e]:this.es).forEach(function(e){ if (e[0]&1) this[e[1]+"D"].apply(this,e); },this);
    return this; }
, clr: function(c,i) { // set color according this.clrs[0](c,i) (customizable) function...
    this.dsp.setColor.apply(this.dsp,this.clrs[0](c,i)); // ...w/ color and i-nverse flag
    return this; }
, fnt: function(s) { // set displays's font vector (font size)
    this.dsp.setFontVector(s);
    return this; }
, ld: function(x,y,l) { // draw label (x, y, label[fv, tc, x, y, txt])
    this.fnt(l[0]).clr(l[1]).dsp.drawString(l[4],x+l[2],y+l[3]); }
, add: function(emon, k) { // add (mixin) non-overwriting properties of ui element by... 
    // eltModuleOrName for modularization and extensibility. Remove module from cache...
    var p, // ...when not k(eep) by element module name - if defined - to save space
    m = ("string" === typeof emon) ? require(emon) : emon; for (p in m) { if ((p!=="mn")
    &&!this[p]) { this[p] = m[p]; } } // merge / mixin properties 'new' (vars, functions)
    if (!k) { Modules.removeCached(m.mn); } // delete module from cache when not k(eep)
    return this; }
, connect: function(dsp) { // connects w/ initialized Espruino Grapics obj (after save()) 
    this.dsp=dsp;
    return this; }
};
