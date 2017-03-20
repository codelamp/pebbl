/**
 * The trigger manager for polycade
 */
async('theory.base', ['underscore'], function(_){

  var theory = async.ref('theory', {});

  /**
   * A base object handler in the theory-style
   *
   * @memberof! theory
   * @namespace
   */
  theory.base = {

    /**
     * Mix other objects into the first object, including the items that exist on theory.base
     *
     * @memberof! theory.base
     * @method
     * @param {object} destination
     * @param {object} mixin
     * @return {object} destination
     */
    mix: function(){
      // convert to array, and insert this base object as second
      var args = Array.prototype.slice.apply(arguments); args.splice(1, 0, this);
      var instance = _.extend.apply(_, args);
      instance.prepNS(); // make sure we are set up for namespaces
      return instance;
    },

    /**
     *
     */
    create: function(){
      var instance = Object.create(this);
      this.prep.apply(instance, arguments);
      return instance;
    },

    /**
     *
     */
    createNS: function(){
      var namespace = Object.create(this);
      this.prepNS.apply(namespace, arguments);
      return namespace;
    },

    /**
     *
     */
    prep: function(){
      return this;
    },

    /**
     * When creating under a new namespace, we only wish to reset certain things
     */
    prepNS: function(){
      this.is = {};
      this.shared = {
        namespaces: {}
      };
      return this;
    },

    /**
     * Pass in a string-based namespace, this will create or return a new
     * wrapping instance of polycade.events().
     */
    namespace: function(ns){
      return this.shared.namespaces[ns] || (this.shared.namespaces[ns] = this.createNS(ns));
    }

  };

  return theory.base;

});