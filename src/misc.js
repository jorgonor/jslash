var misc = {};
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
  misc.propertiesAsObject = function(object) {
    var prop = {};
    for(var property in object) {
      if (object.hasOwnProperty(property)) {
        prop[property] = object[property];
      }
    }
    return prop;

  };
})();
