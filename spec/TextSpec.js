require ('jslash');

describe('Text',function() {
  var txt;

  beforeEach(function() {
    txt = new jslash.Text('once upon a time');
  });

  it("should know how to be draft on a canvas",function() {
    var fakeCtx = { fillText: function() {}, font: ''};
    txt.x = txt.y = 100;
    spyOn(fakeCtx,'fillText');
    txt.draw(fakeCtx);
    expect(fakeCtx.font).toEqual("12px Arial"); //default size and font
    expect(fakeCtx.fillStyle).toEqual("black");
    expect(fakeCtx.fillText).toHaveBeenCalledWith("once upon a time",100,100);
  });

});
