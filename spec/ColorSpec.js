require('jslash');

describe('Color',function() {
  it("should wrap the typical color information",function() {
    var color = new jslash.Color(1,1,1);
    expect(color.r).toEqual(1);
    expect(color.g).toEqual(1);
    expect(color.b).toEqual(1);
    expect(color.a).toEqual(1);
  });

  it("should return a string representing the color values",function() {
    var color = new jslash.Color(0.1,0.2,0.3,0.4);
    expect(color.toString()).toEqual("rgba(0.1,0.2,0.3,0.4)");
  });

  it("should be able to equal one color with other",function() {
    var c = new jslash.Color(0,0,0);
    var c2 = new jslash.Color(0,0,0,1);
    expect(c.equals(c2)).toBeTruthy();
  });

});

