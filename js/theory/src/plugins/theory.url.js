async('theory.plugins.url', ['theory', 'theory.plugins.expreg'], function(theory){

  var t = theory; theory.plugins = theory.plugins || {};

  /**
   * Simplistic URL handling
   *
   * @memberof! theory
   * @namespace theory.url
   */
  t.url = t.method({
    attributes: {
      ///             "^(?:([^:/?#]+):)?(?://([^/?#]*))?([^?#]*)(\\?(?:[^#]*))?(#(?:.*))?"
      pattern: RegExp("^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\\?([^#]*))?(#(.*))?")
    },
    method: function(url){
      var matches = url.match(t.url.pattern);
      return {
        protocol: matches[2],
        hostname: matches[4],
        pathname: matches[5],
        search: matches[7],
        hash: matches[9]
      };
    }
  });

  /**
   * Convert a path into an array of segments
   *
   * @memberof! theory.url
   * @method
   * @static
   */
  t.url.path = t.method({
    attributes: {
      pattern: t.ExpReg(/[^\/]+/g)
    },
    method: function(path){
      return t.array(t.url.path.pattern.haystack(path).map(0));
    }
  });

  
  return theory.plugins.dom;

});