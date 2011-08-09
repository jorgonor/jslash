var core = 
(function() {
  var core= {};
  core.Rectangle = function (x,y,width,height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.center = new core.Point((2*this.x+this.width)/2,(2*this.y+this.height)/2);
  };
 
  core.Point = function(x,y) {
    this.x = x;
    this.y = y;
  }
 
  return core;
})();

var ret = (function() {
  var required = {};
  function require(module) {
    if (!("src/"+module in required)) {
      document.write('<script type="text/javascript" src="src/'+
                     module+'.js"></script>');
    }
    required["src/"+module] = true;
  }
  
  function requireWithRoute(route) { 
     if (!(route in required)) {
      document.write('<script type="text/javascript" src="'+
                     route+'.js"></script>');
    }
    required[route] = true;

  }
  return {'require': require, 'requireWithRoute': requireWithRoute};
})();

var require = ret['require'];
var requireWithRoute = ret['requireWithRoute'];
