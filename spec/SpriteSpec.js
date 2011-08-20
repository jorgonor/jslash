require('jslash');

describe('Sprite',function()
{
  var fkImg;

  beforeEach(function() {
    fkImg = { src: "a.jpg" ,width: 100, height: 100 }; 
  });

  it("should return the initialization image on image method",function() {
    var s = new jslash.Sprite(fkImg);
    expect(s.image()).toEqual(fkImg);
  });
  it("should set automatically zero to the x and y properties of the canvasRect",function() {
    var s = new jslash.Sprite(fkImg);
    var r = s.canvasRect();
    expect(r.x).toEqual(0);
    expect(r.y).toEqual(0);
  });

  it("should set automatically to zero the x and y properties too",function() {
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

  it("should be able to change the position of the rects with the position method",function() {
    var s = new jslash.Sprite(fkImg);
    s.position(100,22);
    var cvsRect = s.canvasRect();
    expect(cvsRect.x).toEqual(100);
    expect(cvsRect.y).toEqual(22);
  });

  it("should be able to change the position with the position method",function() {
    var s = new jslash.Sprite(fkImg);
    s.position(100,22);
    expect(s.x).toEqual(100);
    expect(s.y).toEqual(22);
  });

  it("should be able to change the center of the sprite on the canvas directly",function() {
    var s =new jslash.Sprite(fkImg);
    s.center(60,60);
    var rect = new jslash.Rectangle(10,10,100,100);
    expect(s.canvasRect()).toEqual(rect);
  });

  it("should change the x and y properties too when the center is changed",function() {
    var s = new jslash.Sprite(fkImg);
    s.center(60,60);
    expect(s.x).toEqual(10);
    expect(s.y).toEqual(10);
  });

});
