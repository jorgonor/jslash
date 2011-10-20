jslash.ready(function() {
  var canvas = new jslash.Canvas('canvas');
  canvas.width(300); canvas.height(200);
  var rect = new jslash.shapes.Rectangle(0,0,50,50);
  rect.color = new jslash.Color(255,0,0);

  var circle = new jslash.shapes.Circle(canvas.center().x,canvas.center().y,30);
  circle.color = new jslash.Color(0,0,0);
  circle.stroke(5);
  
  var white = new jslash.Color(255,255,255).toString();

  jslash.onclear = function() {
    canvas.fill(white);
  };

  jslash.onrefresh = function() {
    canvas.draw(rect);
    canvas.draw(circle);
  };

  jslash.start(canvas);
});
