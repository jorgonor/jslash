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
    this.canvas = jslash.ById(canvasId);
    this.width = this.canvas.width;
    this.height =  this.canvas.height;
    this.context = this.canvas.getContext('2d');
  };
  jslash.Canvas.prototype.draw = function(drawable) {
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
    this.context.fillRect(0,0,this.width,this.height);
  };

  jslash.Sprite = function(img,position) {
    this.img = img;
    this.imageSubrect = new jslash.Rectangle(0,0,img.width,img.height);
    if (position) {
      this.x = position.x;
      this.y = position.y;
    }
    else {
      this.x = this.y = 0;
    }
    this.subrect = new jslash.Rectangle(this.x || 0,this.y || 0, img.width,img.height);
    this.putOnRects = false;
  };
  jslash.Sprite.prototype.image = function() {
    return this.img;
  };
  jslash.Sprite.prototype.imageRect = function(arg) {
    if (arg == undefined) {
      return this.imageSubrect;
    }
    this.imageSubrect = arg;
  };
  jslash.Sprite.prototype.canvasRect = function(arg) {
    if (arg == undefined) {
      return this.subrect;
    }
    this.subrect = arg;
  };
  jslash.Sprite.prototype.useRects = function(arg) { 
    if (arg == undefined) {
      return this.putOnRects; 
    }
    this.putOnRects = arg;
  }; 

  jslash.Sprite.prototype.scale = function(factor) {
    var sr = this.subrect;
    sr.width *= factor;
    sr.height *= factor;
    this.subrect = sr;
    this.putOnRects = true;
  };
  
  /* jslash methods */

  var privIntId;

  jslash.fps = 30;

  jslash.onclear = function() {
    jslash.canvas.fill("#000000");
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
