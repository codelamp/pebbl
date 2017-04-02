async('theory.to', function(){

  /**
   * A simple place to store code that casts or converts from one thing to another.
   *
   * @namespace to
   */
  var to = {

    /**
     * Cast "anything" to an array.
     *
     * Makes use of modern approaches where possible i.e. `Array.isArray` and `Array.from`.
     *
     * Falls back to `Array.prototype.slice.call`.
     *
     * @example
     * to.array();          // []
     * to.array(123);       // [123]
     * to.array([123]);     // [123]
     * to.array('123');     // ['1', '2', '3']
     * to.array(arguments); // [arguments[0], arguments[1], arguments[2]]
     *
     * @memberof! to
     * @method
     * @param {any} param - if param is already an array, it is just returned, anything else that can be converted is; anything else is just wrapped.
     * @return {array}
     */
    array: function(param){
      if ( param ) {
        /// check for array type first to short-circuit: modern first, then old-school
        if ( Array.isArray ) {
          if ( Array.isArray(param) ) {
            return param;
          }
        }
        else {
          if ( param.join ) {
            return param;
          }
        }
        /// as long as we have a length property, use casting: modern first, then old-school
        if ( param && typeof param.length != 'undefined' ) {
          if ( Array.from ) {
            return Array.from(param);
          }
          else {
            return Array.prototype.slice.call(param, 0);
          }
        }
      }
      /// otherwise, wrap the value as an array
      return arguments.length ? [param] : [];
    },

    /**
     * Convert "anything" to a function
     *
     * @example
     * to.function(function(){}); // function(){} <-- same ref
     * to.function(123);          // function(){ return param; } <-- param = 123
     *
     * @memberof! to
     * @method
     * @param {any} param - if param is already a function, it is just returned, anything else is wrapped as a function.
     * @return {function}
     */
    "function": function(param){
      if ( param && param.call && param.apply ) {
        return param;
      }
      else {
        return function(){ return param; };
      }
    }

  };

  return to;

});