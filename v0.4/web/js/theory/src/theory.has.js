async('theory.has', function(){

  /**
   * Check stuff has particular attributes
   *
   * @namespace has
   */
  var has = {

    /**
     * Check that an object has at least one callable function contained within its own properties.
     *
     * @static
     * @method has.childFunctions
     * @param {Object} desc The object to be scanned for callable items.
     * @return {Boolean} True, if item has any `is.callable()` items of its content filtered by `hasOwnProperty()`
     * @return {String} almost never, except if you manually edit the content of this function.
     * @see is.what
     */
    childFunctions: function(desc){
      for ( var i in desc ) {
        if ( desc.hasOwnProperty(i) ) {
          if ( is.callable(desc[i]) ) {
            return true;
          }
        }
      }
      return false;
    },

    /**
     * Check if an array or object has own contents.
     */
    hasItems: function(){
      return false; // @TODO:
    }

  };

  return has;

});