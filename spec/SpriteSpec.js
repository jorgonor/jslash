describe('Sprite',function()
{
  var fkImg,s;

  beforeEach(function() {
    fkImg = { src: "a.jpg" ,width: 100, height: 100 }; 
    s = new jslash.Sprite(fkImg);
  });

  it("should return the initialization image on image method",function() {
    expect(s.image()).toEqual(fkImg);
  });

  it("should be at (0,0) position by default",function() {
    expect(s.position()).toEqual(new jslash.Point(0,0));
  });


  it("should return the image sizes on imageRect and canvasRect methods",function() {
    fkImg = { src: "a.jpg", width: 100, height: 200 };
    var s = new jslash.Sprite(fkImg, new jslash.Point(1,100));
    var rect = new jslash.Rectangle(0,0,100,200);
    var csRect = new jslash.Rectangle(1,100,100,200);
    expect(s.imageRect()).toEqual(rect);
    expect(s.canvasRect()).toEqual(csRect);
  });

  it("should be able to set the image subrect",function() {
    var rect = new jslash.Rectangle(10,10,30,30);
    s.imageRect(rect);
    expect(s.imageRect()).toEqual(rect);
  });

  it("should be able to scale the sprite",function() {
    fkImg.width = 100; fkImg.height = 50;
    var s = new jslash.Sprite(fkImg);
    s.scale(2);
    var imgRect = s.imageRect();
    var rect = new jslash.Rectangle(imgRect.x,imgRect.y, imgRect.width*2,imgRect.height*2);
    expect(s.canvasRect()).toEqual(rect);
  });

  it("should be able to change the position of the rects with the position method",function() {
    s.position(100,22);
    var cvsRect = s.canvasRect();
    expect(cvsRect.x).toEqual(100);
    expect(cvsRect.y).toEqual(22);
  });

  it("should be able to change the center of the sprite on the canvas directly",function() {
    s.center(60,60);
    var rect = new jslash.Rectangle(10,10,100,100);
    expect(s.canvasRect()).toEqual(rect);
  });

  it("should change the position when the center is changed",function() {
    s.center(60,60);
    expect(s.position().x).toEqual(10);
    expect(s.position().y).toEqual(10);
  });

  it("should be able to increment the sprite rotation with the rotate method",function() {
    s.rotate(3.3);
    expect(s.angle).toEqual(3.3);
  });
 
  it("rotate should acumulate the rotation values",function() {
    s.rotate(1);
    s.rotate(0.75);
    expect(s.angle).toEqual(1.75);
  }); 

  it("when rotate is activated the draw method should call the rotate canvas context method",function() {
    s.rotate(3);
    var fkCtx = { rotate: function() {
                  }, drawImage: function() {}, save: function() {}, restore: function() {}, translate: function() {} };
    spyOn(fkCtx,'rotate');
    s.draw(fkCtx);
    expect(fkCtx.rotate).toHaveBeenCalledWith(3);
  });
});
