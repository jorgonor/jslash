var misc;
(function() {
  misc.properties = function(object) {
    var prop = [];
    for(var property in object) {
      if (object.hasOwnProperty(property)) {
        prop.push(property);
      }
    }
    return prop;
  };
})();
