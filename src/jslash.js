/* jslash library main module
 *  @namespace  */

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

  /** Represents a rectangle object
   * @constructor 
   * @this {jslash.Rectangle}
   * @param {number} x The top-left point x dimension value.
   * @param {number} y The top-left point y dimension value.
   * @param {number} width The rectangle width.
   * @param {number} height The rectangle height. 
   */
  
  jslash.Rectangle = function(x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  };

  /** Alias of the jslash.Rectangle object
   * @constructor 
   * @this {jslash.Rect}
   * @param {number} x The top-left point x dimension value.
   * @param {number} y The top-left point y dimension value.
   * @param {number} width The rectangle width.
   * @param {number} height The rectangle height. 
   */
  
  jslash.Rect = jslash.Rectangle;

  /** Returns or sets the rectangle center
   * depending on the parameters.
   * @this {jslash.Rectangle}
   * @param {number} x Optional parameter. Sets the x value of the center point.
   * @param {number} y Optional parameter. Sets the y value of the center point.
   * @return {jslash.Point} The point where is setted currently the rectangle center.
   */
  
  jslash.Rectangle.prototype.center = function(x,y) {
    var cx = (2 * this.x + this.width) / 2;
    var cy = (2 * this.y + this.height) / 2;
    if (!isDefined(x) || !isDefined(y)) {
      return new jslash.Point(cx, cy);
    }
    this.x += x - cx;
    this.y += y - cy;
  };

  /** Returns an array with the four rectangle points
   * @this {jslash.Rectangle}
   * @return {Array.<jslash.Point>} Array containing the four limited points.
   */
  
  jslash.Rectangle.prototype.points = function() {
    return [new jslash.Point(this.x, this.y), new jslash.Point(this.x + this.width, this.y),
             new jslash.Point(this.x, this.y + this.height), new jslash.Point(this.x + this.width, this.y + this.height)];
  };

  /** It says if the parameter point is contained by the rectangle.
   * @this {jslash.Rectangle} 
   * @param {jslash.Point} The candidate of containing point.
   * @return {boolean} 
   */
  
  jslash.Rectangle.prototype.contains = function(pt) {
   return pt.x >= this.x && pt.x <= this.x + this.width &&
             pt.y >= this.y && pt.y <= this.y + this.height;
  };
  
  /** It says if the two rectangles are colliding or not.
   * @param {jslash.Rectangle} The first rectangle.
   * @param {jslash.Rectangle} The second rectangle.
   * @return {boolean} 
   */
  
  jslash.Rectangle.collide = function(left,right) {
    var result = left.points().some(function(pt) {
      return right.contains(pt);
    }) ||
    right.points().some(function(pt) {
      return left.contains(pt);

    });
    return result;
  };

  /** Represents a Rectangle with only-borders collisions.
   * @constructor 
   * @extends {jslash.Rectangle}
   * @this {jslash.BorderedRectangle}
   */
  
  jslash.BorderedRectangle = function() {
    jslash.Rectangle.apply(this, arguments);
  };

  extend(jslash.BorderedRectangle, new jslash.Rectangle());

  
  /** Indicates if the right rectangle collides with the borders of the first rectangle.
   * @param {jslash.BorderedRectangle} left The rectangle with the borders.
   * @param {jslash.Rectangle} right The rectangle to test if it collides with the left borders.
   * @return {boolean} */
  
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

  /** Represents a Point.
   * @constructor 
   * @this {jslash.Point}
   * @param {number} x The x dimension value.
   * @param {number} y The y dimension value.
   */
  
  jslash.Point = function(x,y) {
    this.x = x;
    this.y = y;
  };

  /* TODO: bindMouseEvent must be reviewed,
   * when the mouse is out of the canvas, the event interaction may
   * not be the desired. */

  /** Bind any type of mouse event to an object. Internal helper method.
   * @private
   * @param object The object owner of the event.
   * @param {string} eventName The name of the event. i.e: mouseover, mousemove,...
   * @param target The object where the event will dispatch the event. 
   */
  
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
  
  /** Wrapper to HTMLCanvasElement. It can draw any drawable object and
   * is used to handle HTML-defined canvas or to create it if is needed.
   * @constructor 
   * @this {jslash.Canvas}
   * @param {string} canvasId Optional. It is provide when you want to use a HTML specified canvas element. 
   */
  
  jslash.Canvas = function(canvasId) {
    if (!isDefined(canvasId)) {
      var c = createCanvasElement();
      canvasId = c.id;
    }
    this._canvas = jslash.byId(canvasId);
    this.context = this._canvas.getContext('2d');
    bindMouseEvent(this._canvas,'mousedown',this);
    bindMouseEvent(this._canvas,'mouseup',this);
    bindMouseEvent(this._canvas,'mousemove',this);
  };
  
  /** Draws any drawable object on Canvas.
   * @this{jslash.Canvas}
   * @param drawable An object providing the Drawable interface.
   */
  
  jslash.Canvas.prototype.draw = function(drawable) {
    if (drawable.onrefresh) {
      drawable.onrefresh();
    }
    if (drawable.draw) {
      drawable.draw(this.context);
    }
  };

  /** Fills the canvas with a color.
   * @this{jslash.Canvas}
   * @param {jslash.Color,string} color The color to fill the canvas.
   */
  
  jslash.Canvas.prototype.fill = function(color) {
    this.context.fillStyle = color;
    this.context.fillRect(0, 0, this._canvas.width, this._canvas.height);
  };

  /** Returns the center point of the canvas.
   * @this{jslash.Canvas}
   * @return {jslash.Point} The canvas center point.
   */
  
  jslash.Canvas.prototype.center = function() {
    return new jslash.Rect(0,0,this._canvas.width,this._canvas.height).center();
  };
  
  /** Returns or sets the canvas width.
   * @this {jslash.Canvas}
   * @param {number} arg Optional. The value of the canvas width.
   * @return {number} Returns the current canvas width.
   */

  jslash.Canvas.prototype.width = function(arg) {
    if (!isDefined(arg)) {
      return this._canvas.width;
    }
    this._canvas.width = arg;
  };

  /** Returns or sets the canvas height.
   * @this {jslash.Canvas}
   * @param {number} arg Optional. The value of the canvas height.
   * @return {number} Returns the current canvas height.
   */
  
  jslash.Canvas.prototype.height = function(arg) {
    if (!isDefined(arg)) {
      return this._canvas.height;
    }
    this._canvas.height = arg;
  };

  /** Sprites' base class.
   * @constructor
   * @private
   * @this {jslash.BaseSprite}
   */
  
  function BaseSprite() {
  }
  
  /** Returns or sets the center of the sprite
   * @this {BaseSprite}
   * @param {number} x Optional. The x value of the center point.
   * @param {number} y Optional. The y value of the center point.
   * @return {jslash.Point} The current center point of the sprite.
   */

  BaseSprite.prototype.center = function(x,y) {
    var r = this.canvasRect().center(x, y);
    if (isDefined(r)) { //getter called
      return r;
    }
  };
  
  /** Gets the width of the sprite.
   * @this {BaseSprite}
   * @return {number} The current width of the sprite canvas rectangle.
   */
  
  BaseSprite.prototype.width = function() {
    return this.canvasRect().width;
  };
  
  /** Gets the height of the sprite.
   * @this {BaseSprite}
   * @return {number} The current height of the sprite canvas rectangle.
   */
  
  BaseSprite.prototype.height = function() {
    return this.canvasRect().height;
  };
  
  /** Required interface method.
   * @this {BaseSprite}
   * @return {Image}
   */
  
  BaseSprite.prototype.image = notImplementedFunc;

  /** Required interface method.
   * @this {BaseSprite}
   * @return {jslash.Rectangle}
   */
  
  BaseSprite.prototype.imageRect = notImplementedFunc;

  /** Required interface method.
   * @this {BaseSprite}
   * @return {jslash.Rectangle}
   */
  
  BaseSprite.prototype.canvasRect = notImplementedFunc;

  /** Draws the sprite using the image and imageRect interface.
   * @this {BaseSprite}
   * @private
   * @param {Context2D} ctx The canvas context2D where it will be drawn.
   */
  
  BaseSprite.prototype.draw = function(ctx) {
    var rotationActive = isDefined(this.angle);
    var imgRect = this.imageRect();
    var cvsRect = this.canvasRect();
    if (rotationActive) {
      ctx.save();
      var px = cvsRect.x + cvsRect.width / 2,
          py = cvsRect.y + cvsRect.height / 2;
      ctx.translate(px,py);
      ctx.rotate(this.angle);
      ctx.drawImage(this.image(),
                             imgRect.x, imgRect.y, imgRect.width, imgRect.height,
                             -cvsRect.width/2,-cvsRect.height/2, cvsRect.width, cvsRect.height);
      ctx.restore();
    }
    else {
      ctx.drawImage(this.image(),
                             imgRect.x, imgRect.y, imgRect.width, imgRect.height,
                             cvsRect.x, cvsRect.y, cvsRect.width, cvsRect.height);
    }
  };

  /** Scales the sprite  
   * @this {BaseSprite}
   * @param {number} factor The desired scaling factor.
   */
  
  BaseSprite.prototype.scale = function(factor) {
    var sr = this.canvasRect();
    sr.width *= factor;
    sr.height *= factor;
    this._canvasSubrect = sr;
  };

  /** Rotates the sprite 
   * @this {BaseSprite}
   * @param {number} a The desired angle to rotate in radians.
   */
  
  BaseSprite.prototype.rotate = function(a) {
    if (!isDefined(this.angle)) {
      this.angle = 0.0;
    }
    this.angle += a;
  };

  /** Sprite. The class is capable to manipulate the image properties,
   * width, height, scale, rotation, and locate it on the canvas.
   * @constructor
   * @this {jslash.Sprite}
   * @extends {BaseSprite}
   * @param {Image} img The image of the sprite.
   * @param {jslash.Point} position Optional. Point where it will be drawn.
   */

  jslash.Sprite = function(img,position) {
	/** @private */
    this._img = img;
    var x = isDefined(position) ? position.x : 0,
        y = isDefined(position) ? position.y : 0;
    /** @private */
    this._canvasSubrect = new jslash.Rectangle(x, y, img.width, img.height);
    /** @private */
    this._imageSubrect = new jslash.Rectangle(0, 0, img.width, img.height);
  };

  extend(jslash.Sprite, new BaseSprite());

  /** Returns the sprite image 
   * @this {jslash.Sprite}
   * @return {Image} The current sprite image.
   */
  
  jslash.Sprite.prototype.image = function() {
    return this._img;
  };

  /** Returns or sets the rectangle of the image drawn on canvas.
   * @this {jslash.Sprite}
   * @param {jslash.Rectangle} arg The new rectangular region to be drawn.
   * @return {jslash.Rectangle} The current image rectangular region being drawn.
   */
  
  jslash.Sprite.prototype.imageRect = function(arg) {
    if (!isDefined(arg)) {
      return this._imageSubrect;
    }
    this._imageSubrect = arg;
  };

  /** Returns or sets the rectangle where the sprite will be drawn.
   * @this {jslash.Sprite}
   * @param {jslash.Rectangle} arg The new rectangular region where it will be drawn.
   * @return {jslash.Rectangle} The current rectangular region.
   */
  
  jslash.Sprite.prototype.canvasRect = function(arg) {
    if (!isDefined(arg)) {
      return this._canvasSubrect;
    }
    this._canvasSubrect = arg;
  };

  /** Returns or sets the position where the sprite will be drawn.
   * @this {jslash.Sprite}
   * @param {number} x The new position x value.
   * @param {number} y The new position y value.
   * @return {jslash.Point} The current position point.
   */
  
  jslash.Sprite.prototype.position = function(x,y) {
    if (!isDefined(x) || !isDefined(y)) {
      return new jslash.Point(this._canvasSubrect.x, this._canvasSubrect.y);
    }
    this._canvasSubrect.x = x;
    this._canvasSubrect.y = y;
  };

  /** Represents an animation frame or an image-subrectangle association.
   * If it is used with its interface, it is immutable.
   * @this {jslash.Frame}
   * @constructor
   * @param {Image} img The image of the frame.
   * @param {jslash.Rectangle} sr The rectangular subregion.
   */
  
  jslash.Frame = function(img,sr) {
	/** @private */
    this._img = img;
    /** @private */
    this._subrect = sr;
  };

  /** Returns the frame image
   * @this {jslash.Frame}
   * @return {Image} 
   */
  
  jslash.Frame.prototype.image = function() {
    return this._img;
  };

  /** Returns the frame subrectangle
   * @this {jslash.Frame}
   * @return {jslash.Rectangle} 
   */
  
  jslash.Frame.prototype.rect = function() {
    return this._subrect;
  };

  /** An sprite with the capacity of mutate from diferent frames 
   * @constructor
   * @extends {BaseSprite}
   * @this {jslash.AnimatedSprite}
   * @param {Array<jslash.Frame>} frames Sequence of the frames to be drawn in the same order.*/
  
  jslash.AnimatedSprite = function(frames) {
	/** @private */
    this._frames = frames;
    /** @private */
    this._currentFrame = 0;
  };

  extend(jslash.AnimatedSprite, new BaseSprite());

  /** Returns a function with a limited number of ticks.
   *  @return {Function} The function created with the limit captured variable.
   */
  
  jslash.AnimatedSprite.makeRefresh = function(limit) {
    if (!isDefined(limit)) limit = 10; /* a default value */
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

  /** Advances the animation to the next frame 
   * @this{jslash.AnimatedSprite}
   */

  jslash.AnimatedSprite.prototype.next = function() {
    this._currentFrame = (this._currentFrame + 1) % this._frames.length;
  };

  /** Returns the current image. Used to draw the current sprite.
   * @this{jslash.AnimatedSprite}
   * @override
   * @return {Image} The current animation image.
   */
  
  jslash.AnimatedSprite.prototype.image = function() {
    return this._frames[this._currentFrame].image();
  };

  /** Returns the current image Rect. Used to draw the current sprite.
   * @this {jslash.AnimatedSprite}
   * @override
   * @return {jslash.Rectangle} The current animation image subrectangle.
   */
  
  jslash.AnimatedSprite.prototype.imageRect = function() {
    return this._frames[this._currentFrame].rect();
  };

  /** Returns or sets the canvas rectangle where the image will be drawn.
   * @this {jslash.AnimatedSprite}
   * @override
   * @param {jslash.Rectangle} arg Optional. It sets the new canvas rectangle.
   * @return {jslash.Rectangle} The current canvas subrectangle.
   */
  
  jslash.AnimatedSprite.prototype.canvasRect = function(arg) {
    if (!isDefined(arg)) {
      if (!isDefined(this._canvasSubrect)) {
        this._canvasSubrect = jslash.deepcopy(this._frames[this._currentFrame].rect());
      }
      return this._canvasSubrect;
    }
    this._canvasSubrect = arg;
  };

  /** Returns or sets the canvas position where the image will be drawn.
   * @override
   * @this {jslash.AnimatedSprite}
   * @param {number} x Optional. The new position x value.
   * @param {number} y Optional. The new position y value.
   * @return {jslash.Point} The current point position.
   */
  
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

  /** Handles a sprite composed with more sprites.
   * @this {jslash.CompositeSprite}
   * @constructor
   * @extends {BaseSprite}
   * @param {Array<jslash.Sprite>} An array of jslash.Sprites or a sequence inserted as different arguments.
   * @param {jslash.Canvas} Optional. If any canvas is passed as the last parameter, it will be used as an
   * auxiliar Canvas.
   */
  
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
    /** @private */
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

  /** Returns or sets the canvas position where the image will be drawn.
   * @this {jslash.CompositeSprite}
   * @override
   * @param {number} x Optional. The new position x value.
   * @param {number} y Optional. The new position y value.
   * @return {jslash.Point} The current point position.
   */
  
  jslash.CompositeSprite.prototype.position = function(x,y) {
    if (!isDefined(x) || !isDefined(y) ) {
      return new jslash.Point(this.x,this.y);
    }
    this.x = x;
    this.y = y;
  };

  /** Draws the CompositeSprite on the canvas context.
   * @this {jslash.CompositeSprite}
   * @override
   * @param {Context2D} ctx The canvas context.
   */
  
  jslash.CompositeSprite.prototype.draw = function(ctx) {
    ctx.putImageData(this._imgData, this.x, this.y);
  };

  //TODO: add/aggregate method to add a new drawable to the current Composite

  /** Represents an draws a text on the canvas.
   * @this {jslash.Text}
   * @constructor
   * @param {string} txt The string to be drawn.
   * @param {number} Optional. The x position where it will be written.
   * @param {number} Optional. The y position where it will be written.
   * @property {string} text The string to be drawn.
   * @property {string} font The font used to draw the text.
   * @property {jslash.Color} color The color to draw the text.
   * @property {string} weight The css weight used to draw the text.
   * @property {number} size The text size.
   * @property {x} The x position where it will be written.
   * @property {y} The y position where it will be written.
   */
  
  jslash.Text = function(txt,x,y) {
    this.text = txt || '';
    this.font = 'Arial';
    this.color = 'black';
    this.weight = '';
    this.size = 12;
    this.x = isDefined(x) ? x : 0; this.y = isDefined(y) ? y : 0;
  };

  /** Draws the text on the canvas.
   * @this {jslash.Text}
   * @private
   * @param {Context2D} ctx The canvas Context2D.
   */
  
  jslash.Text.prototype.draw = function(ctx) {
    ctx.fillStyle = this.color;
    ctx.font = [this.weight, this.size, this.font].join(' ').trim();
    ctx.fillText(this.text, this.x, this.y + this.size);
  };

  /** Returns the text width occupied on canvas.
   * @this {jslash.Text}
   * @param {jslash.Canvas} The canvas where it will be drawn.
   * @return {number} The width size in pixels.
   */
  
  jslash.Text.prototype.width = function(canvas) {
    var ctx = canvas.context;
    ctx.fillStyle = this.color;
    ctx.font = [this.size, this.font].join(' ');
    return ctx.measureText(this.text).width;
  };

  /** Returns the text height occupied on canvas.
   * @this {jslash.Text}
   * @return {number} The height size in pixels.
   */
  
  jslash.Text.prototype.height = function() {
    return this.size;
  };

  /** Audio object to play sound effects or melody musics. Uses HTMLAudioElement.
   * @this {jslash.Audio}
   * @constructor
   * @param {string} id Optional. The identifier of a HTML-defined Audio Element.
   */
  
  jslash.Audio = function(id) {
    if (isDefined(id)) {
   /** @private */
      this._audio = jslash.byId(id);
    }
    else {
      this._audio = createAudioElement();
    }
  };

  /** Loads an URI element to the audio
   * @this {jslash.Audio}
   * @param {string} The URI of the audio resource to be loaded.
   */
  
  jslash.Audio.prototype.load = function(src) {
    this._audio.src = src;
  };

  /** Tells if the audio element is ready to play. 
   * @this {jslash.Audio}
   * @return {boolean}
   */
  
  jslash.Audio.prototype.isReady = function() {
    return this._audio.readyState;
  };

  /** Plays the audio. 
   * @this {jslash.Audio}
   */
  
  jslash.Audio.prototype.play = function() {
    this._audio.play();
  };

  /** Stops the audio and restart the time.
   * @this {jslash.Audio}
   */
  
  jslash.Audio.prototype.stop = function() {
    this._audio.pause();
    this._audio.currentTime = 0;
  };

  /** Tells if the audio is playing now.
   *  @this {jslash.Audio}
   *  @return {boolean}
   */
  
  jslash.Audio.prototype.isPlaying = function() {
    return !this._audio.paused;
  };

  /** Pause the audio, without reseting the time
   * @this {jslash.Audio}
   */
  
  jslash.Audio.prototype.pause = function() {
    this._audio.pause();
  };

  /** Resume the audio playing
   * @this {jslash.Audio}
   */
  
  jslash.Audio.prototype.resume = function() {
    this._audio.play();
  };

  /** Returns or sets the audio volume.
   * @this {jslash.Audio}
   * @param {number} arg Optional. Sets the new volume. Must be between 0 and 1.
   * @return  {number} The current volume.
   */
  
  jslash.Audio.prototype.volume = function(arg) {
    if (!arg) {
      return this._audio.volume;
    }
    this._audio.volume = arg;
  };

  /** Calls the callback function when the audio is ready to play, or inmediately if it was still ready.
   * @this {jslash.Audio}
   * @param {function} func The function callback to be called.
   */
  
  jslash.Audio.prototype.ready = function(func) {
    var that = this._audio;
    var intId = setInterval(function() {
                            if (that.readyState) {
                              func();
                              clearInterval(intId);
                            }
                            },READY_TIME);
  };

  /** Represents a color
   * @this {jslash.Color}
   * @constructor
   * @param {number} r The red color component.
   * @param {number} g The green color component.
   * @param {number} b The blue color component.
   * @param {number} a The color transparency. Alpha.
   * @property {number} r The red color component.
   * @property {number} g The green color component.
   * @property {number} b The blue color component.
   * @property {number} a The color transparency. Alpha.
   */

  jslash.Color = function(r,g,b,a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = isDefined(a) ? a : 1;
  };

  /** Tells if a jslash.Color has the same values jslash.Color instance.
   * @this {jslash.Color}
   * @param {number} arg The compared color.
   * @return {boolean}
   */
  
  jslash.Color.prototype.equals = function(arg) {
    return this.r == arg.r && this.g == arg.g && this.b == arg.b && this.a == arg.a;
  };

  /** Converts the color in an equivalent rgba string.
   * @this {jslash.Color}
   * @return {string} The equivalent rgba string.
   */
  jslash.Color.prototype.toString = function() {
    var v = [this.r, this.g, this.b, this.a];
    return 'rgba(' + v.join(',') + ')';
  };

  /*TODO: Implement a imageData cache when the dirty rect arguments for putImageData be fixed on major browsers */
  
  //TODO: document Tileset abstract class
  
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

  function fillMatrix(rows,cols,defValue) {
    if (!isDefined(defValue)) defValue = null;
    var a = [];
    for (var i = 0; i < rows; i++) {
      var r = [];
      a.push(r);
      for (var j = 0; j < cols; j++) {
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

  //TODO: document TiledTileset class
  
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
      var c, r = that.firstrow;
      for (var y = 0; y < ch && r < that.height; y += that.tileheight, r++) {
        c = that.firstcol;
        for (var x = 0; x < cw && c < that.width; x += that.tilewidth, c++) {
          var frame = layer[r][c];
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

  /** Object capable to do an animation over a property of an object.
   * @this {jslash.Animation}
   * @constructor
   * @param object The affected object
   * @param {string} property The property bound to the changes that will be done by the animation.
   * @param {number} time Duration of the animation.
   * @param {function} transform Optional. Function who provides the value to the property.
   */
  
  jslash.Animation = function(object,property,time,transform) {
	/** @private */
    this._boundProp = property;
    /** @private */
    this._boundObj = object;
    /** @private */
    this._time = time;
    /** @private */
    this._transform = transform;
  };

  /** Indicates the first value of the animation
   * @this {jslash.Animation} 
   * @param {number} value The starting value. 
   * @return {jslash.Animation} Returns this.
   */
  
  jslash.Animation.prototype.from = function(value) {
    this._from = value;
    return this;
  };

  /** Indicates the last value of the animation
   * @this {jslash.Animation} 
   * @param {number} value The final value. 
   * @return {jslash.Animation} Returns this.
   */
  
  jslash.Animation.prototype.to = function(value) {
    this._to = value;
    return this;
  };

  /** Turns on the animation
   * @this {jslash.Animation}
   */ 
  
  jslash.Animation.prototype.start = function() {
    var that = this;
    if (!isDefined(this._transform) ) {
      if ( !isDefined(this._to) || !isDefined(this._from)) {
        throw new Error("from and to methods must have been called previously");
      } 
      var inc = (this._to - this._from) / (this._time / ANIMATION_TIME );
      this._boundObj[this._boundProp] = this._from;
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

  /** Creates a gradient object. The object is able to draw a gradient on canvas, and
   * to prebuild a canvas with the properties setted with the methods.
   * @this{jslash.Gradient}
   * @constructor
   * @param {jslash.Point} startPoint Point where the gradient starts.
   * @param {jslash.Point} endPoint Point where the gradient ends.
   * @property {jslash.Point} startPoint Point where the gradient starts.
   * @property {jslash.Point} endPoint Point where the gradient ends.
   */
  jslash.Gradient = function (startPoint,endPoint) {
    this.startPoint = startPoint;
    this.endPoint = endPoint;
  };

  jslash.Gradient.prototype.startColor = function(color) {
    this._startColor = color;
    return this;
  };
  
  jslash.Gradient.prototype.endColor = function(color) {
    this._endColor = color;
    return this;
  };

  jslash.Gradient.prototype.startRadius = function(radius) {
    this._startRadius = radius;
    return this;
  };

  jslash.Gradient.prototype.endRadius = function(radius) {
    this._endRadius = radius;
    return this;
  };

  jslash.Gradient.prototype.radius = function(radius) {
    this._startRadius = this.endRadius = radius;
    return this;
  };
  
  jslash.Gradient.prototype.build = function(canvas) {
    var ctx = canvas.context;
    var anyRadius = isDefined(this._startRadius) || isDefined(this._endRadius);
    if (anyRadius) {
      if (!isDefined(this._startRadius)) {
        this._startRadius = this._endRadius;
      }
      if (!isDefined(this._endRadius)) {
        this._endRadius = this._startRadius;
      }
      this._gradient = ctx.createLinearGradient(this.startPoint.x, this.startPoint.y, this._startRadius,
                                                this.endPoint.x, this.endPoint.y, this._endRadius);

    }
    else {
      this._gradient = ctx.createLinearGradient(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y );
    }
    this._gradient.addColorStop(0, this._startColor);
    this._gradient.addColorStop(1, this._endColor); 
    return this;
  };

  jslash.Gradient.prototype.draw = function(ctx) {
    ctx.fillStyle = this._gradient;
    ctx.fillRect(this.startPoint.x, this.startPoint.y, this.endPoint.x, this.endPoint.y);
  };

  /* jslash private control variables */
  var privIntId;
  var lastTime;
  var lastCanvasId = 0;
  var lastAudioId = 0;
  var auxiliarCanvas;
  var keyEvents = {};
  var keyEventHandlerDispatched;
  var isRunning = false;

  /* jslash private CONSTANTS */
  var READY_TIME = 25;
  var ANIMATION_TIME = 50;

  /* jslash CONSTANTS */
  
  /** jslash.KEYS declares some keycodes to use them easily.
   * @const
   */
  
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

  /** 
   * @deprecated
   * @const
   * Indicates the drawing and updating rate in the frames per second unit.
   */
  
  jslash.fps = 30;

  /** The global jslash colorkey */
  
  jslash.colorkey = new jslash.Color(0, 255, 0);

  /* jslash methods */

  /** Alias to document.getElementById 
   * @param {string} id The identifier of the desired DOM element.
   * @return The DOM Element or null if does not exist.
   */
  
  jslash.byId = function(id) {
    return document.getElementById(id);
  };

  /* TODO: improve the start function in order to delete the mycanvas argument. */

  /** Starts the jslash loop using the requestAnimationFrame native callback.
   * @param {jslash.Canvas} mycanvas Canvas used for the game loop.
   */
  
  jslash.start = function(mycanvas) {
    var that = this;
    var lastTime = new Date().getTime();
    function internalUpdate(t) { 
      if (that.onupdate) {
        that.onupdate(t - lastTime);
        lastTime = t;
      }
      if ( that.onclear) {
        that.onclear();
      }
      if (that.onrefresh) {
        that.onrefresh();
      }
      if (isRunning) {
    	  requestAnimFrame(internalUpdate);
      }
    }
    var requestAnimFrame = getRequestAnimFrame(); 
    this.borders = new jslash.BorderedRectangle(0, 0, mycanvas.width(), mycanvas.height());
    this.mix(this.borders, new this.behaviors.Collidable(jslash.BorderedRectangle));
    isRunning = true;
    requestAnimFrame(internalUpdate);

  };

  /** Stops the jslash game loop.
   */
  
  jslash.stop = function() {
	  isRunning = false;
  };

  /** Adds a key handler, called when a key is pressed
   * @param {number} key The key pressed key-code. Use jslash.KEYS for provide this argument.
   * @param {Function} func The function to call when the key is pressed.
   */
  
  jslash.addKeyEvent = function(key,func) {
    if (!(key in keyEvents)) {
      keyEvents[key] = [];
    }
    keyEvents[key].push(func);
    checkKeydownAdded();
  };

  /** Copies any object to a new one.
   * @param other Object to be copied.
   * @return A newly allocated object copy.
   */
  
  jslash.deepcopy = function(other) {
    var nw = new other.constructor();
    for (var property in other) {
      if (other.hasOwnProperty(property)) {
        nw[property] = other[property];
      }
    }
    return nw;
  };

  /** Allows to call a method for all sequence values 
   * @param sequence Sequence (Map or Array} of arguments of the callback function.
   * @param {Function} func Function to be called for all the arguments.
   */
  
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

  /** Allows to mix an object with a built-in jslash behavior.
   * @param object The object to be mixed.
   * @param mixin A behavior newly allocated object.
   */
  
  jslash.mix = function(object,mixin) {
    for (var property in mixin) {
      if (mixin.hasOwnProperty(property)) {
        object[property] = mixin[property];
      }
    }
  };

  /** Calls the handler n times.
   * @param {number} n The number of times the function will be called.
   * @param {Function} func The function callback.
   */
  
  jslash.times = function(n,func) {
    for(var i = 0; i < n; i++) {
      func();
    }
  };

  /** Prefetchs an array of images URIs or only one.
   * @param arg URI or Array of URIs to be prefetched.
   */
  
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

  /** Prefetchs an array of audio URIs or only one.
   * @param arg URI or Array of URIs to be prefetched.
   */
  
  jslash.prefetchAudioSources = function(arg) {
    if (typeof arg == 'string') {
      arg = [arg];
    }
    jslash.each(arg, function(i,e) { new Image().src = e;});
  };

  /** Extracts the properties of an object
   * @param object Object to extract its properties.
   * @return {Array<string>} Array with the object properties as strings.
   */
  
  jslash.properties = function(object) {
    var prop = [];
    for (var property in object) {
      if (object.hasOwnProperty(property)) {
        prop.push(property);
      }
    }
    return prop;
  };

  function isDefined(value) {
    return !(value == undefined);
  }


  /** Tells if the parameter is defined.
   * @param value Any type of object.
   * @return {boolean} 
   */

  jslash.isDefined = isDefined;

  /** Extracts the values of an object
   * @param object Object to extract its values.
   * @return {Array<T>} Array with the object values.
   */
  
  jslash.values = function(object) {
    return this.properties(object).map(function(e) {return object[e];});
  };

  /** Slices an image in pieces with the rect size.
   * @param {Image} img An Image DOM element.
   * @param {jslash.Rectangle} rect A rectangle who tells how to slice the pieces.
   * @return {Array<jslash.Frame} A sequence of sliced jslash.Frame elements.
   */
  
  jslash.sliceImg = function(img,rect) {
    var frames = [];
    for (var y = rect.y; y < img.height; y += rect.height) {
      for (var x = rect.x; x < img.width; x += rect.width) {
        frames.push(new this.Frame(img, new this.Rectangle(x, y, rect.width, rect.height)));
      }
    }
    return frames;
  };

  /** Calls the function callback when the dom is ready
   * @param {Function} func 
   */
  
  jslash.ready = function(func) {
    window.addEventListener('load', func, true);
  };

  /** Tells if jslash has allocated an auxiliar canvas.
   * @return {boolean} 
   */
  
  jslash.hasAuxiliarCanvas = function() { return isDefined(auxiliarCanvas); };

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

   /* behaviors */
  
  /** jslash.behaviors namespace.
   * Provides a serie of built-in behaviors to mix with graphic objects.
   * @namespace
   */
  
  jslash.behaviors = {};
  
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
    var r = this.shape.collide(left, right);
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

  /** Movable behavior, to handles object who moves depending on elapsed time.
   * Must be used only with jslash.mix.
   * @this {jslash.behaviors.Movable}
   * @constructor
   * @param {number} x The speed in x dimension.
   * @param {number} y The speed in y dimension.
   */
  
  jslash.behaviors.Movable = function(x,y) {
    this.speed = {'x': x, 'y': y};
    this.move = move;
  };

  /** Collidable behavior. Allows objects to test if they collides with others,
   * only binding one of their properties and define its shape.
   * Must be used only with jslash.mix.
   * @this {jslash.behaviors.Collidable}
   * @constructor
   * @param  shape The constructor function of the object shape.
   * @param {string} property The bound property. It provides the shape instance to use to test collisions.
   */
  
  jslash.behaviors.Collidable = function(shape,property) {
    this.shape = shape;
    this._boundProperty = property;
    this.collides = collides;
  };

  /** Movable behavior limited to a rectangular region.
   * Must be used only with jslash.mix.
   * @this {jslash.behaviors.LimitedMovable}
   * @constructor
   * @param {number} x The speed in x dimension.
   * @param {number} y The speed in y dimension.
   * @param {jslash.Rectangle} region The limit boundaries.
   */
  
  jslash.behaviors.LimitedMovable = function(x,y,region) {
    this.speed = { 'x': x, 'y': y };
    this.region = region;
    this.move = moveWithMovementRegion;
  };
  
})();
