var jslash = {};

(function() {

  /* POO helpers */

  //TODO: document this method
  function extend(func,toExtend) {
    var ctor = func.prototype.constructor;
    func.prototype = toExtend;
    func.prototype.constructor = ctor;
  }

  /* Exceptions */

  function NotImplementedError() {
    this.message = "This method must be implemented.";
    this.name = "NotImplementedError";
  }
  
  extend(NotImplementedError,new Error());

  function notImplementedFunc() {
    throw new NotImplementedError();
  }

  jslash.Rectangle = function (x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  jslash.Rect = jslash.Rectangle;

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

  jslash.Rectangle.collide = function(left,right) {
    var result = left.points().some(function(pt) {
      return right.contains(pt);
    }) || 
    right.points().some(function(pt) { 
      return left.contains(pt);

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

  extend(jslash.BorderedRectangle,new jslash.Rectangle());

  jslash.BorderedRectangle.collide = function(left,right) {
    var x2 = left.x + left.width;
    var y2 = left.y + left.height;
    var ox2 = right.x + right.width;
    var oy2 = right.y + right.height;
    var r = left.x >= right.x && left.x <= ox2 ||
            left.y >= right.y && left.y <= oy2 ||
            x2 >= right.x && x2 <= ox2 ||
            y2 >= right.y && y2 <= oy2;
    return r;
  };

  jslash.Point = function(x,y) {
    this.x = x;
    this.y = y;
  };

  jslash.Canvas = function(canvasId) {
    if (canvasId == undefined) {
      var c = createCanvasElement();
      canvasId = c.id;
    }
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

  jslash.Canvas.prototype.width = function(arg) {
    if (arg == undefined) {
      return this._canvas.width;
    }
    this._canvas.width = arg;
  };

  jslash.Canvas.prototype.height = function(arg) {
    if (arg == undefined) {
      return this._canvas.height;
    }
    this._canvas.height = arg;
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

  BaseSprite.prototype.image = notImplementedFunc;

  BaseSprite.prototype.imageRect = notImplementedFunc;

  BaseSprite.prototype.canvasRect = notImplementedFunc;
  
  BaseSprite.prototype.useRects = notImplementedFunc;

  BaseSprite.prototype.draw = function (ctx) { 
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
  
  jslash.CompositeSprite = function() {
    var length = arguments.length;
    var i = length-1;
    var c;
    if (i > 0 && arguments[i] instanceof jslash.Canvas) {
      c = arguments[i];
    }
    else {
      i++; 
      c = getAuxiliarCanvas();
    }
    c.fill(jslash.colorkey);
    var maxWidth = 0, maxHeight = 0;
    for(var j = 0; j < i; j++) {
      var drawable = arguments[j];
      var w = drawable.width();
      var h = drawable.height();
      if (maxWidth < w) maxWidth = w;
      if (maxHeight < h) maxHeight = h;
      c.draw(drawable);
    }
    //FIXME: raises SECURITY_ERR when is executed local or images are hosted on foreign domains.
    //  Maybe is a good idea to run in "degradated" mode when this raises that exception storing the sprites and
    //  drawing them always.
    this._imgData = length > 0 ? c.context.getImageData(0,0,maxWidth,maxHeight) : null;
    if ( this._imgData != null ) {
      var w = this._imgData.width;
      var h = this._imgData.height;
      for(var r = 0; r < w; r++) {
        for(var c = 0; c < h; c++) {
          var i = r*w*4 + c*4;
          var j = i;
          var compColor = new jslash.Color(this._imgData.data[j++],this._imgData.data[j++],this._imgData[j++],this._imgData[j++]);
          if (compColor.equals(jslash.colorkey)) {
            for(var k = i; k < j; k++) {
              this._imgData.data[k] = 0.0;
            } 
          }
        }
      }
    }
    this.x = this.y = 0;
  };

  extend(jslash.CompositeSprite, new BaseSprite());

  jslash.CompositeSprite.prototype.draw = function(ctx) {
    ctx.putImageData(this._imgData,this.x,this.y);
  };

  //TODO: add/aggregate method to add a new drawable to the current Composite

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

  jslash.Audio = function(id) {
    if (id) {
      this._audio = jslash.ById(id);
    }
    this._audio = createAudioElement();
  };

  jslash.Audio.prototype.load = function(src) {
    this._audio.src = src;
  };

  jslash.Audio.prototype.isReady = function() {
    return this._audio.readyState;
  };

  jslash.Audio.prototype.play = function() {
    this._audio.play();
  };

  jslash.Audio.prototype.stop = function() {
    this._audio.pause();
    this._audio.currentTime = 0;
  };

  jslash.Audio.prototype.isPlaying = function() {
    return !this._audio.paused;
  };

  jslash.Audio.prototype.pause = function() {
    this._audio.pause();
  };

  jslash.Audio.prototype.resume = function() {
    this._audio.play();
  };

  jslash.Audio.prototype.volume = function(arg) {
    if (!arg) {
      return this._audio.volume;
    }
    this._audio.volume = arg;
  };

  jslash.Audio.prototype.ready = function(func) {
    var that = this._audio;
    var intId = setInterval(function() {
                            if (that.readyState) {
                              func();
                              clearInterval(intId);
                            } 
                            },READY_TIME);
  };


  jslash.Color = function(r,g,b,a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a || 1;
  };

  jslash.Color.prototype.equals = function(arg) {
    return this.r == arg.r && this.g == arg.g && this.b == arg.b && this.a == arg.a;
  };


  jslash.Color.prototype.toString = function() {
    var v = [this.r,this.g,this.b,this.a];
    return "rgba("+v.join(",")+")";
  };

  jslash.Map = function() {
    this.firstcol = 0;
    this.firstrow = 0;
  };

  /* jslash.TiledMap */

  /* privates */

  function loadSources(obj,sources) {
    obj.images = [];
    jslash.each(sources,function(i,e) {
      var im = new Image();
      im.src = e;
      obj.images.push(im);
    });
    var intId = setInterval(function() {
      var allCompleted = true;
      jslash.each(obj.images,function(i,e) {
        allCompleted = allCompleted && e.complete;
      });
      if (allCompleted) {
        obj._ready = true;
        clearInterval(intId);
      }
    },READY_TIME);
  }

  function fillMatrix(m,n,defValue) {
    defValue = defValue || null;
    var a = [];
    for(var i = 0; i < n; i++) {
      var r = [];
      a.push(r);
      for(var j = 0; j < m; j++) {
        r.push(defValue);
      }
    }
    return a;
  }

  function handleTMXJSON(that,jsonObject) {
    var map = jsonObject.map;
    that.orientation = parseFloat(map.orientation);
    that.tileheight = parseFloat(map.tileheight);
    that.tilewidth = parseFloat(map.tilewidth);
    that.width = parseFloat(map.width); 
    that.height = parseFloat(map.height);
    imagesSources = [];
    layers = [];
    tilesets = [];
    tilesetInfo = [];
    for(var i = 0; i < jsonObject.images.length; i++) {
      var img = jsonObject.images[i];
      var tileset = jsonObject.tilesets[i];
      tilesetInfo.push( { tilesPerWidth : Int.div(img.width,tileset.tilewidth),
                          tileheight: parseFloat(tileset.tileheight), tilewidth: parseFloat(tileset.tilewidth) } );

      imagesSources.push(img.source);
      delete tileset.name;
      tilesets.push(tileset);
    }
    loadSources(that,imagesSources);
    that.layers = [];
    var framecache = {};
    jslash.each(jsonObject.layers,function(index,layer) {
      var currentLayer = fillMatrix(map.height,map.width);
      that.layers.push(currentLayer);
      for(var i = 0; i < layer.data.length; i++) {
        var r = Int.div(i,map.width);
        var c = i % map.width;
        var gid = layer.data[i];
        var tileset,tilesetIndex = undefined;
        var frame = null;
        for(var j = tilesets.length-1; j >= 0; j--) {
          tileset = tilesets[j];
          if (tileset.firstgid <= gid) {
            tilesetIndex = j;
            break;
          }
        }
        if (tilesetIndex != undefined ) {
          var diff = gid - tileset.firstgid;
          var img = tilesetInfo[tilesetIndex];
          var y = (Int.div(diff,img.tilesPerWidth)) * img.tileheight;
          var x = (diff % img.tilesPerWidth) * img.tilewidth;
          frame = new jslash.Frame(that.images[tilesetIndex],new jslash.Rect(x,y,img.tilewidth,img.tileheight));
        }
        currentLayer[r][c] = frame;
      }
    });
  }

  /* Constructor */

  jslash.TiledMap = function(arg) {
    this._ready = false;
    if (arg != undefined) {
      if (typeof arg == 'string') {
        arg = JSON.parse(arg);
      }
      if (typeof arg != 'object') {
        throw new Error("the argument should be an string or an object");
      }
      handleTMXJSON(this,arg);
    }
  };

  extend(jslash.TiledMap, new jslash.Map());

  /* public methods */

  jslash.TiledMap.prototype.load = function(URI) { 
    var that = this;
    var httpReq = new XMLHttpRequest();
    httpReq.open("GET",URI,true);
    httpReq.onreadystatechange = function() {
      if ( httpReq.readyState == 4 && httpReq.status == 200) {
        var jsonParsed = JSON.parse(httpReq.responseText);
        handleTMXJSON(that,jsonParsed);
      }
    };
    httpReq.send();
  };

  jslash.TiledMap.prototype.draw = function(ctx) {
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;
    var that = this;
    jslash.each(this.layers,function(k,layer) {
      var i,j = 0;
      for(var y = 0; y < ch && j < that.height; y += that.tileheight,j++) {
        var i = 0;
        for(var x = 0; x < cw && i < that.width; x += that.tilewidth,i++) {
          var frame = layer[j][i];
          if (frame) {
            var framerect = frame.rect();
            ctx.drawImage(frame.image(),framerect.x,framerect.y,framerect.width,framerect.height,
                                        x,y,framerect.width,framerect.height);
          }
        }
      } 
    });
  };

  jslash.TiledMap.prototype.ready = function(func) {
    var that = this;
    var intId = setInterval(function() {
      if (that._ready) {
        func();
        clearInterval(intId);
      }
    },READY_TIME);
  };

  /*TODO: Implement jslash.Animation object or jslash.world.addAnimation function:
 * It should be a functionality to add timelined animations that cause a fluid sensation of
 * objects change on canvas (movements, gradual changes of color, etc etc etc) */

  /*TODO: Implement jslash.TileSet or jslash.Map: ¿Singleton?
 *  It will provide an interface to work with maps, enabling scrolling and access to the
 *  different tiles whom compose the map/tileset */

  /* jslash private control variables */
  var privIntId;
  var lastTime;
  var lastCanvasId = 0;
  var lastAudioId = 0;
  var auxiliarCanvas;
  var keyEvents = {};
  var keyEventHandlerDispatched;

  /* jslash private CONSTANTS */
  var READY_TIME = 25;

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
    Z: 90, z: 90
  };

  jslash.fps = 30;
 
  jslash.colorkey = new jslash.Color(0,255,0);
 
  /* jslash methods */

  jslash.ById = function(id) {
    return document.getElementById(id);
  };

  jslash.start = function(mycanvas) {
    if (this.onclear == undefined) {
      this.onclear = function() {
        mycanvas.fill("#000000");
      };
    }
    this.borders = new jslash.BorderedRectangle(0,0,mycanvas.width(),mycanvas.height());
    this.mix(this.borders,new this.behaviors.Collidable(jslash.BorderedRectangle));
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

  jslash.addKeyEvent = function(key,func) {
    if (!(key in keyEvents)) {
      keyEvents[key] = [];
    }
    keyEvents[key].push(func);
    checkKeydownAdded();
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

  jslash.each = function(sequence,func) {
    for(var i = 0; i < sequence.length; i++) {
      func(i,sequence[i]);
    }
  };

  jslash.mix = function(object,mixin) {
    for(var property in mixin) {
      if (mixin.hasOwnProperty(property)) {
        object[property] = mixin[property];
      }
    }
  };

  jslash.prefetchImg = function(arg) {
    if (this.images == undefined) {
      this.images = {};
    }
    if (typeof arg == 'string' ) {
      arg = [arg];
    }
    var that = this;
    jslash.each(arg,function(i,e) {var im = new Image(); im.src = e; that.images[e] = im; });
  };

  jslash.prefetchAudioSources = function(arg) { 
    if (typeof arg == 'string' ) {
      arg = [arg];
    }
    var that = this;
    jslash.each(arg,function(i,e) { new Image().src = e;});
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

  jslash.hasAuxiliarCanvas = function() { return auxiliarCanvas != undefined; }

  /* private jslash methods */

  var Int = {}
  Int.mul = function(a,b) {
    return Math.floor(a*b);
  };

  Int.div = function(a,b) {
    return Math.floor(a/b);
  };


  function getAuxiliarCanvas() {
    if (auxiliarCanvas == undefined) {
      auxiliarCanvas = new jslash.Canvas();
      auxiliarCanvas._canvas.style.setProperty('display','none','');
    } 
    return auxiliarCanvas;
  }

  function createDomElement(tag) {
    var el = document.createElement(tag);
    document.body.appendChild(el);
    return el;
  }

  function createAudioElement() {
    var el = createDomElement('audio');
    el.id = 'audio'+lastAudioId++;
    return el;
  }
  
  function createCanvasElement() {
    var el = createDomElement('div');
    el.id = 'canvasDiv'+lastCanvasId;
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas'+lastCanvasId++;
    el.appendChild(canvas);
    return canvas;
  }

  function checkKeydownAdded() { 
    if (!keyEventHandlerDispatched) {
      window.addEventListener('keydown',function(evt) {
          if (evt.keyCode in keyEvents) {
            jslash.each(keyEvents[evt.keyCode],function(i,f) { f(); });
          }
      },true);
      keyEventHandlerDispatched = true;
    }
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
    var r = this.morph.collide(left,right);
    if (r) {
      if (left.oncollides) {
        left.oncollides(right);
      }
      if (right.oncollides) {
        right.oncollides(left);
      }
    }
    return r;
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

