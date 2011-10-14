describe('BorderedRectangle',function() {

  var rect;

  beforeEach(function() {
    rect = new jslash.BorderedRectangle(0,0,100,100);
  });

  it("should collides with other object when it cross one of its lines",function() {
    var other = new jslash.Rectangle(5,-5,10,10);
    expect(jslash.BorderedRectangle.collide(rect,other)).toBeTruthy();
  });

  it("should not collide a object if it is completely contained",function() {
    var other = new jslash.Rectangle(30,30,10,10);
    expect(jslash.BorderedRectangle.collide(rect,other)).toBeFalsy();
  });
});
