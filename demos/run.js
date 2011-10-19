(function() {
  jslash.prefetchImg([ "../img/ranger_m.png", "../img/mine.png", "../img/bombas.png"]);

  var GAP = 16;
  var TXTPADDING = 10;
  
  var player, tileMap, canvas,lifebar;
  var obstacles = [];
  var drawnObstacles = [];

  function createMine() {
    var obstacle = new jslash.Sprite(jslash.images['../img/mine.png']);
    obstacle.scale(0.5);
    var x = Math.random() * (tileMap.width * tileMap.tilewidth - obstacle.width() );
    var y = Math.random() * (tileMap.height * tileMap.tileheight - obstacle.height() );
    obstacle.absPosition = new jslash.Point(x,y);
    jslash.mix(obstacle,new jslash.behaviors.Collidable(jslash.Rectangle,'canvasRect'));
    obstacles.push(obstacle);
    return obstacle;
  }

  jslash.ready(function() {
    tileMap = new jslash.TiledTileset();
    tileMap.load("../tmx/run_background.json");
    canvas = new jslash.Canvas('canvas');
    canvas.width(400);
    canvas.height(600);
    var rgerImg = jslash.images['../img/ranger_m.png'];
    var frames = [ new jslash.Frame(rgerImg,new jslash.Rect(0,0,32,36)),
                   new jslash.Frame(rgerImg,new jslash.Rect(32,0,32,36)),
                   new jslash.Frame(rgerImg,new jslash.Rect(64,0,32,36)) ];
    
    player = new jslash.AnimatedSprite(frames);
    player.onrefresh = jslash.AnimatedSprite.makeRefresh(30);
    var bombImg = jslash.images['../img/bombas.png'];
    frames = [ new jslash.Frame(bombImg, new jslash.Rectangle(16, 0, 64-16, bombImg.height - 1)),
               new jslash.Frame(bombImg, new jslash.Rectangle(72, 8, 104-72, 32))];
    var explosionAnim = new jslash.AnimatedSprite(frames);
    explosionAnim.onrefresh = jslash.AnimatedSprite.makeRefresh(5);
    explosionAnim.canvasRect();
    
    jslash.mix(player, new jslash.behaviors.Collidable(jslash.Rect,'canvasRect'));

    lifebar = new jslash.Gradient(new jslash.Point(20,20), new jslash.Point(120,40) ).
                              startColor(new jslash.Color(255,128,0)).
                              endColor(new jslash.Color(128,255,0)).
                              build(canvas);

    var info = new jslash.Text("Use WASD to move the ranger!",0);
    info.color = 'white'; info.font = 'Verdana'; info.size = 16;
    info.y = canvas.height() - info.height() - TXTPADDING;
    info.weight = 'bold';

    speeds = { A: { x: -GAP, y : 0, scroll: function() { return tileMap.scrollLeft(canvas); } },
               S: { x: 0, y: GAP, scroll: function() { return tileMap.scrollDown(canvas); }},
               D: { x: GAP, y: 0, scroll: function() { return tileMap.scrollRight(canvas); }},
               W: { x: 0, y: -GAP, scroll: function() { return tileMap.scrollUp(canvas); }} };

    function euclideanDistance(pt1,pt2) {
    	var x = pt1.x - pt2.x;
    	var y = pt1.y - pt2.y;
    	return Math.sqrt(x*x + y*y);
    }
    
    function isNearerPoint(before,after,refPoint) {
    	var dBefore = euclideanDistance(before,refPoint);
    	var dAfter = euclideanDistance(after, refPoint);
    	return dAfter < dBefore;
    }
    
    function makeSpeedFunc(key) {
      var speed = speeds[key];
      var makedFunc = function() {
        var p = player.position();
        var newPt = new jslash.Point(p.x + speed.x,p.y + speed.y);
        var pp = tileMap.toAbsolute(newPt);
        var cr = jslash.deepcopy(player.canvasRect());
        cr.x = pp.x; cr.y = pp.y;
        if (tileMap.isFreeArea(cr)) {
          if (isNearerPoint(p, newPt, canvas.center()) || !speed.scroll() ) {
            player.position(newPt.x,newPt.y);
          }
        }
      };
      return makedFunc;
    }

    jslash.addKeyEvent(jslash.KEYS.A,makeSpeedFunc('A'));
    jslash.addKeyEvent(jslash.KEYS.D,makeSpeedFunc('D'));
    jslash.addKeyEvent(jslash.KEYS.S,makeSpeedFunc('S'));
    jslash.addKeyEvent(jslash.KEYS.W,makeSpeedFunc('W'));

    tileMap.ready(function() {

      jslash.times(25,createMine);

      while ( tileMap.scrollDown(canvas) );

      player.canvasRect(new jslash.Rect(0,0,player.width(),player.height()));
      player.center(canvas.center().x,
                    canvas.center().y);
  
      jslash.onupdate = function(dt) {
        //player position normalization
        var p = player.position();
        if ( p.x < 0 ) p.x = 0;
        if ( p.y < 0 ) p.y = 0;
        if ( p.x > canvas.width() - player.width()) p.x = canvas.width() - player.width();
        if ( p.y > canvas.height() - player.height()) p.y = canvas.height() - player.height();
        player.position(p.x,p.y);
    
        drawnObstacles = [];

        jslash.each(obstacles,function(i,e) {
          var p = tileMap.toRelative(e.absPosition);
          if (p.x >= 0 && p.y >= 0 && p.x < canvas.width() && p.y < canvas.height() ) {
            e.position(p.x,p.y);
            drawnObstacles.push(e);
          }
        });
        explosionAnim.drawIt = false;
        jslash.each(drawnObstacles,function(i,e) {
          if (e.collides(player)) {
            explosionAnim.drawIt = true;
            explosionAnim.center(e.center().x,e.center().y);
          }
        });
      };

      jslash.onrefresh = function() {
        canvas.draw(tileMap);
        canvas.draw(info);
        jslash.each(drawnObstacles,function(i,e) {
                      canvas.draw(e);       
                    });
        canvas.draw(player);
        if (explosionAnim.drawIt) {
        	canvas.draw(explosionAnim);
        }
        canvas.draw(lifebar);
      };

      jslash.start(canvas);

    });
  });

})();
