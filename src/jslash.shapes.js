(function() {
	
	/* TODO: document the shapes module */
	
jslash.shapes = {};

jslash.shapes.Rectangle = function(x,y,width,height,color) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.color = jslash.isDefined(color) ? color : new jslash.Color(0,0,0);
  this._filled = true;
};

jslash.shapes.Rectangle.prototype.stroke = function(strokeSize) {
  this._strokeSize = strokeSize;
  this._filled = false;
};

jslash.shapes.Rectangle.prototype.fill = function() {
  this._filled = true;
};

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

jslash.shapes.Circle = function(cx,cy,radius,color) {
  this.center_x = cx;
  this.center_y = cy;
  this.radius = radius;
  this.color = jslash.isDefined(color) ? color : new jslash.Color(0,0,0);
  this._filled = true;
};

/* TODO: possible refactorization with an abstract Object Shape */

jslash.shapes.Circle.prototype.stroke = function(strokeSize) {
  this._strokeSize = strokeSize;
  this._filled = false;
};

jslash.shapes.Circle.prototype.fill = function() {
  this._filled = true;
};

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

})();
