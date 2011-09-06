require('jslash');

describe('Tileset',function() {
  var map;
  beforeEach(function() {
    map = new jslash.Tileset();
    map.tilewidth = 64;
    map.tileheight = 64;
    map.width = map.height = 10;
  });
  it("should establish two properties for the first row and column",function() {
    expect(map.firstrow).toBeDefined();
    expect(map.firstcol).toBeDefined();
  });

  it("should be able to scroll down using an object with a width and a height defined",function() {
    var fakeObj = { width: function() { return 200; }, height: function() { return 300; } };
    map.scrollDown(fakeObj);
    expect(map.firstrow).toEqual(1);
  });
  
  it("should check if the scroll down is possible to do, and if not stay the value equals",function() {
    var fakeObj = { width: function() { return 200; }, height: function() { return 700; } };
    map.scrollDown(fakeObj);
    expect(map.firstrow).toEqual(0);
  });

  it("should be able to scroll right using an object with a width and a height defined",function() {
    var fakeObj = { width: function() { return 200; }, height: function() { return 300; } };
    map.scrollRight(fakeObj);
    expect(map.firstcol).toEqual(1);
  });
  
  it("should check if the scroll right is possible to do, and if not stay the value equals",function() {
    var fakeObj = { width: function() { return 700; }, height: function() { return 700; } };
    map.scrollRight(fakeObj);
    expect(map.firstcol).toEqual(0);
  });

  it("scrollUp should not cause a negative index",function() {
    map.scrollUp({ width: function() { return 0; }, height: function() { return 0; } });
    expect(map.firstrow).toBeGreaterThan(-1);
  });

  it("scrollUp should decrement the index if it is greater than zero",function() {
    map.firstrow = 3;
    map.scrollUp({ width: function() { return 0; }, height: function() { return 0; } });
    expect(map.firstrow).toEqual(2);
  }); 
  it("scrollLeft should not cause a negative index",function() {
    map.scrollLeft({ width: function() { return 0; }, height: function() { return 0; } });
    expect(map.firstcol).toBeGreaterThan(-1);
  });

  it("scrollLeft should decrement the index if it is greater than zero",function() {
    map.firstcol = 3;
    map.scrollLeft({ width: function() { return 0; }, height: function() { return 0; } });
    expect(map.firstcol).toEqual(2);
  });

  //TODO: all scrolls should return true when they realize any scrolling, false in other case.

});
