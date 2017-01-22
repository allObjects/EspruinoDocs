/* Copyright (c) 2016 markus muetschard, muet.com - See the file LICENSE for copying permission. */
/*

----- uiChk ------------------------- 137 vars

ui checkbox module - extends ui base with checkbox ui element.

--- Enable ui with uiChk element and create a checkbox:

```
var ui = require("ui")       // load ui base module
 　　  .add(require("uiChk")) // add uiChk module into base and remove from cache
      ;
ui.c(3,"chk","c01",140,45,25,0,4,7,"H"
                  ,function(id,v){ (v) ? LED2.set() : LED2.reset() }
                  ,[12,7,3,5,"On"]);
```  

Creates, adds to ui, conditionally displays and returns an active(2), visible(1) =(3)
checkbox ("chk") with id "c01". Checkbox is positioned at 145 @ 40 (left @ top, x @ y)
and sized 25 (both width and height), has 4(green) / 7(white) border / fill colors,
is initially unchecked (0), has value object "H" (when checked and undefined when
unchecked), has callback that sets and resets green LED2 accordingly, and is labeled
"On" in fontVector (size) 12, font color 7(white) and x / y-offset 3 / 5.

For ui base, color, label, and callback details see also ui base module.

chk ui element constructor arguments and runtime data structure are:

```
arg runtime 'object' instance of 'clazz' chk (chkbox)
a[]  e[]
 0   [0] flags focus(4), active(2), visible(1)
 .    .    0bxx1 visible  &1 visible 
 .    .    0bx1x active   &2 active / senses touch down (vs. read/display-only)
 .    .    0b1xx focus    &4 focus (by touchdown or drag in/over)  
 1   [1] clazz - "chk"
 2   [2] id - eg "c01", short, null or at least 3 chars, and ui globally unique
              Single letter ui element id's are 'reserved' (for keyboard(s)).
 3   [3] x  - x ((left ) of focus / touch bounding box)
 4   [4] y  - y ((top  ) of focus / touch bounding box)
 5       w  - width and hight (of focus / touch box,... 
     [5] x2 - x ((right) of focus / touch bounding box: x - w + 1)
 6       s  - initial checked(truey/1)/unchecked(falsy/0) state used w/ [9] value info
     [6] y2 - y ((bot  ) of focus / touch bounding box: y - h + 1)
 7   [7] bc - border color
 8   [8] fc - fill color
 9       v  - value (returned value when checked)
     [9] vi - value info array w/ state and value [truy/falsy=set/checked, value object]
         [0] - truy/falsy indicating state checked/unchecked state of checkbox
         [1] - value object (returned when checkbox is checked)
10  [10] cb - callback on untouch after touchdown w/ args (id, value, ui, e/btn, t/event)
11  [11] l  - label (info), array with:
      l[0]  fv - fontVector (size)
      l[1]  tc - (label) text color (index)
      l[2]  x  - x offset from focus box x ( bounding box left )
      l[3]  y  - y offset from focus box y ( bounding box top  )
      l[4]  tx - label text to display (using .drawString())
```

chk - checkbox ui element methods (like prototype to mix into ui base):
 */
exports = // "chk" (checkbox) 'clazz' name
{ mn: "uiChk" // module name - globally unique (used to remove code from cache)
, chkC:    function (f, c, i, x, y, w,     s,     bc, fc,  v,  cb,  l) { // constructor
// ----------> chk e[0  1  2  3  4  5(x2)  6(y2)   7   8   9   10  11] - similar to args
    return this.rdc([f, c, i, x, y, x+w-1, y+w-1, bc, fc,[!!s,v],cb,l]); } // runtime obj
, vs2: function(x,y,x2,y2,p) { // vertices for for chk like shapes ('beveled') corners
    // 4 'beveled corners' = 8 corners defined by 0 and p insetting combinations for x, y
    return [x,y+p, x+p,y, x2-p,y, x2,y+p, x2,y2-p, x2-p,y2, x+p,y2, x,y2-p]; }
, chkG: function(e) { return (e[9][0]) ? e[9][1] : undefined; } // get chk VALUE (!state) 
, chkU: function(_,e,t,s,p) { var c=!!s; if (e[9][0]!==c) {
      e[9][0]=c; if ((e[0]&1) && _.di) { _.chkDu(_,e[3],e[4],e[5],e[6],e[7],e[8],c,1); }
      if (p) { if (e[10] && e[10](e[2],_.chkG(e),_,e,t)) { _.d(e); } } } }
, chkD: function(f,c,i,x,y,x2,y2,bc,fc,vi,cb,l) { if (f&1) { var m=2, p=3, _=this;
    _.clr(bc).dsp.fillPoly(_.vs2(x+m,y+m,x2-m,y2-m,p));
    _.chkDu(_,x,y,x2,y2,bc,fc,vi[0],fc!==bc);
    if (l) { _.ld(x2,y,l); } } }
, chkDu: function(_,x,y,x2,y2,bc,fc,s,b) { var m=5, p=2, f=2, i=3, c;
    if (b) {_.clr(fc).dsp.fillPoly(_.vs2(x+m,y+m,x2-m,y2-m,p)); }
    if (s) { if (fc===bc) { _.clr(fc,1); } else { _.clr(bc); } c=i+f*2; f=i+f;
      _.dsp.fillPoly([x+f,y+c , x2-c,y2-f, x2-f,y2-c, x+c,y+f ]);
      _.dsp.fillPoly([x+f,y2-c, x2-c,y+f , x2-f,y+c , x+c,y2-f]); } }
, chk: function(_,e,t) { // chk event (flip when touched down, had focus (before)...
    if ((e===_.ef) && !t.t) { _.chkU(_,e,t,!e[9][0],1); } } // ... and is now released
};
