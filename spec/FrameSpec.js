require('jslash');

describe('Frame',function() {
  it("should be able to store an image and a rectangular area for the frame",function() {
    var img = new Image();
    var rect = new jslash.Rectangle(100,100,200,200);
    var frame = new jslash.Frame(img,rect);
    expect(frame.image()).toEqual(img);
    expect(frame.rect()).toEqual(rect);
  });
});
