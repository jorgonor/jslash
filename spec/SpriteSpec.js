require('jslash');

describe('Sprite',function()
{
  var fkImg;

  beforeEach(function() {
    fkImg = { src: "a.jpg" }; 
  });

  it("should return the initialization image on image method",function() {
    var s = new jslash.Sprite(fkImg);
    expect(s.image()).toEqual(fkImg);
  });
  it("should set automatically zero to the x and y property if the position is not initialized",function() {
    var s = new jslash.Sprite(fkImg);
    expect(s.x).toEqual(0);
    expect(s.y).toEqual(0);
  });

  it("should return the image sizes on imageRect and canvasRect methods",function() {
    fkImg = { src: "a.jpg", width: 100, height: 200 };
    var s = new jslash.Sprite(fkImg, new jslash.Point(1,100));
    var rect = new jslash.Rectangle(0,0,100,200);
    var csRect = new jslash.Rectangle(1,100,100,200);
    expect(s.imageRect()).toEqual(rect);
    expect(s.canvasRect()).toEqual(csRect);
  });

  it("should not useRects by default",function() {
    var s = new jslash.Sprite(fkImg);
    expect(s.useRects()).toBeFalsy();
  });

  it("should be able to set the image subrect",function() {
    var s = new jslash.Sprite(fkImg);
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

  it("should activate automatically the useRects value when scale is called",function() {
    fkImg.width = 100; fkImg.height = 50;
    var s = new jslash.Sprite(fkImg);
    s.scale(2);
    expect(s.useRects()).toBeTruthy();
  });

  it("should be able to change the position with the position method",function() {
    var s = new jslash.Sprite(fkImg);
    var cvsRect = s.canvasRect();
    s.position(100,22);
    cvsRect.x = 100; cvsRect.y = 22;
    expect(s.x).toEqual(100);
    expect(s.y).toEqual(22);
    expect(cvsRect).toEqual(s.canvasRect());
  });

});
