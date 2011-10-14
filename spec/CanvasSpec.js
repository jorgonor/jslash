describe('Canvas',function() {
  
  var canvas,context,realImg;

  beforeEach(function() {
    canvas = new jslash.Canvas();
    context = canvas.context;
    realImg = new Image();
    realImg.src = "img/all_3.jpg";
  });
  
  it("should draw the image returned by the image method from the drawable object",function() {
    var s = new jslash.Sprite(realImg);
    s.position(5,5);
    spyOn(context,'drawImage');
    canvas.draw(s);
    expect(context.drawImage).toHaveBeenCalledWith(realImg,0,0,realImg.width,realImg.height,
                                                           5,5,realImg.width,realImg.height);
  }); 
  it("should draw image on Canvas, setting imageRect and canvasRect methods on a drawable object",function() {
    var s = new jslash.Sprite(realImg);
    s.imageRect(new jslash.Rectangle(1,1,5,5));
    s.canvasRect(new jslash.Rectangle(2,2,10,10));
    spyOn(context,'drawImage');
    canvas.draw(s);
    expect(context.drawImage).toHaveBeenCalledWith(realImg,
                                                   1,1,5,5, /* imageRect coordinates */
                                                   2,2,10,10  /* canvasRect coordinates */) ;
  });

  it("should call the fillRectangle method with the color provided when fill is called",function() {
    spyOn(context,'fillRect');
    canvas.fill("#000000");
    expect(context.fillStyle).toEqual("#000000");
    expect(context.fillRect).toHaveBeenCalledWith(0,0,canvas.width(),canvas.height());
  });

  it("should call the onrefresh event (when it is defined) on a drawable before be draft",function() {
    var fkDrawable = {  image: function() { return realImg; }, x: 5, y: 5,
                        onrefresh: function() {}  };
    spyOn(fkDrawable,'onrefresh');
    canvas.draw(fkDrawable);
    expect(fkDrawable.onrefresh).toHaveBeenCalled();

  });

  it("when the canvas constructor is called without an id, it should append a new canvas element to the document",
  function() {
    var canvas = new jslash.Canvas(); 
    expect(jslash.ById(canvas._canvas.id)).not.toEqual(null);
  });
  it("if two canvas are added to the document, they are not the same",function() {
    var c1 = new jslash.Canvas();
    var c2 = new jslash.Canvas();

    expect(c1._canvas.id).not.toEqual(c2._canvas.id);
    expect(c1._canvas).not.toEqual(c2._canvas);
  });

  it("knows where its center is",function() {
    var c1 = new jslash.Canvas();
    c1.width(200); c1.height(300);
    expect(c1.center()).toEqual(new jslash.Point(100,150));
  });
});

