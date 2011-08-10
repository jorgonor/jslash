var jslash = {}
var core = {};

(function() {
  core.Rectangle = function (x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.center = new core.Point((2*this.x+this.width)/2,(2*this.y+this.height)/2);
  };
  core.Point = function(x,y) {
    this.x = x;
    this.y = y;
  };
  core.ById = function(id) {
    return document.getElementById(id);
  };
  core.Canvas = function(canvas) {
    this.canvas = core.ById(canvas);
    this.context = this.canvas.getContext('2d');
  };
  core.Canvas.prototype.draw = function(drawable) {
    this.context.drawImage(drawable.image(),drawable.x,drawable.y);
  }
})();

jslash.core = core;
