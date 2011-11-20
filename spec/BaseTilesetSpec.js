describe('BaseTileset',function() {
  var map;
  beforeEach(function() {
    map = new jslash.BaseTileset();
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

  it("should be able to translate an absolute position to a relative position",function() {
    map.firstcol = 2; map.firstrow = 1; map.tilewidth = 20; map.tileheight = 20;
    var p = map.toRelative(new jslash.Point(300,300));
    expect(p).toEqual(new jslash.Point(260,280));
  }); 

  it("when scroll does not moves should return something falsy",function() {
    expect(map.scrollUp()).toBeFalsy();
  });
  
  it("when scroll moves, should return something truthy",function() {
    map.firstrow = 1;
    expect(map.scrollUp()).toBeTruthy();
  });

});
