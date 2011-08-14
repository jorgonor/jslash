require('jslash');

describe('Canvas',function() {
  
  var canvas,context,emptyImg;

  beforeEach(function() {
    canvas = new jslash.Canvas('canvas');
    context = canvas.context;
    emptyImg = new Image();
  });
  
  it("should draw the image returned by the image method from the drawable object",function() {
    var fakeDrawable = { image: function() { return emptyImg; },x : 5, y: 5};
    spyOn(context,'drawImage');
    canvas.draw(fakeDrawable); 
    expect(context.drawImage).toHaveBeenCalledWith(emptyImg,5,5);
  }); 
  it("should draw image on Canvas, defining the src and target areas using imageRect and canvasRect methods",function() {
    var fakeDrawable = { image: function() { return emptyImg; }, x: 5, y: 5, 
                         imageRect: function() { return new jslash.Rectangle(1,1,5,5) },
                         canvasRect: function() { return new jslash.Rectangle(2,2,10,10) },
                         useRects: function() { return true; } };
    spyOn(context,'drawImage');
    canvas.draw(fakeDrawable);
    expect(context.drawImage).toHaveBeenCalledWith(emptyImg,
                                                   1,1,5,5, /* imageRect coordinates */
                                                   2,2,10,10  /* canvasRect coordinates */) ;
  });

  it("should call the fillRectangle method with the color provided when fill is called",function() {
    spyOn(context,'fillRect');
    canvas.fill("#000000");
    expect(context.fillStyle).toEqual("#000000");
    expect(context.fillRect).toHaveBeenCalledWith(0,0,canvas.width,canvas.height);
  });
});
