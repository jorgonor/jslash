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
    expect(fakeCtx.font).toEqual("12 Arial"); //default size and font
    expect(fakeCtx.fillStyle).toEqual("black");
    expect(fakeCtx.fillText).toHaveBeenCalledWith("once upon a time",100,112);
  });

  it("should return the width of a text using a canvas context",function() {
    var fakeCanvas = { context: { measureText: function() { return { width: 111 };  } } };
    expect(txt.width(fakeCanvas)).toEqual(111);
  }); 

  it("should fill the context.font property with the weight provided",function() {
    var fakeCtx = { fillText : function() {} };
    txt.weight = 'bold';
    txt.size = 12;
    txt.font = 'verdana';
    txt.draw(fakeCtx);
    expect(fakeCtx.font).toEqual(["bold",12,"verdana"].join(" "));
  });

});
