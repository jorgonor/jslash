describe('jslash',function() {
  var prevJslash = jslash;
  var jslashCopy;
  var i1 = new Image();
  var i2 = new Image();
  i1.src = i2.src = "img/all_3.jpg";
  beforeEach(function() {
    jslashCopy = prevJslash.deepcopy(prevJslash);
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
    var bhv = new jslashCopy.behaviors.Movable(100,200);
    jslashCopy.mix(object,bhv);
    expect(object.speed).toEqual(bhv.speed);
    expect(object.move).toEqual(bhv.move);
  });

  it("when start is called, sets up a jslash.borders property with the canvas region limits",function() {
    var canvas = new jslashCopy.Canvas('canvas');
    var rect = new jslashCopy.BorderedRectangle(0,0,canvas.width(),canvas.height());
    jslashCopy.start(canvas);
    var props = jslashCopy.properties(jslashCopy.borders);
    var rectProps = jslashCopy.properties(rect);
    rectProps.forEach(function(e) {
      expect(props).toContain(e);
    });
    var values = jslashCopy.values(jslashCopy.borders);
    var rectValues = jslashCopy.values(rect);
    rectValues.forEach(function(e) {
      expect(values).toContain(e);
    });
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

  it("properties return the properties of an object as array",function() {
    var tObj = { 'a': 0,'c':0,'b':3 };
    expect(jslashCopy.properties(tObj)).toContain('a');
    expect(jslashCopy.properties(tObj)).toContain('b');
    expect(jslashCopy.properties(tObj)).toContain('c');
    expect(jslashCopy.properties(tObj).length).toEqual(3);
    expect(jslashCopy.properties(tObj) instanceof Array).toBeTruthy();
  });

  it("values return the values of an object as array",function() {
    var tObj = {'a': 1,'b': 2, 'c': 3};
    expect(jslashCopy.values(tObj)).toContain(1);
    expect(jslashCopy.values(tObj)).toContain(2);
    expect(jslashCopy.values(tObj)).toContain(3);
    expect(jslashCopy.values(tObj).length).toEqual(3);
    expect(jslashCopy.values(tObj) instanceof Array).toBeTruthy();
  });

  it("sliceImg should return a collection of frames cropped",function() {
    var img = { height: 100, width: 50 };
    var result = jslashCopy.sliceImg(img,new jslashCopy.Rectangle(0,0,25,25));
    expect(result.length).toEqual(2*4);
    expect(result[0].image()).toEqual(img);
    expect(result[0].rect()).toEqual(new jslashCopy.Rectangle(0,0,25,25));
    expect(result[3].rect()).toEqual(new jslashCopy.Rectangle(25,25,25,25));
  });

  it("hasAuxiliarCanvas should be falsy when no auxiliar Canvas is instantiated",function() {
    expect(jslashCopy.hasAuxiliarCanvas()).toBeFalsy();
  });

  it("hasAuxiliarCanvas when any class uses an auxiliar canvas should be truthy",function() {
    waitsFor(function() { return i1.complete && i2.complete; });
    runs(function() {
      var cs = new jslashCopy.CompositeSprite(new jslashCopy.Sprite(i1),new jslashCopy.Sprite(i2));
      expect(jslashCopy.hasAuxiliarCanvas()).toBeTruthy();
    });
  });

  it("should iterate an array and call the argument function for each item with its index and value",function() {
    var a = ["a","b","c","d"];
    var index = 0;
    jslashCopy.each(a,function(i,e) {
      expect(index++).toEqual(i);
      expect(e).toEqual(a[i]);
    });
  });

  it("each should be able to iterate an object too",function() {
    var obj = { "a" : 1, "b" : 3 };
    var a = { injected : function() {} };
    spyOn(a,'injected');
    jslashCopy.each(obj,a.injected);
    expect(a.injected).toHaveBeenCalledWith("a",1);
    expect(a.injected).toHaveBeenCalledWith("b",3);
  });

  it("each should not itearte over functions",function() {
    var obj = { "pepe": function() {} , "fighter": function() { return true; } };
    var a = {injected : function() {} };
    spyOn(a,'injected');
    jslashCopy.each(obj,a.injected);
    expect(a.injected).not.toHaveBeenCalled();
  });

});
