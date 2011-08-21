require('jslash');

describe('jslash',function() {
  var prevJslash = jslash;
  var jslashCopy;
  beforeEach(function() {
    jslashCopy = prevJslash.deepcopy(prevJslash);
  });
  it("should fill the canvas provided with black color by default",function() {
    var canvas = new jslashCopy.Canvas('canvas');
    spyOn(canvas,'fill');
    runs(function() {
      jslashCopy.start(canvas);
    });
    waits(33);
    runs(function() {
      expect(canvas.fill).toHaveBeenCalledWith("#000000");
      jslashCopy.stop();
    });
  });

  it("has a deepcopy method to copy objects on a new fresh object",function() {
    var obj = {a:2,b:3};
    var copy = jslashCopy.deepcopy(obj);
    expect(obj).not.toBe(copy);
    expect(obj.constructor).toEqual(copy.constructor);
    expect(copy.a).toEqual(obj.a);
    expect(copy.b).toEqual(obj.b);
  });

  it("has a mix method who adds the second argument object properties to the first",function() {
    var object = {a: 3, b: 50};
    var bhv = new jslashCopy.behaviors.Moveable(100,200);
    jslashCopy.mix(object,bhv);
    expect(object.speed).toEqual(bhv.speed);
    expect(object.move).toEqual(bhv.move);
  });

  it("when start is called, sets up a jslash.borders property with the canvas region limits",function() {
    var canvas = new jslashCopy.Canvas('canvas');
    var rect = new jslashCopy.BorderedRectangle(0,0,canvas.width(),canvas.height());
    jslashCopy.start(canvas);
    expect(jslashCopy.borders).toEqual(rect);
    jslashCopy.stop();
  });

  it("jslash.borders prototype is BorderedRectangle",function() {
    var canvas = new jslashCopy.Canvas('canvas');
    jslashCopy.start(canvas);
    expect(jslashCopy.borders instanceof jslashCopy.BorderedRectangle).toBeTruthy();
    jslashCopy.stop();
  });

  it("jslash.prefetchImg prepare the argument images on the jslash.images property",function() {
    jslashCopy.prefetchImg('img/all_3.jpg');
    var re = /\/img\/all_3\.jpg$/;
    expect(jslashCopy.images['img/all_3.jpg'].src).toMatch(re);
  });

  it("should prefetch and prepare the images on jslash.images when the method is called with an array",function() {
    jslashCopy.prefetchImg(['img/all_3.jpg', 'img/palet.png' ]);
    var re = /\/img\/palet\.png$/;
    expect(jslashCopy.images['img/palet.png'].src).toMatch(re);
  });
});
