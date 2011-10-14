describe('Collideable',function() {

  it("should define a morph property and a collides function",function() {
    var coll = new jslash.behaviors.Collidable(jslash.Rectangle,'a');
    expect(coll.morph).toEqual(jslash.Rectangle);
    expect(typeof coll.collides).toEqual("function");
  });
  
  it("collides method should return true when the shape of mixed objects collides",function() {
    var obj = { a: new jslash.Rectangle(-1,-10,1,10) };
    var obj2 = { b: new jslash.Rectangle(-1,-1,2,2) };
    jslash.mix(obj,new jslash.behaviors.Collidable(jslash.Rectangle,'a'));
    jslash.mix(obj2,new jslash.behaviors.Collidable(jslash.Rectangle,'b'));
    expect(jslash.Rectangle.collide(obj.a,obj2.b)).toBeTruthy();
    expect(obj.collides(obj2)).toBeTruthy();
  });

  it("collides method should handle no bound property. Insted of the entire object is taken",function() { 
    var obj = { a: new jslash.Rectangle(-1,-10,1,10) };
    var obj2 = new jslash.Rectangle(-1,-1,2,2);
    jslash.mix(obj,new jslash.behaviors.Collidable(jslash.Rectangle,'a'));
    jslash.mix(obj2,new jslash.behaviors.Collidable(jslash.Rectangle));
    expect(obj2.collides(obj)).toBeTruthy();
  });

  it("collides method should handle function properties (methods)",function() {
    var obj = { a: function() { return new jslash.Rectangle(0,0,1,1); } };
    var obj2 = { i: function() { return new jslash.Rectangle(10,10,11,11); } };
    jslash.mix(obj,new jslash.behaviors.Collidable(jslash.Rectangle,'a'));
    jslash.mix(obj2,new jslash.behaviors.Collidable(jslash.Rectangle,'i'));
    expect(obj.collides(obj2)).toBeFalsy();
  });

  it("when collides returns truthy, then if the object has a oncollides event handler, it should be called",function() {
    var obj = new jslash.Rectangle(0,0,1,1); var obj2 = new jslash.Rectangle(0,1,2,3);
    jslash.mix(obj,new jslash.behaviors.Collidable(jslash.Rectangle));
    jslash.mix(obj2,new jslash.behaviors.Collidable(jslash.Rectangle));
    obj.oncollides = function() {}; obj2.oncollides = function() {};
    spyOn(obj,'oncollides');
    spyOn(obj2,'oncollides');
    obj.collides(obj2);
    expect(obj.oncollides).toHaveBeenCalledWith(obj2);
    expect(obj2.oncollides).toHaveBeenCalledWith(obj);
  });

});
