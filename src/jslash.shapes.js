(function() {
	
/** jslash shapes module
 * @namespace
 */
/* TODO: possible refactorization with an abstract Object Shape */
/* TODO: add shadow effects */
	
jslash.shapes = {};

/** Drawable Rectangle
 *  @this {jslash.shapes.Rectangle}
 *  @constructor
 *  @param {number} x 
 *  @param {number} y
 *  @param {number} width 
 *  @param {number} height
 *  @param {jslash.Color} color
 *  @property {number} x 
 *  @property {number} y
 *  @property {number} width 
 *  @property {number} height
 *  @property {jslash.Color} color
 */

jslash.shapes.Rectangle = function(x,y,width,height,color) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = jslash.isDefined(color) ? color : new jslash.Color(0,0,0);
  this._filled = true;
};

/** Object will draw only the shape border with a borderSize.
 * @this {jslash.shapes.Rectangle}
 * @param {number} strokeSize
 */

jslash.shapes.Rectangle.prototype.stroke = function(strokeSize) {
  this._strokeSize = strokeSize;
  this._filled = false;
};

/** Object will fill the shape with the defined color
 * @this {jslash.shapes.Rectangle}
 */
jslash.shapes.Rectangle.prototype.fill = function() {
  this._filled = true;
};

/** Draw the rectangle on the canvas context.
 * @this {jslash.shapes.Rectangle}
 * @param {Context2D} ctx
 */

jslash.shapes.Rectangle.prototype.draw = function(ctx) {
  if (this._filled) {
    ctx.fillStyle = this.color.toString();
    ctx.fillRect(this.x,this.y,this.width, this.height);
  }
  else {
    ctx.strokeStyle = this.color.toString();
    ctx.lineWidth = this._strokeSize;
    ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
};

/** Returns an object with a Sizeable interface
 * @this {jslash.shapes.Rectangle}
 * @return {jslash.Sizeable}
 */

jslash.shapes.Rectangle.prototype.toSizeable = function() {
	var that = this;
	return { width: function() { return that.width; },
		     height: function() { return that.height; }};
};

/** Drawable Circle
 *  @this {jslash.shapes.Circle}
 *  @constructor
 *  @param {number} cx The center x coordinate 
 *  @param {number} cy The center y coordinate
 *  @param {number} radius 
 *  @param {jslash.Color} color
 *  @property {number} center_x The center x coordinate
 *  @property {number} center_y The center y coordinate
 *  @property {number} radius 
 *  @property {jslash.Color} color
 */

jslash.shapes.Circle = function(cx,cy,radius,color) {
  this.center_x = cx;
  this.center_y = cy;
  this.radius = radius;
  this.color = jslash.isDefined(color) ? color : new jslash.Color(0,0,0);
  this._filled = true;
};

/** Object will draw only the shape border with a borderSize.
 * @this {jslash.shapes.Circle}
 * @param {number} strokeSize
 */

jslash.shapes.Circle.prototype.stroke = function(strokeSize) {
  this._strokeSize = strokeSize;
  this._filled = false;
};

/** Object will fill the shape with the defined color
 * @this {jslash.shapes.Circle}
 */

jslash.shapes.Circle.prototype.fill = function() {
  this._filled = true;
};

/** Draws the circle on a canvas
 * @this {jslash.shapes.Circle}
 * @param {Context2D} ctx
 */

jslash.shapes.Circle.prototype.draw = function(ctx) {
  ctx.beginPath();
  ctx.arc(this.center_x,this.center_y,this.radius,0,2*Math.PI,0);
  if (this._filled) {
    ctx.fillStyle = this.color.toString();
    ctx.fill();
  }
  else {
    ctx.strokeStyle = this.color.toString();
    ctx.lineWidth = this._strokeSize;
    ctx.stroke();
  }
  ctx.closePath();
};

/** Drawable Line
 *  @this {jslash.shapes.Line}
 *  @constructor
 *  @param {jslash.Point} from The starting point.
 *  @param {jslash.Point} to The finishing point.
 *  @param {jslash.Color} [color] The line color.
 *  @param {number} [width] The line width.
 *  @property {jslash.Point} from The starting point.
 *  @property {jslash.Point} to The finishing point.
 *  @property {jslash.Color} color The line color.
 *  @property {number} width The line width.
 */

jslash.shapes.Line = function(from,to,color,width) {
	this.from = from;
	this.to = to;
	this.color = jslash.isDefined(color) ? color : new jslash.Color(0,0,0);
	this.width = jslash.isDefined(width) ? width : 1;
}

/** Draws the line on a canvas
 * @this {jslash.shapes.Line}
 * @param {Context2D} ctx
 */

jslash.shapes.Line.prototype.draw = function(ctx) {
	ctx.save();
	ctx.fillStyle = this.color.toString();
	ctx.lineWidth = this.width;
	ctx.beginPath();
	ctx.moveTo(this.from.x,this.from.y);
	ctx.lineTo(this.to.x, this.to.y);
	ctx.closePath();
	ctx.stroke();
	ctx.restore();
};

/* TODO: Path object */

})();
