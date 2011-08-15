require('jslash');

describe('jslash',function() {
  var prevJslash = jslash;
  var newJslash;
  beforeEach(function() {
    newJslash = prevJslash.deepcopy(prevJslash);
  });
  it("should fill the canvas provided with black color by default",function() {
    var jslash = newJslash;
    var canvas = new jslash.Canvas('canvas');
    spyOn(canvas,'fill');
    runs(function() {
      jslash.start(canvas);
    });
    waits(33);
    runs(function() {
      expect(canvas.fill).toHaveBeenCalledWith("000000");
    });
  });

  it("has a deepcopy method to copy objects on a new fresh object",function() {
    var jslash = newJslash;
    var obj = {a:2,b:3};
    var copy = jslash.deepcopy(obj);
    expect(obj).not.toBe(copy);
    expect(obj.constructor).toEqual(copy.constructor);
    expect(copy.a).toEqual(obj.a);
    expect(copy.b).toEqual(obj.b);
  });

  it("has a mix method who adds the second argument object properties to the first",function() {
    var jslash= newJslash;
    var object = {a: 3, b: 50};
    var bhv = new jslash.behaviors.Moveable(100,200);
    jslash.mix(object,bhv);
    expect(object.speed).toEqual(bhv.speed);
    expect(object.move).toEqual(bhv.move);
  });
});
