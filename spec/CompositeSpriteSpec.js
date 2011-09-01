require('jslash');

describe('CompositeSprite',function() {

  var cs;  
  var s1,s2;

  beforeEach(function() {
    cs = new jslash.CompositeSprite();
    var i1 = new Image(), i2 = new Image();
    i1.width = i2.width = 400;
    i1.height = i2.height = 200;
    s1 = new jslash.Sprite(i1);
    s2 = new jslash.Sprite(i2);
  });

  it("should be a BaseSprite derived class",function() {
    expect(typeof cs.image).toEqual("function");
    expect(typeof cs.imageRect).toEqual("function");
    expect(typeof cs.canvasRect).toEqual("function");
    expect(typeof cs.useRects).toEqual("function");
    expect(typeof cs.draw).toEqual("function");
    expect(typeof cs.center).toEqual("function");
    expect(typeof cs.height).toEqual("function");
    expect(typeof cs.width).toEqual("function");
  });

  it("should composite two sprites in one, using an auxiliar canvas",function() {
    var nCanvas = document.getElementsByTagName('canvas').length;
    var expected = nCanvas;
    if (!jslash.hasAuxiliarCanvas()) {
      expected++;
    }
    var s = new jslash.CompositeSprite(s1,s2);
    nCanvas = document.getElementsByTagName('canvas').length;
    expect(nCanvas).toEqual(expected);
  });

  it("should composite the sprites drawing them on a canvas",function() {
    spyOn(s1,'draw');
    spyOn(s2,'draw');
    var s = new jslash.CompositeSprite(s1,s2);
    expect(s1.draw).toHaveBeenCalled();
    expect(s2.draw).toHaveBeenCalled();    
  });

  it("should call getImageData context method when the object is built",function() {
    var canvas = new jslash.Canvas('canvas');
    spyOn(canvas.context,'getImageData');
    var s = new jslash.CompositeSprite(s1,s2,canvas);
    expect(canvas.context.getImageData).toHaveBeenCalledWith(0,0,Math.max(s1.width(),s2.width()),Math.max(s1.height(),s2.height()));
  });


  it("should call putImageData context method when the image is draft",function() {
    var s = new jslash.CompositeSprite(s1,s2);
    s.x = 100; s.y = 200;
    var canvas = new jslash.Canvas('canvas');
    spyOn(canvas.context,'putImageData');
    canvas.draw(s);
    expect(canvas.context.putImageData).toHaveBeenCalledWith(s._imgData,100,200);
  });

  it("should by default be at (0,0) position",function() {
    var s = new jslash.CompositeSprite(s1,s2);
    expect(s.x).toEqual(0);
    expect(s.y).toEqual(0);
  });

});
