require('jslash');

describe('AnimatedSprite',function() {

  var as;
  var img1 = new Image(),img2 = new Image();
  var framesCol = [ new jslash.Frame(img1,
                                     new jslash.Rectangle(1,1,200,200)),
                    new jslash.Frame(img2,
                                     new jslash.Rectangle(2,2,300,300)) ];

  beforeEach(function() {
    as = new jslash.AnimatedSprite(framesCol);
  });

  it("should be drawable",function() {
    expect(typeof as.image).toEqual("function");
    expect(typeof as.imageRect).toEqual("function");
    expect(typeof as.canvasRect).toEqual("function");
  });

  it("should return the first frame values when no event is dispatched",function() {
    var firstFrame = framesCol[0];
    expect(as.image()).toEqual(firstFrame.image());
    expect(as.imageRect()).toEqual(firstFrame.rect());
  });

  it("should have on canvasRect the current frame rect",function() {
    expect(as.canvasRect()).toEqual(framesCol[0].rect());
  });
  
  it("should change the image and imageRect properties to the next frame when next is called",function() {
    as.next();
    expect(as.image()).toEqual(img2);
    expect(as.imageRect()).toEqual(framesCol[1].rect());
  });

  it("should change from animation when the onrefresh event returns true",function() {
    var counter = 0;
    as.onrefresh = function() {
                      if ( counter++ % 2 == 1 ) {
                        as.next();
                      }
                   };
    //emulating canvas or other mediator object interaction
    as.onrefresh();
    as.image();
    as.onrefresh();
    expect(as.image()).toEqual(img2);
  });

  it("should useRects ever",function() {
    expect(as.useRects()).toBeTruthy();
  });

  it("should change the canvasRect to the current frame if the image is changed",function() {
    as.next();
    expect(as.canvasRect()).toEqual(framesCol[1].rect());
  });
  
  it("should return the canvas rect ever if it's setted once",function() {
    var nRect =new jslash.Rectangle(22,22,44,44);
    as.canvasRect(nRect);
    expect(as.canvasRect()).toEqual(nRect);
    as.next();
    expect(as.canvasRect()).toEqual(nRect);
  });
});
