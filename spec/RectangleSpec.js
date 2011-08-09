require('core');

describe('Rectangle',function() {
  var rect;
  beforeEach(function() {
    rect = new core.Rectangle(0,1,2,3);
  });

  it("should handle the area of a rectangular object",function() {
    expect(rect.x).toBeDefined();
    expect(rect.y).toBeDefined();
    expect(rect.width).toBeDefined();
    expect(rect.height).toBeDefined();
    expect(rect.center).toBeDefined();
  });

  it("center should be a Point instance with the center point computed",function() {
    expect(rect.center.x).toEqual(1);
    expect(rect.center.y).toEqual(2.5);
  });

});
