require('jslash');

describe('jslash',function() {
  it("should fill the canvas provided with black color by default",function() {
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
});
