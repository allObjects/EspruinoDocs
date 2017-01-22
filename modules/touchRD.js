/* Copyright (c) 2016 markus muetschard, muet.com - See the file LICENSE for copying permission. */
/*

// Module for connecting resistive touch screen directly (passive X- X+ Y- Y+)

// Basic / regular use:
// var touch = require("touchRD").connect(A7, A6, A5, A3, function(x,y,t){
//   if (x !== undefined) { console.log(x,y); } else { console.log("up"); }
//   console.log(t); // dumps whole touch (sensor) object
//  }).listen(true); 

// Probe use:
// .xy() when NOT listening (!touch.l - set with touch.listen(false);):
// if (touch.xy().t) console.log(touch.x, touch.y, touch.xr, touch.yr);

// default is portrait; landscape: transform x and y as 1st thing in cb: 
// x = t.y; y = t.XH - t.x; // 90 degrees cc-wise turned

// .connect(yp, xp, yn, xn, cb(x,y,touch),C{onfig},baseC{onfig})  
// .listen(boolean): start/stop listening to touches
// .xy(optCallback): read xy (ONLY when NOT listening)
// ...all methods returning touch controller
// Config and baseConfig objects are optional (falsy - absent/undefined
// and null are detected and interpreted as being absent and w/o impact.

// Config object properties for overriding (defaults):
// (data types and defaults) in parenthesis for adafruit's
// IL8341 2.8" TFT LCD with resistive touch screen:
// X:  (# 240) horizontal resolution in pixels or units
// Y:  (# 320) vertical resolution in pixels or units
// XL: (#   9) x minimum (low) returned, usually 0
// XH: (# 239) x maximum (high) returned, usually X - 1 
// YL: (#   0) y minimum (low) returned, usually 0
// YH: (# 319) y maximum (high) returned, usually Y - 1 
// xt: (# 0.0015) x touch / 'untouch' detection threshold
// yt: (# 0.0012) y touch / 'untouch' detection threshold
// xc: (# 0) x analog read value at center
// yc: (# 0) y analog read value at center
// xd: (# 0) x delta per pixel or resolution unit.
// yd: (# 0) y delta per pixel or resolution unit.
// i:  (# 100) track intervall when touching in [ms]
// cb: callback(x,y,touch), x === undefined for 'untouch' event
// Note1 these are properties the application can modify anytime
// NOTE2 cb (callback) can be part of Config
// NOTE3 cb in Config wins over callback argument in connect
// NOTE4 xt,yt threshold for touch detection, > 0, <= xd, ud 

// Other properties of the touch controller
// (read-only to application but part of default or base config):
// (data types and default value in parenthesis):
// xr: x read raw (# 0), [0..1.000) 0-including, 1-excluding
// yr: y read raw (# 0), [0..1.000) 0-including, 1-excluding
// x: x touching (# 0) [XL..XH]
// y: y touching (# 0) [YL..YH]
// t: touching (boolean false) true when touch above threshold
// l: listening (boolean false) 
// w: watch id (null or #) null, 1...

*/

var baseC =
  { X: 240
  , Y: 320
  , XL: 0
  , XH: 239
  , YL: 0
  , YH: 319
  , xt: 0.0015
  , yt: 0.0012
  , xc: 0.4960
  , yc: 0.4795
  , xd: 0.00318
  , yd: 0.00251
  , ti: 100
  , xr: 0
  , yr: 0
  , x: 0
  , y: 0
  , t: false
  , l: true
  , w: null
  };

function TouchRD(yp, xp, yn, xn, cb, C, BC) {
  this.xn = xn;
  this.xp = xp;
  this.yn = yn;
  this.yp = yp;
  this.cb = cb;
  for (var bv in BC) this[bv] = BC[bv];
  if (C) { for (var v in C) this[v] = C[v]; }
}

TouchRD.prototype.xy = function(cb, l, _) {
  _ = _ || this;
  pinMode(_.yn,"input_pulldown");
  pinMode(_.yp); _.yp.read();
  pinMode(_.xn); pinMode(_.xp);
  digitalWrite([_.xn,_.xp],2);
  _.xr = (analogRead(_.yp)+analogRead(_.yp))/2;
  pinMode(_.xn,"input_pulldown");
  _.xp.read();
  pinMode(_.yn);
  digitalWrite([_.yn,_.yp],2);
  _.yr = (analogRead(_.xp)+analogRead(_.xp))/2;
  _.yn.read(); _.yn.read(); 
  if ((_.t = (_.xr>=_.xt && _.yr>=_.yt))) {
    _.x = ((_.x = Math.round(_.X/2+(_.xr-_.xc)/_.xd)-1) 
      <_.XL) ? _.XL : (_.x<=_.XH) ? _.x : _.XH;
    _.y = ((_.y = Math.round(_.Y/2+(_.yr-_.yc)/_.yd)-1) 
      <_.YL) ? _.YL : (_.y<=_.YH) ? _.y : _.YH;
    if (!l && cb) { cb(_.x, _.y, _); }
  } else if (!l && cb) { cb(undefined, undefined, _); }
  return _;
};
TouchRD.prototype.trk = function(e, _) {
  _ = _ || this;
  _.w = null;
  if (_.xy(_.cb, false, _).t && _.l) {
    setTimeout(_.trk, _.ti, _, _);
  } else {
    _.listen(_.l, _);
} };
TouchRD.prototype.listen = function(b, _) {
  _ = _ || this;
  _.l = !!((b === undefined) || b);
  if (_.l && !_.w) {
    pinMode(_.xn,"input_pulldown");
    pinMode(_.xp); _.xp.read();
    pinMode(_.yn); pinMode(_.yp);
    digitalWrite([_.yn,_.yp],3);
    _.w = setWatch(_.trk.bind(_), _.xp
                  , {edge:"rising", repeat:false});
  } else {
    _.w = _.w && clearWatch(_.w);
    _.yn.read(); _.yn.read(); 
  } return _;
};

exports =
{ connect: function(yp, xp, yn, xn, cb, C, bC) {
    return new TouchRD(yp, xp, yn, xn, cb, C, bC || baseC); }
};
