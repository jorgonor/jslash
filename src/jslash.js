var jslash = {};

(function() {
  jslash.Rectangle = function (x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  jslash.Rectangle.prototype.center = function(x,y) {
    var cx = (2*this.x+this.width)/2;
    var cy = (2*this.y+this.height)/2;
    if (x == undefined || y == undefined) {
      return new jslash.Point(cx,cy); 
    }
    this.x += x-cx;
    this.y += y-cy;
  };
  
  jslash.Rectangle.prototype.points = function() {
    return [ new jslash.Point(this.x,this.y), new jslash.Point(this.x+this.width,this.y),
             new jslash.Point(this.x,this.y+this.height), new jslash.Point(this.x+this.width,this.y+this.height) ];
  };

  jslash.Rectangle.prototype.collides = function(other) {
    var that = this;
    var result = this.points().some(function(pt) {
      return other.contains(pt);
    }) || 
    other.points().some(function(pt) { 
      return that.contains(pt);

    });
    return result;
  };

  jslash.Rectangle.prototype.contains = function(pt) {
   return pt.x >= this.x && pt.x <= this.x+this.width &&
             pt.y >= this.y && pt.y <= this.y+this.height;
  };

  jslash.BorderedRectangle = function() {
    jslash.Rectangle.apply(this,arguments);
  };

  jslash.BorderedRectangle.prototype = new jslash.Rectangle();

  jslash.BorderedRectangle.prototype.collides = function(other) {
    var x2 = this.x + this.width;
    var y2 = this.y + this.height;
    var ox2 = other.x + other.width;
    var oy2 = other.y + other.height;
    var r = this.x >= other.x && this.x <= ox2 ||
            this.y >= other.y && this.y <= oy2 ||
            x2 >= other.x && x2 <= ox2 ||
            y2 >= other.y && y2 <= oy2;
    return r;
  };

  jslash.Point = function(x,y) {
    this.x = x;
    this.y = y;
  };
  jslash.ById = function(id) {
    return document.getElementById(id);
  };
  jslash.Canvas = function(canvasId) {
    this._canvas = jslash.ById(canvasId);
    this.context = this._canvas.getContext('2d');
  };
  jslash.Canvas.prototype.draw = function(drawable) {
    if (drawable.onrefresh) {
      drawable.onrefresh();
    }
    if (drawable.draw) {
      drawable.draw(this.context);
    }
   
  };

  jslash.Canvas.prototype.fill = function(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0,0,this._canvas.width,this._canvas.height);
  };

  jslash.Canvas.prototype.width = function() {
    return this._canvas.width;
  };

  jslash.Canvas.prototype.height = function() {
    return this._canvas.height;
  };

  function BaseSprite() {
  }

  BaseSprite.prototype.center = function(x,y) {
    var r = this._canvasSubrect.center(x,y);
    if (r != undefined) { //getter called
      return r;
    }
    this.x = this._canvasSubrect.x;
    this.y = this._canvasSubrect.y;
  };
  BaseSprite.prototype.height = function() {
    return this.canvasRect().height;
  };
  BaseSprite.prototype.width = function() {
    return this.canvasRect().width;
  };

  jslash.Sprite = function(img,position) {
    this._img = img;
    if (position) {
      this.x = position.x; this.y = position.y;
    }
    else { this.x = this.y = 0; }
    this._canvasSubrect = new jslash.Rectangle(this.x || 0,this.y || 0, img.width,img.height);
    this._imageSubrect = new jslash.Rectangle(0,0,img.width,img.height);
    this._useRects = false;
  };

  function extend(func,toExtend) {
    var ctor = func.prototype.constructor;
    func.prototype = toExtend;
    func.prototype.constructor = ctor;
  }

  extend(jslash.Sprite,new BaseSprite());

  jslash.Sprite.prototype.image = function() {
    return this._img;
  };

  jslash.Sprite.prototype.imageRect = function(arg) {
    if (arg == undefined) {
      return this._imageSubrect;
    }
    this._imageSubrect = arg;
  };

  jslash.Sprite.prototype.canvasRect = function(arg) {
    if (arg == undefined) {
      return this._canvasSubrect;
    }
    this._canvasSubrect = arg;
    this.x = this._canvasSubrect.x;
    this.y = this._canvasSubrect.y;
  };

  jslash.Sprite.prototype.position = function(x,y) {
    if (!x || !y) {
      return new jslash.Point(this.x,this.y);
    }
    this.x = x; this.y = y;
    this._canvasSubrect.x = x;
    this._canvasSubrect.y = y;
  };

  jslash.Sprite.prototype.useRects = function(arg) { 
    if (arg == undefined) {
      return this._useRects; 
    }
    this._useRects = arg;
  }; 

  jslash.Sprite.prototype.scale = function(factor) {
    var sr = this._canvasSubrect;
    sr.width *= factor;
    sr.height *= factor;
    this._canvasSubrect = sr;
    this._useRects = true;
  };
  
  function imageDraw(ctx) { 
     if ( this.useRects && this.useRects() ) {
        var imgRect = this.imageRect();
        var cvsRect = this.canvasRect();
        try {
          ctx.drawImage(this.image(), 
                                 imgRect.x,imgRect.y,imgRect.width,imgRect.height,
                                 cvsRect.x,cvsRect.y,cvsRect.width,cvsRect.height);
        } catch(ex) {
          console.log(ex);
          console.log(imgRect);
          console.log(cvsRect);
        }
      
    }
    else {
      ctx.drawImage(this.image(),this.x,this.y);
    }

  }

  jslash.Sprite.prototype.draw = imageDraw;
  

  jslash.Frame = function(img,sr) {
    this._img = img;
    this._subrect = sr;
  };

  jslash.Frame.prototype.image = function() {
    return this._img;
  };
  
  jslash.Frame.prototype.rect = function() {
    return this._subrect;
  };

  jslash.AnimatedSprite = function(frames) {
    this._frames = frames;
    this._currentFrame = 0;
  };
  
  extend(jslash.AnimatedSprite,new BaseSprite());


  jslash.AnimatedSprite.prototype.next = function() {
    this._currentFrame = (this._currentFrame + 1) % this._frames.length;
  };

  jslash.AnimatedSprite.prototype.image = function() {
    return this._frames[this._currentFrame].image();
  };

  jslash.AnimatedSprite.prototype.imageRect = function() {
    return this._frames[this._currentFrame].rect();
  };
  
  jslash.AnimatedSprite.prototype.canvasRect = function(arg) {
    if (arg == undefined) {
      if (this._canvasSubrect == undefined) {
        return this._frames[this._currentFrame].rect();
      }
      return this._canvasSubrect;
    }
    this._canvasSubrect = arg;
  };

  jslash.AnimatedSprite.prototype.draw = imageDraw;

  jslash.AnimatedSprite.prototype.position = function(x,y) {
    if (!x || !y) {
      var r = this.canvasRect();
      return new jslash.Point(r.x,r.y);
    }
    if (this._canvasSubrect == undefined) {
      this.canvasRect(jslash.deepcopy(this.canvasRect()));
    }
    this._canvasSubrect.x = x;
    this._canvasSubrect.y = y;
  };

  jslash.AnimatedSprite.prototype.useRects = function() { return true; };
  
  jslash.Text = function(txt,x,y) {
    this.text = txt || "";
    this.font = "Arial";
    this.color = "black";
    this.size = 12;
    this.x = x || 0; this.y = y || 0;
  };

  jslash.Text.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.font = [this.size,this.font].join(" ");
    ctx.fillText(this.text,this.x,this.y+this.size);
  };

  jslash.Text.prototype.width = function(canvas) {
    var ctx = canvas.context;
    ctx.fillStyle = this.color;
    ctx.font = [this.size,this.font].join(" ");
    return ctx.measureText(this.text).width;
  };

  jslash.Text.prototype.height = function() {
    return this.size;
  };

  /* jslash private control variables */
  var privIntId;
  var lastTime;
  var keyEvents = {};
  var keyEventHandlerDispatched;
  
  /* jslash CONSTANTS */
  jslash.KEYS = {
    UP:38, LEFT:37, RIGHT:39, DOWN:40,
    TAB:9, SHIFT:16, CTRL:17, ALT:18,
    SPACE:32,ALTGR:0,LT:188, '<':188,GT:190, '>': 190, 
    SLASH: 191, '/': 191, '"': 222, DBLQUOTE: 222, '!': 49, '(': 57, ')': 48, '=':187, EQUAL: 187,
    '0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57,
    ENTER: 13, BACKSPACE: 8, ESCAPE: 27, ESC: 27, SUPR: 46, REPAG: 33,
    AVPAG: 34, START: 36, END: 35, NUMLOCK: 144, UPPERLOCK: 20,
    A: 65, a: 65,
    B: 66, b: 66,
    C: 67, c: 67,
    D: 68, d: 68,
    E: 69, e: 69,
    F: 70, f: 70,
    G: 71, g: 71,
    H: 72, h: 72,
    I: 73, i: 73,
    J: 74, j: 74,
    K: 75, k: 75,
    L: 76, l: 76,
    M: 77, m: 77,
    N: 78, n: 78,
    O: 79, o: 79,
    P: 80, p: 80,
    Q: 81, q: 81,
    R: 82, r: 82,
    S: 83, s: 83,
    T: 84, t: 84,
    U: 85, u: 85,
    V: 86, v: 86,
    W: 87, w: 87,
    X: 88, x: 88,
    Y: 89, y: 89,
    Z: 90, z: 90,
  };

  jslash.fps = 30;
  
  /* jslash methods */

  jslash.start = function(mycanvas) {
    if (this.onclear == undefined) {
      this.onclear = function() {
        mycanvas.fill("#000000");
      };
    }
    this.borders = new jslash.BorderedRectangle(0,0,mycanvas.width(),mycanvas.height());
    lastTime = new Date().getTime();
    var that = this;
    privIntId = setInterval(function() {
      if (that.onupdate) {
        var t = new Date().getTime();
        //onupdate receives the time difference (dt) between frames 
        that.onupdate(t-lastTime);
        lastTime = t;
      }
      that.onclear();
      if (that.onrefresh) {
        that.onrefresh();
      }
    },1000.0/jslash.fps);
  };

  jslash.stop = function() {
    if (privIntId) {
      clearInterval(privIntId);
    }
  };

  jslash.deepcopy = function(other) {
    var nw = new other.constructor();
    for(var property in other) {
      if (other.hasOwnProperty(property)) {
        nw[property] = other[property];
      }
    }
    return nw;
  };

  jslash.mix = function(object,mixin) {
    for(var property in mixin) {
      if (mixin.hasOwnProperty(property)) {
        object[property] = mixin[property];
      }
    }
  };

  function checkKeydownAdded() { 
    if (!keyEventHandlerDispatched) {
      window.addEventListener('keydown',function(evt) {
          if (evt.keyCode in keyEvents) {
            keyEvents[evt.keyCode].forEach(function(f) { f(); });
          }
      },true);
      keyEventHandlerDispatched = true;
    }
  }

  jslash.addKeyEvent = function(key,func) {
    if (!(key in keyEvents)) {
      keyEvents[key] = [];
    }
    keyEvents[key].push(func);
    checkKeydownAdded();
   };

  jslash.prefetchImg = function(arg) {
    if (this.images == undefined) {
      this.images = {};
    }
    if (typeof arg == 'string' ) {
      arg = [arg];
    }
    var that = this;
    arg.forEach(function(e) { var i = new Image(); i.src = e; that.images[e] = i; });
  };

  jslash.properties = function(object) {
    var prop = [];
    for(var property in object) {
      if (object.hasOwnProperty(property)) {
        prop.push(property);
      }
    }
    return prop;
  };

  jslash.values = function(object) {
    return this.properties(object).map(function(e) {return object[e];});
  };

  jslash.sliceImg = function(img,rect) {
    var frames = [];
    for(var y = rect.y; y < img.height; y+= rect.height) {
      for(var x = rect.x; x < img.width; x += rect.width) {
        frames.push(new this.Frame(img,new this.Rectangle(x,y,rect.width,rect.height)));
      }
    }
    return frames;
  };

  jslash.ready = function(func) {
    window.addEventListener('load',func,true);
  }

  /* behaviors */
  var behaviors = {};
  
  /* behaviors private funcs */
  var move = function(dt) {
    var x,y;
    var p = this.position();
    x = p.x; y = p.y;
    x += this.speed.x * dt / 1000.0;
    y += this.speed.y * dt / 1000.0;
    this.position(x,y);
  };

  var collides = function(other) {
    var left = this._boundProperty ? this[this._boundProperty] : this;
    var right = other._boundProperty ? other[other._boundProperty] : other;
    left = typeof left != 'function' ? left : left.apply(this);
    right = typeof right != 'function' ? right : right.apply(other);
    return left.collides(right);
  };

  behaviors.Moveable = function(x,y) {
    this.speed = {'x': x, 'y': y};
    this.move = move;
  };

  behaviors.Collidable = function(morph,property) {
    this.morph = morph;
    this._boundProperty = property;
    this.collides = collides;
  };

  jslash.behaviors = behaviors;
})();

