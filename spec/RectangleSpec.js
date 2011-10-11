describe('Rectangle',function() {
  var rect;
  beforeEach(function() {
    rect = new jslash.Rectangle(0,1,2,3);
  });

  it("should handle the area of a rectangular object",function() {
    expect(rect.x).toBeDefined();
    expect(rect.y).toBeDefined();
    expect(rect.width).toBeDefined();
    expect(rect.height).toBeDefined();
    expect(rect.center).toBeDefined();
  });

  it("should have a Point instance in center property",function() {
    expect(rect.center() instanceof jslash.Point).toBeTruthy();
  });

  it("center should be a Point instance with the center point computed",function() {
    expect(rect.center().x).toEqual(1);
    expect(rect.center().y).toEqual(2.5);
  });

  it("should be able to set the center of a rectangle",function() {
    rect.center(3,3);
    expect(rect).toEqual(new jslash.Rectangle(2,1.5,2,3));
  });

  it("should be able to know if two rectangles collide",function() {
    var rect = new jslash.Rectangle(0,0,100,100);
    var r2 = new jslash.Rectangle(50,50,10,10);
    expect(jslash.Rectangle.collide(rect,r2)).toBeTruthy();
    expect(jslash.Rectangle.collide(r2,rect)).toBeTruthy();
  });

  it("should be able to know when contains not a point",function() {
    var rect = new jslash.Rectangle(20,20,30,30);
    expect(rect.contains(new jslash.Point(0,0))).toBeFalsy();
  });

  it("should be able to know when contains a point",function() {
    var rect = new jslash.Rectangle(0,0,10,10);
    expect(rect.contains(new jslash.Point(5,5))).toBeTruthy();
  });

});
