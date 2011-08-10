var require,requireWithRoute;
(function() {
  var required = {};
  require = function(module) {
    if (!required["src/"+module]) {
      document.write('<script type="text/javascript" src="src/'+
                     module+'.js"></script>');
      required["src/"+module] = true;
    }
  };
  
  requireWithRoute = function(route) {
    if (!required[route]) {
      document.write('<script type="text/javascript" src="'+
                     route+'.js"></script>');
      required[route] = true;
    }
  };

})();

