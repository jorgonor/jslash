var jslash = {};

(function() {
  jslash.Rectangle = function (x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  jslash.Rectangle.prototype.center = function() {return new jslash.Point((2*this.x+this.width)/2,(2*this.y+this.height)/2); };
  
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
    if ( drawable.useRects && drawable.useRects() ) {
        var imgRect = drawable.imageRect();
        var cvsRect = drawable.canvasRect();
        this.context.drawImage(drawable.image(), 
                               imgRect.x,imgRect.y,imgRect.width,imgRect.height,
                               cvsRect.x,cvsRect.y,cvsRect.width,cvsRect.height);
    }
    else {
      this.context.drawImage(drawable.image(),drawable.x,drawable.y);
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
      this.x = position.x;
      this.y = position.y;
    }
    else {
      this.x = this.y = 0;
    }
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

  jslash.AnimatedSprite.prototype.useRects = function() { return true; };
  
  /* jslash methods */

  var privIntId;

  jslash.fps = 30;

  jslash.onclear = function() {
    jslash.canvas.fill("000000");
  };
  jslash.start = function(mycanvas) {
    jslash.canvas = mycanvas;
    privIntId = setInterval(function() {
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
})();
