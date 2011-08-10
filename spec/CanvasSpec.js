require('jslash');

describe('Canvas',function() {
  it("should draw the image returned by the image method from the drawable object",function() {
    var context = core.ById('canvas').getContext('2d');
    var canvas = new core.Canvas('canvas');
    var emptyImg = new Image();
    var fakeDrawable = { image: function() { return emptyImg; },x : 5, y: 5};
    spyOn(context,'drawImage');
    canvas.draw(fakeDrawable); 
    expect(context.drawImage).toHaveBeenCalledWith(emptyImg,5,5);
  }); 
  //TODO: it should use the properties imageRect and canvasRect if they are defined... 

});
