/** jslash game engine namespace
 * @namespace
 */

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
   * @param {number} [x] Sets the x value of the center point.
   * @param {number} [y] Sets the y value of the center point.
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
   * @return {Array<jslash.Point>} Array containing the four limited points.
   */
  
  jslash.Rectangle.prototype.points = function() {
    return [new jslash.Point(this.x, this.y), new jslash.Point(this.x + this.width, this.y),
             new jslash.Point(this.x, this.y + this.height), new jslash.Point(this.x + this.width, this.y + this.height)];
  };

  /** Checks if the parameter point is contained by the rectangle.
   * @this {jslash.Rectangle} 
   * @param {jslash.Point} pt The candidate of containing point.
   * @return {boolean} 
   */
  
  jslash.Rectangle.prototype.contains = function(pt) {
   return pt.x >= this.x && pt.x <= this.x + this.width &&
             pt.y >= this.y && pt.y <= this.y + this.height;
  };
  
  //TODO: document it.

  jslash.Rectangle.prototype.toSizeable = function() {
    var that = this;
    return { width: function() { return that.width; },
             height: function() { return that.height; } };
  };

  /** Checks if the rectangles collide.
   * @param {jslash.Rectangle} left The first rectangle.
   * @param {jslash.Rectangle} right The second rectangle.
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
   * @extends jslash.Rectangle
   * @this {jslash.BorderedRectangle}
   */
  
  jslash.BorderedRectangle = function() {
    jslash.Rectangle.apply(this, arguments);
  };

  extend(jslash.BorderedRectangle, new jslash.Rectangle());

  
  /** Checks if the right rectangle collides with the borders of the first rectangle.
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

  /** Wrapper to HTMLCanvasElement. It can draw any drawable object.
   * It is used to handle HTML-defined canvas or to create one if it's needed.
   * @constructor 
   * @this {jslash.Canvas}
   * @param {string} [canvasId] Identifier of the HTML-defined Canvas Element to use.
   */
  
  jslash.Canvas = function(canvasId) {
    if (!isDefined(canvasId)) {
      var c = createCanvasElement();
      canvasId = c.id;
    }
    this._canvas = jslash.byId(canvasId);
    this.context = this._canvas.getContext('2d');
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
   * @param {jslash.Color|string} color The color to fill the canvas.
   */
  
  jslash.Canvas.prototype.fill = function(color) {
    this.context.fillStyle = color.toString();
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
   * @param {number} [arg] The new value of the canvas width.
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
   * @param {number} [arg] The new value of the canvas height.
   * @return {number} Returns the current canvas height.
   */
  
  jslash.Canvas.prototype.height = function(arg) {
    if (!isDefined(arg)) {
      return this._canvas.height;
    }
    this._canvas.height = arg;
  };

  /** Binds an event handler when the event attached is fired 
    * @this {jslash.Canvas}
    * @param {String} eventName The event name.
    * @param {Function} fn The event callback function.
    */

  jslash.Canvas.prototype.bind = function(eventName,fn) { 
    var current_canvas = this._canvas;
    var inter_function = function(evt) { 
      var e = {};
      e.x = evt.clientX - current_canvas.offsetLeft;
      e.y = evt.clientY - current_canvas.offsetTop;
      fn(e);
    };
    current_canvas.addEventListener(eventName,inter_function,true);
  };


  /** Sprite hierarchy base class.
   * @constructor
   * @this {jslash.BaseSprite}
   */
  
  jslash.BaseSprite = function () {
    this.alpha = 1.0;
  };
  
  /** Returns or sets the center of the sprite
   * @this {jslash.BaseSprite}
   * @param {number} [x] The new x coordinate value of the center point.
   * @param {number} [y] The new y coordinate value of the center point.
   * @return {jslash.Point} The current center point of the sprite.
   */

  jslash.BaseSprite.prototype.center = function(x,y) {
    var r = this.canvasRect().center(x, y);
    if (isDefined(r)) { //getter called
      return r;
    }
  };
  
  /** Gets the width of the sprite.
   * @this {jslash.BaseSprite}
   * @return {number} The current width of the sprite canvas rectangle.
   */
  
  jslash.BaseSprite.prototype.width = function() {
    return this.canvasRect().width;
  };
  
  /** Gets the height of the sprite.
   * @this {jslash.BaseSprite}
   * @return {number} The current height of the sprite canvas rectangle.
   */
  
  jslash.BaseSprite.prototype.height = function() {
    return this.canvasRect().height;
  };
  
  /** Returns the current image of the Sprite. Required interface method
   * @this {jslash.BaseSprite}
   * @function
   * @return {Image}
   */
  
  jslash.BaseSprite.prototype.image = notImplementedFunc;

  /** Gets/Sets the image rectangular area taken to draw. Required interface method
   * @this {jslash.BaseSprite}
   * @function
   * @return {jslash.Rectangle}
   */
  
  jslash.BaseSprite.prototype.imageRect = notImplementedFunc;

  /** Gets/Sets the rectangular area where the image will be drawn on canvas. Required interface method.
   * @this {jslash.BaseSprite}
   * @function
   * @return {jslash.Rectangle}
   */
  
  jslash.BaseSprite.prototype.canvasRect = notImplementedFunc;

  /** Draws the sprite using the image and imageRect interface.
   * @this {jslash.BaseSprite}
   * @param {Context2D} ctx The canvas context2D where it will be drawn.
   */
  
  jslash.BaseSprite.prototype.draw = function(ctx) {
    var rotationActive = isDefined(this.angle);
    var imgRect = this.imageRect();
    var cvsRect = this.canvasRect();
    ctx.save();
    ctx.globalAlpha = this.alpha;
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
    ctx.restore();
  };

  /** Scales the sprite. 
   * @this {jslash.BaseSprite}
   * @param {number} factor The desired scaling factor.
   */
  
  jslash.BaseSprite.prototype.scale = function(factor) {
    var sr = this.canvasRect();
    sr.width *= factor;
    sr.height *= factor;
    this._canvasSubrect = sr;
  };

  /** Rotates the sprite.
   * @this {jslash.BaseSprite}
   * @param {number} a The desired angle to rotate in radians.
   */
  
  jslash.BaseSprite.prototype.rotate = function(a) {
    if (!isDefined(this.angle)) {
      this.angle = 0.0;
    }
    this.angle += a;
  };

  /** Sprite, This class can manipulate the image properties,
   * width, height, scale, rotation and position on the canvas
   * @constructor
   * @this {jslash.Sprite}
   * @extends jslash.BaseSprite
   * @param {Image} img The image of the sprite.
   * @param {jslash.Point} [position] Top-left point where it will be drawn.
   */

  jslash.Sprite = function(img,position) {
	/** @private */
    jslash.BaseSprite.apply(this);
    this._img = img;
    var x = isDefined(position) ? position.x : 0,
        y = isDefined(position) ? position.y : 0;
    /** @private */
    this._canvasSubrect = new jslash.Rectangle(x, y, img.width, img.height);
    /** @private */
    this._imageSubrect = new jslash.Rectangle(0, 0, img.width, img.height);
  };

  extend(jslash.Sprite, new jslash.BaseSprite());

  /** Returns the sprite image 
   * @this {jslash.Sprite}
   * @return {Image} The current sprite image.
   */
  
  jslash.Sprite.prototype.image = function() {
    return this._img;
  };

  /** Returns or sets the rectangle of the image region drawn on canvas.
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

  /** A group of images which changes of image depending on the time.
   * @constructor
   * @extends jslash.BaseSprite
   * @this {jslash.AnimatedSprite}
   * @param {Array<jslash.Frame>} frames Sequence of the frames to be drawn in the same order.
   */
  
  jslash.AnimatedSprite = function(frames) {
    jslash.BaseSprite.apply(this);
	/** @private */
    this._frames = frames;
    /** @private */
    this._currentFrame = 0;
  };

  extend(jslash.AnimatedSprite, new jslash.BaseSprite());

  /** Useful when we need to set the onrefresh property of an AnimatedSprite.
   *  It calls the next method when the jslash.onrefresh method draws n times 
   *  the sprite.
   *  @param {number} [limit] The number of drawns before the image changes.
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

  /** Returns the current image rectangle. Used to draw the current sprite.
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
   * @param {jslash.Rectangle} [arg] It sets the new canvas rectangle.
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
   * @param {number} [x] The new position x value.
   * @param {number} [y] The new position y value.
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
   * @extends jslash.BaseSprite
   * @param {Array<jslash.Sprite>} sprites An array of jslash.Sprite instances or a sequence inserted as different arguments.
   * @param {jslash.Canvas} [auxiliarCanvas] If any canvas is introduced as the last parameter, it will be used as an
   * auxiliar canvas to internal drawings.
   */
  
  jslash.CompositeSprite = function() {
    jslash.BaseSprite.apply(this);
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

  extend(jslash.CompositeSprite, new jslash.BaseSprite());

  /** Returns or sets the canvas position where the image will be drawn.
   * @this {jslash.CompositeSprite}
   * @override
   * @param {number} [x] The new position x value.
   * @param {number} [y] The new position y value.
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

  /** Represents a text. Drawable.
   * @this {jslash.Text}
   * @constructor
   * @param {string} txt The string to be drawn.
   * @param {number} [x] The x position where it will be written.
   * @param {number} [y] The y position where it will be written.
   * @property {string} text The string to be drawn.
   * @property {string} font The text font.
   * @property {jslash.Color} color The color to draw the text.
   * @property {string} weight The CSS weight used to draw the text.
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
    ctx.save();

    ctx.fillStyle = this.color.toString();
    ctx.font = [this.weight, this.size, this.font].join(' ').trim();
    ctx.fillText(this.text, this.x, this.y + this.size);
    ctx.restore();

  };

  /** Returns the text width that occupies on canvas.
   * @this {jslash.Text}
   * @param {jslash.Canvas} canvas The canvas where it will be drawn.
   * @return {number} The width size in pixels.
   */
  
  jslash.Text.prototype.width = function(canvas) {
    var ctx = canvas.context;
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.font = [this.weight, this.size, this.font].join(' ');
    var w = ctx.measureText(this.text).width;
    ctx.restore();
    return w;
  };

  /** Returns the text height that occupies on canvas.
   * @this {jslash.Text}
   * @return {number} The height size in pixels.
   */
  
  jslash.Text.prototype.height = function() {
    return this.size;
  };

  /** Audio object to play sound effects or melody musics based on HTMLAudioElement.
   * @this {jslash.Audio}
   * @constructor
   * @param {string} [id] The identifier of a HTML-defined Audio Element.
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
   * @param {string} src The URI of the audio resource to be loaded.
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

  /** Stops the audio and restarts the time.
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

  /** Pause the audio without reseting the time
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
   * @param {number} [arg] Sets the new volume. Must be between 0 and 1.
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
   * @param {Function} func The function callback to be called.
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

  /** Tells if a jslash.Color is equal to other jslash.Color instance.
   * @this {jslash.Color}
   * @param {number} other The compared color.
   * @return {boolean}
   */
  
  jslash.Color.prototype.equals = function(other) {
    return this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a;
  };

  /** Converts the color in an equivalent rgba string.
   * @this {jslash.Color}
   * @return {string} The equivalent rgba string.
   */
  jslash.Color.prototype.toString = function() {
    var v = [this.r, this.g, this.b, this.a];
    return 'rgba(' + v.join(',') + ')';
  };

  /*TODO: Implement a imageData cache when 
   * the dirty rect arguments for putImageData be fixed on major browsers */
  
  /** Tileset Base Object
   *  @this {jslash.BaseTileset}
   *  @constructor
   *  @property {number} alpha Sets/Gets the alpha used when the Tileset is rendered.
   */

  jslash.BaseTileset = function() {
    this.firstcol = 0;
    this.firstrow = 0;
    this.alpha = 1.0;
  };

  /** Scrolls the Tileset one tile down.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Sizeable} sizeable Object which follows the Sizeable interface.
   *  @return {boolean} if the scroll takes place, returns true, false otherwise.
   */

  jslash.BaseTileset.prototype.scrollDown = function(sizeable) {
    var h = sizeable.height();
    var y = (this.firstrow + 1) * this.tileheight;
    if (y + h <= this.pixelsHeight()) {
      this.firstrow++;
      return true;
    }
    return false;
  };

  /** Tells if the scroll down is going to do any scrolling.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Sizeable} sizeable Object which follows the Sizeable interface. 
   * @return {boolean} 
   */
  jslash.BaseTileset.prototype.canScrollDown = function(sizeable) {
    var h = sizeable.height();
    var y = (this.firstrow + 1) * this.tileheight;
    return y + h <= this.pixelsHeight();
  };

  jslash.BaseTileset.prototype.scrollRight = function(sizeable) {
    var w = sizeable.width();
    var x = (this.firstcol + 1) * this.tilewidth;
    if (x + w <= this.pixelsWidth()) {
      this.firstcol++;
      return true;
    }
    return false;
  };

  /** Tells if the scroll right is going to do any scrolling.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Sizeable} sizeable Object which follows the Sizeable interface. 
   * @return {boolean} 
   */
  jslash.BaseTileset.prototype.canScrollRight = function(sizeable) {
    var w = sizeable.width();
    var x = (this.firstcol + 1) * this.tilewidth;
    return x + w <= this.pixelsWidth();
  };

  jslash.BaseTileset.prototype.scrollUp = function(sizeable) {
    if (this.firstrow > 0) {
      this.firstrow--;
      return true;
    }
    return false;
  };

  /** Tells if the scroll up is going to do any scrolling.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Sizeable} sizeable Object which follows the Sizeable interface. 
   * @return {boolean} 
   */
  jslash.BaseTileset.prototype.canScrollUp = function(sizeable) 
  {
    return this.firstrow > 0;
  };

  jslash.BaseTileset.prototype.scrollLeft = function(sizeable) {
    if (this.firstcol > 0) {
      this.firstcol--;
      return true;
    }
    return false;
  };

  /** Tells if the scroll left is going to do any scrolling.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Sizeable} sizeable Object which follows the Sizeable interface. 
   * @return {boolean} 
   */

  jslash.BaseTileset.prototype.canScrollLeft = function(sizeable) {
    return this.firstcol > 0;
  };

  /** Returns the amount of pixels along the width dimension
   * @this {jslash.BaseTIleset}
   * @return {number}
   */

  jslash.BaseTileset.prototype.pixelsWidth = function() {
    return this.width * this.tilewidth;
  };

  /** Returns the amount of pixels along the height dimension
   * @this {jslash.BaseTileset}
   * @return {number}
   */
  jslash.BaseTileset.prototype.pixelsHeight = function() {
    return this.height * this.tileheight;
  };

  /** Maps an absolute position to a relative one.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Point} pos The absolute position.
   *  @return {jslash.Point} The relative position.
   */

  jslash.BaseTileset.prototype.toRelative = function(pos) {
    var np = jslash.deepcopy(pos);
    np.x -= this.firstcol * this.tilewidth;
    np.y -= this.firstrow * this.tileheight;
    return np;
  };

  /** Maps a relative position to an absolute one.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Point} pos The relative position.
   *  @return {jslash.Point} The absolute position.
   */

  jslash.BaseTileset.prototype.toAbsolute = function(pos) {
    var np = jslash.deepcopy(pos);
    np.x += this.firstcol * this.tilewidth;
    np.y += this.firstrow * this.tileheight;
    return np;
  };

   /** From a relative position returns its cell in the map.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Point} pos A relative position.
   *  @return {object} A cell with a row and a col property. 
   */

  jslash.BaseTileset.prototype.toCell = function(pos) {
    var r = this.firstrow, c = this.firstcol;
    c += Int.div(pos.x,this.tilewidth);
    r += Int.div(pos.y , this.tileheight);
    return { row: r, col: c };
  };

  jslash.BaseTileset.prototype.putObstacleOn = notImplementedFunc;

  jslash.BaseTileset.prototype.cellIsObstacle = notImplementedFunc;

   /** Tells if in a rectangular area has any obstacle.
   *  @this {jslash.BaseTileset}
   *  @param {jslash.Rectangle} rect A rectangular area.
   *  @return {boolean} 
   */

  jslash.BaseTileset.prototype.isFreeArea = function(rect) {
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

  /** Gets/sets the canvas rectangular region where the canvas will be drawn 
    * @this {jslash.BaseTileset}
    * @param {jslash.Rectangle} [rect] The rectangular region 
    * @return {jslash.Rectangle} The current rectangular region, undefined if it isn't setted yet.
    */
  jslash.BaseTileset.prototype.canvasRect = function(rect) {
    if (isDefined(rect)) this._canvasRect = rect;
    return this._canvasRect;
  };

  /* jslash.TiledTileset */

  /* privates */

  function loadSources(obj,sources) {
    obj.images = [];
    jslash.each(sources, function(i,e) {
      jslash.prefetchImg(e);
      obj.images.push(jslash.images[e]);
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
    var imagesSources = [],
        layers = [],
        tilesets = [],
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

  /** A BaseTileset extension able to handle with TMX formatted tilesets
    * @this{jslash.TiledTileset}
    * @constructor
    * @extends jslash.BaseTileset 
    * @param {string|object} arg A string or an object loaded from a JSON-formatted
    * TMX map (tmx2json.py script is useful when you need to convert TMX files)
    */

  jslash.TiledTileset = function(arg) {
    jslash.BaseTileset.apply(this);
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

  extend(jslash.TiledTileset, new jslash.BaseTileset());

  /* public methods */

  /** Loads a JSON-formatted TMX map from a remote URI
    * @this{jslash.TiledTileset}
    * @param {string} URI JSON-formatted TMX Map URI.
    */ 

  jslash.TiledTileset.prototype.load = function(URI) {
    var that = this;
    var httpReq = new jslash.net.Request(URI,"GET");
    httpReq.send(function(s) {
      var jsonParsed = JSON.parse(s);
      handleTMXJSON(that, jsonParsed);
    });
  };

  /** Draws the TiledTileset on a Canvas context.
    * @this{jslash.TiledTileset}
    * @param {Context2D} ctx 
    */ 

  jslash.TiledTileset.prototype.draw = function(ctx) {
    ctx.save();
      
    ctx.globalAlpha = this.alpha;
    
      var cw = isDefined(this._canvasRect) ? this._canvasRect.width : ctx.canvas.width;
      var ch = isDefined(this._canvasRect) ? this._canvasRect.height :  ctx.canvas.height;
      var x_ini = isDefined(this._canvasRect) ? this._canvasRect.x : 0;
      var y_ini = isDefined(this._canvasRect) ? this._canvasRect.y : 0;
      var that = this;
      jslash.each(this.layers, function(k,layer) {
        var c, r = that.firstrow;
        for (var y = y_ini; y < ch && r < that.height; y += that.tileheight, r++) {
          c = that.firstcol;
          for (var x = x_ini; x < cw && c < that.width; x += that.tilewidth, c++) {
            var frame = layer[r][c];
            if (frame) {
              var framerect = frame.rect();
              ctx.drawImage(frame.image(), framerect.x, framerect.y, framerect.width, framerect.height,
                                          x, y, framerect.width, framerect.height);
            }
          }
        }
      });
      
    ctx.restore();
  };

  /** Tells if a cell has any obstacle.
   * @this{jslash.TiledTileset}
   * @param {number} row The cell row.
   * @param {number} col The cell column.
   * @returns {boolean}  
   */

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

  /** Calls the callback function when the TiledTileset is 
    * loaded from the remote resource.
    * @this {jslash.TiledTileset}
    * @param {Function} func The callback function */

  jslash.TiledTileset.prototype.ready = function(func) {
    var that = this;
    var intId = setInterval(function() {
      if (that._ready) {
        func();
        clearInterval(intId);
      }
    },READY_TIME);
  };

  /** Puts an obstacle on a cell 
    * @this {jslash.TiledTileset}
    * @param {number} row The cell row.
    * @param {number} col The cell col.
    */

  jslash.TiledTileset.prototype.putObstacleOn = function(row,col) {
    this.obstacles[row][col] = true;
  };

  /** Object capable to do a change over a property of an object.
   *  without depending on jslash.onupdate event    
   * @this {jslash.Animation}
   * @constructor
   * @param object 
   * @param {string} property The property bound to the changes that will be done by the animation.
   * @param {number} time Duration of the animation.
   * @param {Function} [transform] Function providing the value to the property in the animation process.
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
   * to prebuild it on a canvas with the properties setted with the methods.
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
    this._canvasRect = new jslash.Rectangle(startPoint.x, startPoint.y,
                                            endPoint.x - startPoint.x, endPoint.y - startPoint.y );
    this._intermediateColors = [];
  };

  /* TODO: allow stops Colors to the jslash.Gradient API */

   /** Sets the starting color. 
   * @this{jslash.Gradient}
   * @param {jslash.Color} color 
   * @return {jslash.Gradient} The same object for fluid API purposes.
   */

  jslash.Gradient.prototype.startColor = function(color) {
    this._startColor = color;
    return this;
  };

  /** Sets the ending color. 
   * @this{jslash.Gradient}
   * @param {jslash.Color} color 
   * @return {jslash.Gradient} The same object for fluid API purposes.
   */

  jslash.Gradient.prototype.endColor = function(color) {
    this._endColor = color;
    return this;
  };
  
  /** Sets an intermediate color.
   * @this {jslash.Gradient}
   * @param {number} at A number between 0 and 1 which indicates the 
   * @param {jslash.Color} color 
   * @return {jslash.Gradient} The same object for fluid API purposes.
   */
  
  jslash.Gradient.prototype.colorAt = function(at,color) {
	  this._intermediateColors.push({at: at, color: color});
	  return this;
  }

  /** Sets the starting radius. 
   * @this{jslash.Gradient}
   * @param {number} radius
   * @return {jslash.Gradient} The same object for fluid API purposes.
   */

  jslash.Gradient.prototype.startRadius = function(radius) {
    this._startRadius = radius;
    return this;
  };

  /** Sets the starting radius. 
   * @this{jslash.Gradient}
   * @param {number} radius
   * @return {jslash.Gradient} The same object for fluid API purposes.
   */

  jslash.Gradient.prototype.endRadius = function(radius) {
    this._endRadius = radius;
    return this;
  };

  /** Sets both radius to the same value. 
   * @this{jslash.Gradient}
   * @param {number} radius
   * @return {jslash.Gradient} The same object for fluid API purposes.
   */

  jslash.Gradient.prototype.radius = function(radius) {
    this._startRadius = this.endRadius = radius;
    return this;
  };
 
  /** Sets/Gets the canvasRect occupied by the gradient.
    * @this{jslash.Gradient}
    * @param {jslash.Rectangle} rect 
    * @return {jslash.Rectangle}
    */
  jslash.Gradient.prototype.canvasRect = function(rect) {
    if (!isDefined(rect)) {
      return this._canvasRect;
    }
    this._canvasRect = rect;
  };

  /** Builds the gradient object 
    * @this{jslash.Gradient}
    * @param {jslash.Canvas} canvas The canvas where the gradient will be drawn.
    * @return {jslash.Gradient} The this object returned for fluid API.
    */

  jslash.Gradient.prototype.build = function(canvas) {
    var ctx = canvas.context;
    var that = this;
    var anyRadius = isDefined(this._startRadius) || isDefined(this._endRadius);
    if (anyRadius) {
      if (!isDefined(this._startRadius)) {
        this._startRadius = this._endRadius;
      }
      if (!isDefined(this._endRadius)) {
        this._endRadius = this._startRadius;
      }
      this._gradient = ctx.createRadialGradient(this.startPoint.x, this.startPoint.y, this._startRadius,
                       this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y, this._endRadius);

    }
    else {
      this._gradient = ctx.createLinearGradient(this.startPoint.x, this.startPoint.y, 
                       this.endPoint.x - this.startPoint.x, this.endPoint.y - this.startPoint.y);
    }
    this._gradient.addColorStop(0, this._startColor);
    jslash.each(this._intermediateColors, function(i,e) {
    	that._gradient.addColorStop(e.at,e.color);
    });
    this._gradient.addColorStop(1, this._endColor); 
    return this;
  };

  /** Draws the canvas using a canvas context
    * @this{jslash.Gradient}
    * @param {Context2D} ctx
    */

  jslash.Gradient.prototype.draw = function(ctx) {
    ctx.fillStyle = this._gradient;
    ctx.fillRect(this._canvasRect.x, this._canvasRect.y,
                 this._canvasRect.width, this._canvasRect.height);
  };

 /** Drawable object to draw a progress bar. 
   * jslash handles internally when has to be increased the bar.
   * @this{jslash.ProgressBar}
   * @constructor
   * @param {number} x 
   * @param {number} y
   */

  jslash.ProgressBar = function(x,y) {
	  this.x = x;
    this.y = y;
  };

  /** Sets the borderColor parameter
    * @this{jslash.ProgressBar}
    * @param {jslash.Color} color
    * @return {jslash.ProgressBar} this element.
    */

  jslash.ProgressBar.prototype.borderColor =
  function(color) {
    this._borderColor = color;
    return this;
  };

  /** Sets the borderWidth parameter
    * @this{jslash.ProgressBar}
    * @param {number} width
    * @return {jslash.ProgressBar} this element.
    */

  jslash.ProgressBar.prototype.borderWidth =
  function(width) {
    this._borderWidth = width;
    return this;
  };

  /** Sets the backgroundColor parameter
    * @this{jslash.ProgressBar}
    * @param {jslash.Color} color
    * @return {jslash.ProgressBar} this element.
    */

  jslash.ProgressBar.prototype.backgroundColor = 
  function(color) {
    this._backgroundColor = color;
    return this;
  };

  /** Sets the width parameter
    * @this{jslash.ProgressBar}
    * @param {number} width
    * @return {jslash.ProgressBar} this element.
    */

  jslash.ProgressBar.prototype.width =
  function(width) {
    this._width = width;
    return this;
  };

  /** Sets the height parameter
    * @this{jslash.ProgressBar}
    * @param {height} height
    * @return {jslash.ProgressBar} this element.
    */

  jslash.ProgressBar.prototype.height =
  function(height) {
    this._height = height;
    return this;
  };

   /** Draws the ProgressBar onto a canvas Context.
    * @this{jslash.ProgressBar}
    * @param {Context2D} ctx
    */

  jslash.ProgressBar.prototype.draw =
  function(ctx) { 
    var ratioCompleted = (elementsLoaded ) / totalElementsRequested; 

    /* Draw the filled bar */
    ctx.save();
    var width = (this._width - this._borderWidth * 2) * ratioCompleted;
    ctx.fillStyle = this._backgroundColor.toString();
    ctx.fillRect(this.x + this._borderWidth, this.y + this._borderWidth,
                 width, this._height - this._borderWidth * 2);
    ctx.restore();
    
    /* Draw the border bar */
    ctx.save();
    ctx.strokeStyle = this._borderColor.toString();
    ctx.lineWidth = this._borderWidth;
    ctx.strokeRect(this.x,this.y,this._width,this._height);
    ctx.restore();
  };


  /* jslash private control variables */
  var lastCanvasId = 0;
  var lastAudioId = 0;
  var auxiliarCanvas;
  var keyEvents = {};
  var keyEventHandlerDispatched;
  var loadDispatched = false;
  var isRunning = false;
  var elementsLoaded = 0;
  var totalElementsRequested = 0;

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

  /** jslash.MOUSE declares four mouse events useful when you need to bind them 
    * @const */
  jslash.MOUSE = {
    MOUSEDOWN : "mousedown",
    MOUSEMOVE : "mousemove",
    MOUSEUP : "mouseup",
    CLICK : "click"
  };

  /** The global jslash colorkey 
    * @deprecated */
  
  jslash.colorkey = new jslash.Color(0, 255, 0);

  /* jslash methods */

  /** Alias to document.getElementById 
   * @param {string} id The identifier of the desired DOM element.
   * @return {object} The DOM Element or null if it doesn't exist.
   */
  
  jslash.byId = function(id) {
    return document.getElementById(id);
  };

  /** Starts the jslash loop using the requestAnimationFrame native callback.
   *  @param {jslash.Canvas} [mycanvas] If it is provided is used to build the jslash.borders object.
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
    if (isDefined(mycanvas)) {
      this.borders = new jslash.BorderedRectangle(0, 0, mycanvas.width(), mycanvas.height());
      this.mix(this.borders, new this.behaviors.Collidable(jslash.BorderedRectangle));
    }
    isRunning = true;
    requestAnimFrame(internalUpdate);

  };

  /** Stops the jslash game loop.
   */
  
  jslash.stop = function() {
	  isRunning = false;
  };

  /** Adds a key handler, called when a key is pressed
   * @param {number} key The key pressed key-code. Use jslash.KEYS to provide this argument.
   * @param {Function} func The callback function called when the key is pressed.
   */
  
  jslash.addKeyEvent = function(key,func) {
    if (!(key in keyEvents)) {
      keyEvents[key] = [];
    }
    keyEvents[key].push(func);
    checkKeydownAdded();
  };

  /** Copies any object to a new one.
   * @param {object} other Object to be copied.
   * @return {object} A newly allocated object copy.
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
   * @param {object|Array} sequence Sequence of arguments of the callback function.
   * @param {Function} func Function to be called for all the arguments. If the sequence is an object,
   * the function is called with the property and the value. If it is an array, it is called with the index and the value.
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

  /** Maps a sequence of values using a callback function to change the sequence values.
   * @param {object|Array} sequence Sequence of arguments of the callback function.
   * @param {Function} func Function to be called for all the arguments. If the sequence is an object,
   * the function is called with the property and the value. If it is an array, it is called with the index and the value.
   * @return {object|Array} The sequence with the changes defined on the callback function.
   */

  jslash.map = function(sequence,func) {
    if (sequence instanceof Array) {
      var r = [];
      for (var i = 0; i < sequence.length; i++) {
        r.push(func(i, sequence[i]));
      }
      return r;
    }
    else if (typeof sequence == 'object') {
      var r = {},
          fRes;
      for (var property in sequence) {
        if (typeof sequence[property] != 'function' &&
            sequence.hasOwnProperty(property)) {
          fRes = func(property, sequence[property]);
          r[property] = fRes;
        }
      }
      return r;
    }
  };

  /** OOP Helper. Allows a cleaner way to implement 'inheritance' with Javascript prototypes.
   * @function 
   * @param {Function} func The class to extend constuctor
   * @param {object} toExtend An instance of the new prototype assigned to the constructor.
   */
  jslash.extend = extend;
  
  /** Allows to mix an object with a built-in jslash behavior or
   * a user-defined mix-in.
   * @param object The object to be mixed.
   * @param mixin A freshly allocated behavior object.
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
   * @param {Function} func The callback function.
   */
  
  jslash.times = function(n,func) {
    for(var i = 0; i < n; i++) {
      func();
    }
  };

  /** Prefetchs an array of images URIs or only one.
   * @param {string} arg URI or Array of URIs to be prefetched.
   */
  
  jslash.prefetchImg = function(arg) {
    if (!isDefined(this.images)) {
      this.images = {};
    }
    if (typeof arg == 'string') {
      arg = [arg];
    }
    var that = this;
    jslash.each(arg, function(i,e) {
    	totalElementsRequested++;
    	var im = new Image(); 
    	im.src = e; 
    	im.addEventListener("load",function() {
    		elementsLoaded++;
    	});
    	that.images[e] = im; 
    });
  };

  /** Prefetchs an array of audio URIs or only one.
   * @param arg URI or Array of URIs to be prefetched.
   */
  
  jslash.prefetchAudioSources = function(arg) {
    if (typeof arg == 'string') {
      arg = [arg];
    }
    jslash.each(arg, function(i,e) {
    	var audio = new Audio();
    	audio.src = e;
    	totalElementsRequested++;
    	audio.addEventListener("load",function() {
    		elementsLoaded++;
    	},true);
    });
  };

  /** Extracts the properties of an object
   * @param {object} object Object to extract its properties.
   * @return {string[]} Array with the object properties as strings.
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


  /** Checks if the parameter is defined.
   * @param {object} value Any type of object.
   * @function
   * @return {boolean} 
   */

  jslash.isDefined = isDefined;

  /** Extracts the values of an object
   * @param {object} object Object to extract its values.
   * @return {T[]} Array with the object values.
   */
  
  jslash.values = function(object) {
    return this.properties(object).map(function(e) {return object[e];});
  };

  /** Slices an image in pieces with the rect size.
   * @param {Image} img A DOM Image element.
   * @param {jslash.Rectangle} rect A rectangle which tells how to slice the pieces.
   * @return {jslash.Frame[]} A sequence of sliced jslash.Frame elements.
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

  /** Calls the function callback when all the page content is loaded
   * @param {Function} func 
   */
  
  jslash.ready = function(func) {
    window.addEventListener('load', func, true);
  };

  /** Calls the function callback when the DOM is ready
   * @param {Function} func 
   */
  
  jslash.domReady = function(func) {
    window.addEventListener('DOMContentLoaded', func, true);
  };
  /** Starts a progressbar progress over the canvas provided 
   * @param {jslash.Canvas} canvas 
   * @param {Function} [func]
   */
  
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

  /** jslash.behaviors namespace.
   * Provides a serie of built-in behaviors to mix with graphic objects.
   * @namespace
   */
  
  jslash.behaviors = {};
  
  /* behaviors functions:
 *   explaining, It's being used a single variable for the functions 
 *   in order to avoid new function object allocations */

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

  /** Movable behavior to handles object which moves depending on elapsed time.
   * Must be used only with jslash.mix method.
   * @this {jslash.behaviors.Movable}
   * @constructor
   * @param {number} x The speed in x dimension.
   * @param {number} y The speed in y dimension.
   */
  
  jslash.behaviors.Movable = function(x,y) {
    this.speed = {'x': x, 'y': y};
    
    /** Moves the object depending on the speed and the time
      * @this{jslash.behaviors.Movable}
      * @function
      * @param dt Elapsed time to move the mixed object 
      */
    this.move = move;
  };

  /** Collidable behavior. Allows objects to test if they collides with others,
   * only binding one of their properties and defining its shape.
   * Must be used only with jslash.mix.
   * @this {jslash.behaviors.Collidable}
   * @constructor
   * @param  shape The constructor function of the object shape.
   * @param {string} property The bound property. It provides the shape instance to use to test collisions.
   */
  
  jslash.behaviors.Collidable = function(shape,property) {
    this.shape = shape;
    this._boundProperty = property;
    /** Tests if a collidable object collides with another
      @this{jslash.behaviors.Collidable}
      @function
      @param {jslash.behaviors.Collidable} other 
    */
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

    /** Moves the object depending on the speed and the time.
      * It also checks if the object is out the bounds defined on construction time.
      * @this {jslash.behaviors.LimitedMovable}
      * @function
      * @param dt Elapsed time to move the mixed object 
      */
    this.move = moveWithMovementRegion;
  };
  
  /* JSLASH EVENT HANDLERS NEEDED */
  
  window.addEventListener("load",function() {
	  loadDispatched = true;
  },true);
  
  function createHttpQuery(object) { 
    var query = [];
    jslash.each(object,function(key,value) {
      query.push(key + "=");
      query.push(encodeURIComponent(value));
      query.push("&");
    });
    query.pop();
    return query.join("");
  }

  /** jslash net functions namespace
    * @namespace
    */
  jslash.net = {};

  /** Object to send requests asynchronously getting resources
    * dynamically
    * @this {jslash.net.Request}
    * @constructor
    * @param {String} [src]
    * @param {String} [method]
    */

  jslash.net.Request = function(src,method) {
    this.src = isDefined(src) ? src : "";
    this.method = isDefined(method) ? method.toUpperCase() : "GET";
    this._xhr = new XMLHttpRequest();
  };

  /** Send a request and returns the content as a string
    * @this {jslash.net.Request}
    */

  jslash.net.Request.prototype.send = 
   function(arg1,arg2) {
    var xhr = this._xhr;
    var args,fn;
    if (isDefined(arg2)) {
      if (arg2 instanceof Function) {
        fn = arg2;
      }
      else {
        throw new Error("if second parameter is specified must be a Function");
      }
      if ( isDefined(arg1) && typeof arg1 == "object" ) {
        args = arg1;
      }
    }

    var url = this.src;

    if (isDefined(args) && this.method == "GET") {
      url += "?" + createHttpQuery(args);
    }

    xhr.open(this.method,url,true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        fn(xhr.responseText);
      }
    };
    var data = null;
    if (this.method == "POST") {
      //https://developer.mozilla.org/en/AJAX/Getting_Started
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');  
      data = createHttpQuery(args);
    }
    xhr.send(data);
   };

})();
