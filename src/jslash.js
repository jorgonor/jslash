var jslash = {};

(function() {

  /* POO helpers */

  function extend(func,toExtend) {
    var ctor = func.prototype.constructor;
    func.prototype = toExtend;
    func.prototype.constructor = ctor;
  }

  /* Exceptions */

  function NotImplementedError() {
    this.message = 'This method must be implemented.';
    this.name = 'NotImplementedError';
  }

  extend(NotImplementedError, new Error());

  function notImplementedFunc() {
    throw new NotImplementedError();
  }

  jslash.Rectangle = function(x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  jslash.Rect = jslash.Rectangle;

  jslash.Rectangle.prototype.center = function(x,y) {
    var cx = (2 * this.x + this.width) / 2;
    var cy = (2 * this.y + this.height) / 2;
    if (!isDefined(x) || !isDefined(y)) {
      return new jslash.Point(cx, cy);
    }
    this.x += x - cx;
    this.y += y - cy;
  };

  jslash.Rectangle.prototype.points = function() {
    return [new jslash.Point(this.x, this.y), new jslash.Point(this.x + this.width, this.y),
             new jslash.Point(this.x, this.y + this.height), new jslash.Point(this.x + this.width, this.y + this.height)];
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
   return pt.x >= this.x && pt.x <= this.x + this.width &&
             pt.y >= this.y && pt.y <= this.y + this.height;
  };

  jslash.BorderedRectangle = function() {
    jslash.Rectangle.apply(this, arguments);
  };

  extend(jslash.BorderedRectangle, new jslash.Rectangle());

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

  function bindMouseEvent(object,eventName,target) {
    object.addEventListener(eventName,function(evt) {
      if (target['on' + eventName]) {
        var e = {};
        if (isDefined(evt.offsetX))   {
          e.x = evt.offsetX;
          e.y = evt.offsetY;
        }
        else {
          e.x = evt.clientX - object.offsetLeft;
          e.y = evt.clientY - object.offsetTop;
        }
        target['on' + eventName].call(target,e);
      }
    },true);
  }

  jslash.Canvas = function(canvasId) {
    if (!isDefined(canvasId)) {
      var c = createCanvasElement();
      canvasId = c.id;
    }
    this._canvas = jslash.ById(canvasId);
    this.context = this._canvas.getContext('2d');
    var that = this;
    var captCanvas = this._canvas;
    bindMouseEvent(this._canvas,'mousedown',this);
    bindMouseEvent(this._canvas,'mouseup',this);
    bindMouseEvent(this._canvas,'mousemove',this);
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
    this.context.fillRect(0, 0, this._canvas.width, this._canvas.height);
  };

  jslash.Canvas.prototype.center = function() {
    return new jslash.Rect(0,0,this._canvas.width,this._canvas.height).center();
  };

  jslash.Canvas.prototype.width = function(arg) {
    if (!isDefined(arg)) {
      return this._canvas.width;
    }
    this._canvas.width = arg;
  };

  jslash.Canvas.prototype.height = function(arg) {
    if (!isDefined(arg)) {
      return this._canvas.height;
    }
    this._canvas.height = arg;
  };

  function BaseSprite() {
  }

  BaseSprite.prototype.center = function(x,y) {
    var r = this._canvasSubrect.center(x, y);
    if (isDefined(r)) { //getter called
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

  BaseSprite.prototype.draw = function(ctx) {
    var rotationActive = isDefined(this.angle);
    ctx.save();
    if (this.useRects && this.useRects()) {
      var imgRect = this.imageRect();
      var cvsRect = this.canvasRect();
      if (rotationActive) {
        var px = cvsRect.x + cvsRect.width / 2,
            py = cvsRect.y + cvsRect.height / 2;
        ctx.translate(px,py);
        ctx.rotate(this.angle);
        ctx.drawImage(this.image(),
                               imgRect.x, imgRect.y, imgRect.width, imgRect.height,
                               -cvsRect.width/2,-cvsRect.height/2, cvsRect.width, cvsRect.height);
      }
      else {
        ctx.drawImage(this.image(),
                               imgRect.x, imgRect.y, imgRect.width, imgRect.height,
                               cvsRect.x, cvsRect.y, cvsRect.width, cvsRect.height);
      }
    }
    else {
      ctx.drawImage(this.image(), this.x, this.y);
    }
    ctx.restore();
  };

  BaseSprite.prototype.scale = function(factor) {
    var sr = this.canvasRect();
    sr.width *= factor;
    sr.height *= factor;
    this._canvasSubrect = sr;
    this._useRects = true;
  };

  BaseSprite.prototype.rotate = function(a) {
    if (!isDefined(this.angle)) {
      this.angle = 0.0;
    }
    this.angle += a;
  };


  jslash.Sprite = function(img,position) {
    this._img = img;
    if (position) {
      this.x = position.x; this.y = position.y;
    }
    else { this.x = this.y = 0; }
    this._canvasSubrect = new jslash.Rectangle(this.x || 0, this.y || 0, img.width, img.height);
    this._imageSubrect = new jslash.Rectangle(0, 0, img.width, img.height);
    this._useRects = false;
  };

  extend(jslash.Sprite, new BaseSprite());

  jslash.Sprite.prototype.image = function() {
    return this._img;
  };

  jslash.Sprite.prototype.imageRect = function(arg) {
    if (!isDefined(arg)) {
      return this._imageSubrect;
    }
    this._imageSubrect = arg;
    if (!this._useRectsSetted) 
      this._useRects = true;
  };

  jslash.Sprite.prototype.canvasRect = function(arg) {
    if (!isDefined(arg)) {
      return this._canvasSubrect;
    }
    this._canvasSubrect = arg;
    this.x = this._canvasSubrect.x;
    this.y = this._canvasSubrect.y;
    if (!this._useRectsSetted) {
      this._useRects = true;
    }
  };

  jslash.Sprite.prototype.position = function(x,y) {
    if (!x || !y) {
      return new jslash.Point(this.x, this.y);
    }
    this.x = x; this.y = y;
    this._canvasSubrect.x = x;
    this._canvasSubrect.y = y;
  };

  jslash.Sprite.prototype.useRects = function(arg) {
    if (!isDefined(arg)) {
      return this._useRects;
    }
    this._useRects = arg;
    this._useRectsSetted = true;
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

  extend(jslash.AnimatedSprite, new BaseSprite());

  jslash.AnimatedSprite.makeRefresh = function(limit) {
    if (!limit) limit = 10; /* a default value */
    var ticks = 0;
    var makedFunc = function() { 
      if (ticks == limit) {
        ticks = 0;
        this.next();
      }
      else { 
        ticks++;
      }
    };
    return makedFunc;
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
    if (!isDefined(arg)) {
      if (!isDefined(this._canvasSubrect)) {
        this._canvasSubrect = jslash.deepcopy(this._frames[this._currentFrame].rect());
      }
      return this._canvasSubrect;
    }
    this._canvasSubrect = arg;
  };

  jslash.AnimatedSprite.prototype.position = function(x,y) {
    if (!isDefined(x)  || !isDefined(y)) {
      var r = this.canvasRect();
      return new jslash.Point(r.x, r.y);
    }
    if (!isDefined(this._canvasSubrect)) {
      this.canvasRect(jslash.deepcopy(this.canvasRect()));
    }
    this._canvasSubrect.x = x;
    this._canvasSubrect.y = y;
  };

  jslash.AnimatedSprite.prototype.useRects = function() { return true; };

  jslash.CompositeSprite = function() {
    var length = arguments.length;
    var i = length - 1;
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
    for (var j = 0; j < i; j++) {
      var drawable = arguments[j];
      var w = drawable.width();
      var h = drawable.height();
      if (maxWidth < w) maxWidth = w;
      if (maxHeight < h) maxHeight = h;
      c.draw(drawable);
    }
    this._imgData = length > 0 ? c.context.getImageData(0, 0, maxWidth, maxHeight) : null;
    if (this._imgData != null) {
      var w = this._imgData.width;
      var h = this._imgData.height;
      for (var r = 0; r < w; r++) {
        for (var c = 0; c < h; c++) {
          var i = r * w * 4 + c * 4;
          var j = i;
          var compColor = new jslash.Color(this._imgData.data[j++], this._imgData.data[j++], this._imgData[j++], this._imgData[j++]);
          if (compColor.equals(jslash.colorkey)) {
            for (var k = i; k < j; k++) {
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
    ctx.putImageData(this._imgData, this.x, this.y);
  };

  //TODO: add/aggregate method to add a new drawable to the current Composite

  jslash.Text = function(txt,x,y) {
    this.text = txt || '';
    this.font = 'Arial';
    this.color = 'black';
    this.size = 12;
    this.x = x || 0; this.y = y || 0;
  };

  jslash.Text.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.font = [this.size, this.font].join(' ');
    ctx.fillText(this.text, this.x, this.y + this.size);
  };

  jslash.Text.prototype.width = function(canvas) {
    var ctx = canvas.context;
    ctx.fillStyle = this.color;
    ctx.font = [this.size, this.font].join(' ');
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
    var v = [this.r, this.g, this.b, this.a];
    return 'rgba(' + v.join(',') + ')';
  };

  /*TODO: Implement a imageData cache with putImageData when the dirty rect feature leaves its buggy support */

  jslash.Tileset = function() {
    this.firstcol = 0;
    this.firstrow = 0;
  };

  jslash.Tileset.prototype.scrollDown = function(sizeable) {
    var h = sizeable.height();
    var y = (this.firstrow + 1) * this.tileheight;
    if (y + h <= this.pixelsHeight()) {
      this.firstrow++;
      return true;
    }
    return false;
  };

  jslash.Tileset.prototype.canScrollDown = function(sizeable) {
    var h = sizeable.height();
    var y = (this.firstrow + 1) * this.tileheight;
    return y + h <= this.pixelsHeight();
  };

  jslash.Tileset.prototype.scrollRight = function(sizeable) {
    var w = sizeable.width();
    var x = (this.firstcol + 1) * this.tilewidth;
    if (x + w <= this.pixelsWidth()) {
      this.firstcol++;
      return true;
    }
    return false;
  };

  jslash.Tileset.prototype.canScrollRight = function(sizeable) {
    var w = sizeable.width();
    var x = (this.firstcol + 1) * this.tilewidth;
    return x + w <= this.pixelsWidth();
  };

  jslash.Tileset.prototype.scrollUp = function(sizeable) {
    if (this.firstrow > 0) {
      this.firstrow--;
      return true;
    }
    return false;
  };

  jslash.Tileset.prototype.canScrollUp = function(sizeable) {
    return this.firstrow > 0;
  };

  jslash.Tileset.prototype.scrollLeft = function(sizeable) {
    if (this.firstcol > 0) {
      this.firstcol--;
      return true;
    }
    return false;
  };

  jslash.Tileset.prototype.canScrollLeft = function(sizeable) {
    return this.firstcol > 0;
  };

  jslash.Tileset.prototype.pixelsWidth = function() {
    return this.width * this.tilewidth;
  };

  jslash.Tileset.prototype.pixelsHeight = function() {
    return this.height * this.tileheight;
  };

  jslash.Tileset.prototype.toRelative = function(pos) {
    var np = jslash.deepcopy(pos);
    np.x -= this.firstcol * this.tilewidth;
    np.y -= this.firstrow * this.tileheight;
    return np;
  };

  jslash.Tileset.prototype.toAbsolute = function(pos) {
    var np = jslash.deepcopy(pos);
    np.x += this.firstcol * this.tilewidth;
    np.y += this.firstrow * this.tileheight;
    return np;
  };

  jslash.Tileset.prototype.toCell = function(pos) {
    var r = this.firstrow, c = this.firstcol;
    c += Int.div(pos.x,this.tilewidth);
    r += Int.div(pos.y , this.tileheight);
    return { row: r, col: c };
  };

  jslash.Tileset.prototype.putObstacleOn = notImplementedFunc;

  jslash.Tileset.prototype.cellIsObstacle = notImplementedFunc;

  jslash.Tileset.prototype.isFreeArea = function(rect) {
    for(var y = rect.y; y <= rect.y + rect.height; y += this.tileheight) {
      for(var x = rect.x; x <= rect.x + rect.width; x += this.tilewidth) {
        var r = Int.div(y,this.tileheight);
        var c = Int.div(x,this.tilewidth);
        if (this.cellIsObstacle(r,c)) {
          return false;
        }
      }
    }
    return true;
  };

  /* jslash.TiledMap */

  /* privates */

  function loadSources(obj,sources) {
    obj.images = [];
    jslash.each(sources, function(i,e) {
      var im = new Image();
      im.src = e;
      obj.images.push(im);
    });
    var intId = setInterval(function() {
      var allCompleted = true;
      jslash.each(obj.images, function(i,e) {
        allCompleted = allCompleted && e.complete;
      });
      if (allCompleted) {
        obj._ready = true;
        clearInterval(intId);
      }
    },READY_TIME);
  }

  function fillMatrix(m,n,defValue) {
    if (!isDefined(defValue)) defValue = null;
    var a = [];
    for (var i = 0; i < n; i++) {
      var r = [];
      a.push(r);
      for (var j = 0; j < m; j++) {
        r.push(defValue);
      }
    }
    return a;
  }

  function handleTMXJSON(that,jsonObject) {
    var map = jsonObject.map;
    that.orientation = map.orientation;
    that.properties = map.properties;
    that.tileheight = parseFloat(map.tileheight);
    that.tilewidth = parseFloat(map.tilewidth);
    that.width = parseFloat(map.width);
    that.height = parseFloat(map.height);
    imagesSources = [];
    layers = [];
    tilesets = [];
    tilesetInfo = [];
    for (var i = 0; i < jsonObject.images.length; i++) {
      var img = jsonObject.images[i];
      var tileset = jsonObject.tilesets[i];
      tilesetInfo.push({ tilesPerWidth: Int.div(img.width, tileset.tilewidth),
                          tileheight: parseFloat(tileset.tileheight), tilewidth: parseFloat(tileset.tilewidth) });

      imagesSources.push(img.source);
      delete tileset.name;
      tilesets.push(tileset);
    }
    loadSources(that, imagesSources);
    that.layers = [];
    that.obstacles = fillMatrix(map.height,map.width,false);
    var framecache = {};
    jslash.each(jsonObject.layers, function(index,layer) {
      var currentLayer = fillMatrix(map.height, map.width);
      currentLayer.properties = layer.properties;
      if (currentLayer.properties && currentLayer.properties.obstacle) {
        currentLayer.obstacles = fillMatrix(map.height,map.width);
      }
      that.layers.push(currentLayer);
      for (var i = 0; i < layer.data.length; i++) {
        var r = Int.div(i, map.width);
        var c = i % map.width;
        var gid = layer.data[i];
        var tileset, tilesetIndex = undefined;
        var frame = null;
        for (var j = tilesets.length - 1; j >= 0; j--) {
          tileset = tilesets[j];
          if (tileset.firstgid <= gid) {
            tilesetIndex = j;
            break;
          }
        }
        if (isDefined(tilesetIndex)) {
          var diff = gid - tileset.firstgid;
          var img = tilesetInfo[tilesetIndex];
          var y = (Int.div(diff, img.tilesPerWidth)) * img.tileheight;
          var x = (diff % img.tilesPerWidth) * img.tilewidth;
          frame = new jslash.Frame(that.images[tilesetIndex], new jslash.Rect(x, y, img.tilewidth, img.tileheight));
        }
        currentLayer[r][c] = frame;
        if (currentLayer.obstacles) {
          currentLayer.obstacles[r][c] = frame != null;
        }
      }
    });
  }

  /* Constructor */

  jslash.TiledTileset = function(arg) {
    jslash.Tileset.apply(this);
    this._ready = false;
    if (isDefined(arg)) {
      if (typeof arg == 'string') {
        arg = JSON.parse(arg);
      }
      if (typeof arg != 'object') {
        throw new Error('the argument should be an string or an object');
      }
      handleTMXJSON(this, arg);
    }
  };

  extend(jslash.TiledTileset, new jslash.Tileset());

  /* public methods */

  jslash.TiledTileset.prototype.load = function(URI) {
    var that = this;
    var httpReq = new XMLHttpRequest();
    httpReq.open('GET', URI, true);
    httpReq.onreadystatechange = function() {
      if (httpReq.readyState == 4 && httpReq.status == 200) {
        var jsonParsed = JSON.parse(httpReq.responseText);
        handleTMXJSON(that, jsonParsed);
      }
    };
    httpReq.send();
  };

  jslash.TiledTileset.prototype.draw = function(ctx) {
    var cw = ctx.canvas.width;
    var ch = ctx.canvas.height;
    var that = this;
    jslash.each(this.layers, function(k,layer) {
      var i, j = that.firstrow;
      for (var y = 0; y < ch && j < that.height; y += that.tileheight, j++) {
        i = that.firstcol;
        for (var x = 0; x < cw && i < that.width; x += that.tilewidth, i++) {
          var frame = layer[j][i];
          if (frame) {
            var framerect = frame.rect();
            ctx.drawImage(frame.image(), framerect.x, framerect.y, framerect.width, framerect.height,
                                        x, y, framerect.width, framerect.height);
          }
        }
      }
    });
  };

  jslash.TiledTileset.prototype.cellIsObstacle = function(row,col) {
    if ( row >= 0 && row < this.obstacles.length &&
         col >= 0 && col < this.obstacles[0].length &&
         this.obstacles[row][col] ) { 
      return true;
    }
  
    var ret = false;

    var that = this;
    jslash.each(this.layers,function(i,e) {
      if (isDefined(e.obstacles))  {
        if ( row >= 0 && col >= 0 && col < that.width && row < that.height ) {
          ret = ret || e.obstacles[row][col];
        }
        else {
          ret = true;
        }
      }
    });
    return ret;
  };

  jslash.TiledTileset.prototype.ready = function(func) {
    var that = this;
    var intId = setInterval(function() {
      if (that._ready) {
        func();
        clearInterval(intId);
      }
    },READY_TIME);
  };

  jslash.TiledTileset.prototype.putObstacleOn = function(row,col) {
    this.obstacles[row][col] = true;
  };

  jslash.Animation = function(object,property,time,transform) {
    this._boundProp = property;
    this._boundObj = object;
    this._time = time;
    this._transform = transform;
  };

  jslash.Animation.prototype.from = function(value) {
    this._from = value;
    return this;
  };

  jslash.Animation.prototype.to = function(value) {
    this._to = value;
    return this;
  };

  jslash.Animation.prototype.start = function() {
    var that = this;
    if (!isDefined(this._transform) ) {
      if ( !isDefined(this._to) || !isDefined(this._from)) {
        throw new Error("from and to methods must have been called previously");
      } 
      var inc = (this._to - this._from) / (this._time / ANIMATION_TIME );
      var intId = setInterval(function() {
        that._boundObj[that._boundProp] = that._boundObj[that._boundProp] + inc;
        if ( that._boundObj[that._boundProp] >= that._to ) {
          that._boundObj[that._boundProp] = that._to;
          clearInterval(intId);
        }
        },ANIMATION_TIME);
    }
    else {
      var intId = setInterval(function() {
        that._boundObj[that._boundProp] = that._transform(that._boundObj,that._boundObj[that._boundProp]);
      },ANIMATION_TIME);
      setTimeout(function()  {
        clearInterval(intId);
      },this._time);
    }
  };

  /*TODO: agregate shapes and paths to jslash, jslash needs to provide canvas power */

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
  var ANIMATION_TIME = 50;

  /* jslash CONSTANTS */
  jslash.KEYS = {
    UP: 38, LEFT: 37, RIGHT: 39, DOWN: 40,
    TAB: 9, SHIFT: 16, CTRL: 17, ALT: 18,
    SPACE: 32, ALTGR: 0, LT: 188, '<': 188, GT: 190, '>': 190,
    SLASH: 191, '/': 191, '"': 222, DBLQUOTE: 222, '!': 49, '(': 57, ')': 48, '=': 187, EQUAL: 187,
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

  jslash.colorkey = new jslash.Color(0, 255, 0);

  /* jslash methods */

  jslash.ById = function(id) {
    return document.getElementById(id);
  };

  jslash.start = function(mycanvas) {
    if (!isDefined(this.onclear)) {
      this.onclear = function() {
        mycanvas.fill('#000000');
      };
    }
    this.borders = new jslash.BorderedRectangle(0, 0, mycanvas.width(), mycanvas.height());
    this.mix(this.borders, new this.behaviors.Collidable(jslash.BorderedRectangle));
    lastTime = new Date().getTime();
    var that = this;
    privIntId = setInterval(function() {
      if (that.onupdate) {
        var t = new Date().getTime();
        //onupdate receives the time difference (dt) between frames
        that.onupdate(t - lastTime);
        lastTime = t;
      }
      that.onclear();
      if (that.onrefresh) {
        that.onrefresh();
      }
    },1000.0 / jslash.fps);
  };

  jslash.startWithAnimationFrame = function(mycanvas) {
    var that = this;
    var lastTime = new Date().getTime();
    function internalUpdate(t) { 
      if (that.onupdate) {
        //var t = new Date().getTime();
        //onupdate receives the time difference (dt) between frames
        that.onupdate(t - lastTime);
        lastTime = t;
      }
      if ( that.onclear) {
        that.onclear();
      }
      if (that.onrefresh) {
        that.onrefresh();
      }
      requestAnimFrame(internalUpdate);
    }
    var requestAnimFrame = getRequestAnimFrame(); 
    this.borders = new jslash.BorderedRectangle(0, 0, mycanvas.width(), mycanvas.height());
    this.mix(this.borders, new this.behaviors.Collidable(jslash.BorderedRectangle));
    requestAnimFrame(internalUpdate);

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
    for (var property in other) {
      if (other.hasOwnProperty(property)) {
        nw[property] = other[property];
      }
    }
    return nw;
  };

  jslash.each = function(sequence,func) {
    if (sequence instanceof Array) {
      for (var i = 0; i < sequence.length; i++) {
        func(i, sequence[i]);
      }
    }
    else if (typeof sequence == 'object') {
      for (var property in sequence) {
        if (typeof sequence[property] != 'function' &&
            sequence.hasOwnProperty(property)) {
          func(property, sequence[property]);
        }
      }
    }
  };

  jslash.mix = function(object,mixin) {
    for (var property in mixin) {
      if (mixin.hasOwnProperty(property)) {
        object[property] = mixin[property];
      }
    }
  };

  jslash.times = function(n,func) {
    for(var i = 0; i < n; i++) {
      func();
    }
  };

  jslash.prefetchImg = function(arg) {
    if (!isDefined(this.images)) {
      this.images = {};
    }
    if (typeof arg == 'string') {
      arg = [arg];
    }
    var that = this;
    jslash.each(arg, function(i,e) {var im = new Image(); im.src = e; that.images[e] = im; });
  };

  jslash.prefetchAudioSources = function(arg) {
    if (typeof arg == 'string') {
      arg = [arg];
    }
    var that = this;
    jslash.each(arg, function(i,e) { new Image().src = e;});
  };

  jslash.properties = function(object) {
    var prop = [];
    for (var property in object) {
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
    for (var y = rect.y; y < img.height; y += rect.height) {
      for (var x = rect.x; x < img.width; x += rect.width) {
        frames.push(new this.Frame(img, new this.Rectangle(x, y, rect.width, rect.height)));
      }
    }
    return frames;
  };

  jslash.ready = function(func) {
    window.addEventListener('load', func, true);
  }

  jslash.hasAuxiliarCanvas = function() { return isDefined(auxiliarCanvas); }

  /* private jslash methods */

  var Int = {};
  Int.mul = function(a,b) {
    return Math.floor(a * b);
  };

  Int.div = function(a,b) {
    return Math.floor(a / b);
  };


  function getAuxiliarCanvas() {
    if (!isDefined(auxiliarCanvas)) {
      auxiliarCanvas = new jslash.Canvas();
      auxiliarCanvas._canvas.style.setProperty('display', 'none', '');
    }
    return auxiliarCanvas;
  }

  function getRequestAnimFrame() {
//http://paulirish.com/2011/requestanimationframe-for-smart-animating/
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function(/* function */ callback, /* DOMElement */ element){
              window.setTimeout(callback, 1000 / 60);
            };

  }

  function createDomElement(tag) {
    var el = document.createElement(tag);
    document.body.appendChild(el);
    return el;
  }

  function createAudioElement() {
    var el = createDomElement('audio');
    el.id = 'audio' + lastAudioId++;
    return el;
  }

  function createCanvasElement() {
    var el = createDomElement('div');
    el.id = 'canvasDiv' + lastCanvasId;
    var canvas = document.createElement('canvas');
    canvas.id = 'canvas' + lastCanvasId++;
    el.appendChild(canvas);
    return canvas;
  }

  function checkKeydownAdded() {
    if (!keyEventHandlerDispatched) {
      window.addEventListener('keydown', function(evt) {
          if (evt.keyCode in keyEvents) {
            jslash.each(keyEvents[evt.keyCode], function(i,f) { f(); });
          }
      },true);
      keyEventHandlerDispatched = true;
    }
  }

  function isDefined(value) {
    return !(value == undefined);
  }


  /* behaviors */
  var behaviors = {};

  /* behaviors functions:
 *   explaining, It's being used a single variable for the functions 
 *   in order to avoid new function object allocatiosn */

  var move = function(dt) {
    var x, y;
    var p = this.position();
    x = p.x; y = p.y;
    x += this.speed.x * dt / 1000.0;
    y += this.speed.y * dt / 1000.0;
    this.position(x, y);
  };

  var collides = function(other) {
    var left = this._boundProperty ? this[this._boundProperty] : this;
    var right = other._boundProperty ? other[other._boundProperty] : other;
    left = typeof left != 'function' ? left : left.apply(this);
    right = typeof right != 'function' ? right : right.apply(other);
    var r = this.morph.collide(left, right);
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

  var moveWithMovementRegion = function(dt) { 
    var x, y, x0, y0, x1, y1;
    var p = this.position();
    x = p.x; y = p.y;
    x += this.speed.x * dt / 1000.0;
    y += this.speed.y * dt / 1000.0;

    x0 = this.region.x; y0 = this.region.y;
    x1 = x0 + this.region.width; y1 = y0 + this.region.height;
    if ( x < x0 ) x = x0;
    if ( y < y0 ) y = y0;
    if ( x > x1 ) x = x1;
    if ( y > y1 ) y = y1;

    this.position(x,y);
  };

  behaviors.Movable = function(x,y) {
    this.speed = {'x': x, 'y': y};
    this.move = move;
  };

  behaviors.Collidable = function(morph,property) {
    this.morph = morph;
    this._boundProperty = property;
    this.collides = collides;
  };

  behaviors.LimitedMovable = function(x,y,region) {
    this.speed = { 'x': x, 'y': y };
    this.region = region;
    this.move = moveWithMovementRegion;
  };

  jslash.behaviors = behaviors;
})();

