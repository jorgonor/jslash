var require,requireAbsolute,requireRoot;
(function() {
  var root = "src/";
  var required = {};
  require = function(module) {
    var realModule = root+module;
    if (!required[realModule]) {
      document.write('<script type="text/javascript" src="'+realModule
                     +'.js"></script>');
      required[realModule] = true;
    }
  };
  
  requireAbsolute = function(route) {
    if (!required[route]) {
      document.write('<script type="text/javascript" src="'+
                     route+'.js"></script>');
      required[route] = true;
    }
  };
  
  requireRoot = function(r) {
    root = r;
    if (root[root.length-1] != '/' ) {
      root += '/';
    }
  };

})();

