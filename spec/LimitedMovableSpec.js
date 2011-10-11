describe('LimitedMovable',function() {

  var likePositionMock,limMvble;
    
  beforeEach(function() {
    likePositionMock = 
       { position: function(x,y) {
           if (x == undefined || y == undefined ) {
             return { x: this.x, y: this.y };
           }
           this.x = x;
           this.y = y;
         } , x : 0, y: 0 };

    limMvble = new jslash.behaviors.LimitedMovable(100,50,new jslash.Rect(0,0,100,100));
    jslash.mix(likePositionMock,limMvble);
  });

  it("should be able to move like the Movable objects",function() {
    likePositionMock.move(500);
    expect(likePositionMock.x).toEqual(50);
    expect(likePositionMock.y).toEqual(25);
    
  });

  it("should too to limit the position with the given rect",function() {
    likePositionMock.move(10000);
    expect(likePositionMock.x).toEqual(100);
    expect(likePositionMock.y).toEqual(100);
  });

});
