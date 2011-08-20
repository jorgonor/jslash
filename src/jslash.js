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
        ctx.drawImage(this.image(), 
                               imgRect.x,imgRect.y,imgRect.width,imgRect.height,
                               cvsRect.x,cvsRect.y,cvsRect.width,cvsRect.height);
    }
    else {
      ctx.drawImage(this.image(),this.x,this.y);
    }

  }

  jslash.Sprite.prototype.draw = imageDraw;
  
  jslash.Sprite.prototype.center = function(x,y) {
    var r = this._canvasSubrect.center(x,y);
    if (r != undefined) { //getter called
      return r;
    }
    this.x = this._canvasSubrect.x;
    this.y = this._canvasSubrect.y;
  };

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
      if (!this._canvasRect) {
        return this._frames[this._currentFrame].rect();
      }
      return this._canvasRect;
    }
    this._canvasRect = arg;
  };

  jslash.AnimatedSprite.prototype.draw = imageDraw;

  jslash.AnimatedSprite.prototype.position = function(x,y) {
    if (!x || !y) {
      return new jslash.Point(this._canvasRect.x,this._canvasRect.y);
    }
    this._canvasRect.x = x;
    this._canvasRect.y = y;
  };

  jslash.AnimatedSprite.prototype.useRects = function() { return true; };
  
  /* jslash private control variables */
  var privIntId;
  var lastTime;
  var keyEvents = {};
  var keyEventHandlerDispatched;
  

  /* jslash methods */
  jslash.fps = 30;

  jslash.onclear = function() {
    jslash.canvas.fill("#000000");
  };
  jslash.start = function(mycanvas) {
    jslash.canvas = mycanvas;
    jslash.borders = new jslash.BorderedRectangle(0,0,jslash.canvas.width(),jslash.canvas.height());
    lastTime = new Date().getTime();
    privIntId = setInterval(function() {
      if (jslash.onupdate) {
        var t = new Date().getTime();
        //onupdate receives the time difference (dt) between frames 
        jslash.onupdate(t-lastTime);
        lastTime = t;
      }
      jslash.onclear();
      if (jslash.onrefresh) {
        jslash.onrefresh();
      }
    },1.0/jslash.fps);
  };

  jslash.stop = function() {
    if (privIntId) {
      clearInterval(privIntId);
    }
  };

  jslash.deepcopy = function(other) {
    var nw = other.constructor.apply({});
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
    if (typeof arg == 'string' ) {
      new Image().src = arg;
    }
    else {
      arg.forEach(function(e) { new Image().src = e; } );
    }
  };

  /* behaviors */
  var behaviors = {};

  behaviors.Moveable = function(x,y) {
    this.speed = {'x': x, 'y': y};
    this.move = function(dt) {
      var x,y;
      var p = this.position();
      x = p.x; y = p.y;
      x += this.speed.x * dt / 1000.0;
      y += this.speed.y * dt / 1000.0;
      this.position(x,y);
    };
  };


  jslash.behaviors = behaviors;
})();

