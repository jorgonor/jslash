require('jslash');

describe('Moveable',function() {
  var jsbhv = jslash.behaviors;

  var mvble;

  beforeEach(function() {
    mvble = new jsbhv.Moveable(100,100);
  });

  it("should define a speed property and move method",function() {
    expect(mvble.speed).toBeDefined();
    expect(typeof mvble.move).toEqual("function");
  });

  it("should handle the speed as a x and y dimensions tuple",function() {
    expect(mvble.speed).toEqual({x: 100,y: 100});
  });

  it("should move an object mixed with using the position method",function() {
    var obj = { x: 0, y: 1, position: function(x,y) { 
                                        if (!x || !y) {
                                          return new jslash.Point(this.x,this.y);
                                        } 
                                        this.x = x; this.y = y; 
                                      }
              };
    var mixed = jslash.mix(obj,mvble);
    obj.move(1000);
    expect(obj.x).toEqual(100);
    expect(obj.y).toEqual(101);
  });
});
