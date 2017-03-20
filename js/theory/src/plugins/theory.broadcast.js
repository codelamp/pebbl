/**
 * Broadcast Message v0.2
 *
 * @author  ~ Phil Glanville, 2013
 * @license ~ Released under the premises license (part of the Premises Act 2003)
 *
 * @TODO: should be promisified
 */
async('theory.plugins.broadcast', ['theory'], function(theory){

  var t = theory = theory || {}; theory.plugins = theory.plugins || {};

  theory.plugins.broadcast = (function(mixin){

    /**
     * # The BroadcastMessage Object
     *
     *  ## About
     *
     *    A simple messaging system the operates between tabs, on the same domain.
     *    Whereas `window.postMessage` requires a target window object,
     *    `window.broadcastMessage` does not... Any listening tab will receive the
     *    message as long as it is sharing the same `localStorage` object.
     *
     *    The system also supports a reply ability, allowing the listening tab to
     *    send a message back to the origin of the broadcast.
     *
     *  ## Usage:
     *
     *  ### To send (origin tab)
     *
     *      window.broadcastMessage({ content: 'hello' });
     *
     *  ### To listen (receiving tab)
     *
     *      window.addEventListener('broadcastmessage', function(e){
     *         var message = e.data;
     *         console.log( 'message reads',     message.content );
     *         console.log( 'message id',        message.mid );
     *         console.log( 'message origin id', message.oid );
     *         console.log( 'message occured',   message.occured );
     *         console.log( 'local storage key', message.key );
     *      });
     *
     *  ### To send and listen for a reply (origin tab)
     *
     *      window.broadcastMessage({ message: 'hello', wait: 1000, callback: function( reply ){
     *        console.log( reply.content );
     *      }});
     *
     *  ### To reply (receiving tab)
     *
     *      window.addEventListener('broadcastmessage', function(e){
     *        var message = e.data;
     *            message.reply('hello back');
     *      });
     */
    var bm = theory.base.mix(mixin || {}, {

      /**
       * initialise this instance of BroadcastMessage.js
       */
      init: function(){
        bm.id                 = bm.guid();
        bm.messageKey.keysize = bm.messageKey(bm.id,bm.id).length;
        bm.replyKey.keysize   = bm.replyKey(bm.id,bm.id,bm.id).length;
        window.addEventListener('storage', bm.storageChanged, false);
      },

      /**
       * ## Send a message
       *
       *   This method expects `args` to be an object which contains the following:
       *
       *     args.content   :primitive-type
       *     args.callback  :function           (optional)
       *     args.wait      :string or :number  (optional, linked to callback)
       *
       *   `args.content` can be any primitive js type; a string is probably the best.
       *    If you wish to send an object or array, bear in mind that it will be
       *    `JSON.stringify`-ied before being sent.
       *
       *   `args.callback` will be called at a certain point -- when exactly this
       *    occurs will be defined by the `args.wait` param.
       *
       *   `args.wait` will control when the callback is used:
       *
       *     A :number is treated as a timeout -- i.e. 2000 will wait approx.
       *     2 seconds and then fire the callback with whatever information has been
       *     sent from the replying tabs (if any).
       *
       *     A :string of 'first' will mean the callback will fire after the first
       *     other tab to reply. There is no timeout currently @todo: possibly
       *     add a timeout to avoid callbacks becoming trapped waiting for a reply
       *     that may never come.
       *
       *     A :string of 'none' will fire the callback straight after having sent
       *     the broadcast message.
       */
      sendMessage: function( args ){
        var data;
        /// handle defaults
        (!args)          && (args = {});
        (!args.content)  && (args.content = '');
        (!args.callback) && (args.callback = false);
        (!args.wait)     && (args.wait = false);
        /// build our message
        data                 = {};
        data.replies         = [];
        data.message         = {};
        data.message.oid     = bm.id;
        data.message.mid     = bm.guid();
        data.message.key     = bm.messageKey( data.message.oid, data.message.mid );
        data.message.content = args.content;
        data.message.occured = new Date().getTime();
        /// only wait if we have a callback, no point otherwise
        if ( args.callback ) {
          /// define our callback caller
          data.callback = function(){
            bm.clearMessage( data.message );
            window.removeEventListener( 'broadcastreply', data.listener );
            args.callback.call( data.message, data.replies );
          };
          /// define out reply listener
          data.listener = function(e){
            if ( e.data ) {
              /// add to our list of replies
              data.replies.push( e.data );
              /// if we are waiting on the first reply, trigger now.
              if ( args.wait === 'first' ) {
                data.callback();
              }
            }
          };
          /// what kind of wait are we flouncing
          switch ( args.wait ) {
            /// wait for nothing... i.e. call callback immeditately
            case 'none': data.callback(); break;
            /// wait for only the first reply
            case 'first': window.addEventListener('broadcastreply', data.listener); break;
            /// default is assume a timeout wait
            default:
              if ( this.isNumber((args.wait = 0 + args.wait)) ) {
                window.addEventListener('broadcastreply', data.listener);
                data.tid = setTimeout(data.callback, args.wait);
              }
            break;
          }
        }
        else {
          /// remove the message after a grace period for the other tabs to pick up
          setTimeout(function(){bm.clearMessage( data.message );},100);
        }
        /// send the message
        window.localStorage.setItem(data.message.key, JSON.stringify(data.message));
      },

      /**
       * Simple isNumber function
       */
      isNumber: function(v){return !isNaN(v);},

      /**
       * Because messages are stored in localStorage we need a simple function
       * to clear that storage object out.
       */
      clearMessage: function( message ){
        if ( message && message.key ) {
          delete window.localStorage[message.key];
        }
      },

      /**
       * Cross browser custom event trigger function
       */
      triggerEvent: function( element, data, bubbles, cancelable ){
        var i, event;
        event = document.createEvent
          ? document.createEvent('HTMLEvents')
          : document.createEventObject()
        ;
        event.initEvent
          ? event.initEvent(data.type, bubbles, cancelable)
          : (event.eventType = data.type)
        ;
        for ( i in data ) {
          if ( i == 'type' ) continue;
          event[i] = data[i];
        }
        element.dispatchEvent
          ? element.dispatchEvent(event)
          : element.fireEvent('on' + event.eventType, event)
        ;
      },

      /**
       * Given a message object, will broadcast a reply.
       */
      replyToMessage: function( content ){
        var original = this, data;
        if ( original.mid ) {
          /// build our message
          data                 = {};
          data.message         = {};
          data.message.oid     = bm.id;
          data.message.rid     = original.oid;
          data.message.mid     = bm.guid();
          data.message.key     = bm.replyKey( data.message.oid, data.message.rid, data.message.mid );
          data.message.content = content;
          data.message.occured = new Date().getTime();
          /// send reply
          window.localStorage.setItem(data.message.key, JSON.stringify(data.message));
        }
        else {
          console.warn('unable to reply, no original!', original.key);
        }
      },

      /**
       * A simple event listener triggered when localStorage is changed
       */
      storageChanged: function(e){
        var message, data = {};
        /// parse the changed key for broadcast information
        if ( e.key && e.newValue && (data.key = bm.parseKey( e.key )) ) {
          /// if we are dealing with a reply for us
          if ( data.key.rid === bm.id ) {
            /// build our message object and attach to a new broadcastmessage event
            data.message = JSON.parse(e.newValue);
            /// send the event out into the wide world *ahem*, erm.. I mean, current tab.
            bm.triggerEvent(window, {
              type: 'broadcastreply',
              data: data.message
            });
            /// remove the reply now that we have received it.
            bm.clearMessage( data.message );
            return;
          }
          /// a reply for someone else
          else if ( data.key.rid ) {
            return;
          }
          /// as long as this doesn't originate from us
          else if ( data.key.oid !== bm.id ) {
            /// build our message object and attach to a new broadcastmessage event
            data.message = JSON.parse(e.newValue);
            data.message.reply = function(){
              return bm.replyToMessage.apply( data.message, arguments );
            };
            /// send the event out into the wide world *ahem*, erm.. I mean, current tab.
            bm.triggerEvent(window, {
              type: 'broadcastmessage',
              data: data.message
            });
          }
        }
      },

      /**
       * create a key used in localStorage for messages
       * size = 3 + 16 + 1 + 16 = 36
       */
      messageKey: function( originID, messageID ){
        return 'bm:' + originID + ':' + messageID;
      },

      /**
       * create a key used in localStorage for replies
       * size = 3 + 16 + 1 + 16 + 1 + 16 = 53
       */
      replyKey: function( originID, replytoID, messageID ){
        return 'bm:' + originID + ':' + replytoID + ':' + messageID;
      },

      /**
       * Parse a localStorage key to see if it has anything to do with us
       */
      parseKey: function( key ){
        /// check we are dealing with a broadcast message
        if ( key.substr(0,3) === 'bm:' ) {
          /// reply key
          if ( key.length === bm.replyKey.keysize ) {
            return {
              oid: key.substr(4,16),
              rid: key.substr(20,16),
              mid: key.substr(37,16)
            };
          }
          /// message key
          else if ( key.length === bm.messageKey.keysize ) {
            return {
              oid: key.substr(4,16),
              rid: null,
              mid: key.substr(20,16)
            };
          }
        }
      },

      /**
       * Generate a random -- hopefully unique -- id.
       */
      guid: function(){
        return ('' +
          (((1+Math.random())*0x10000)|0).toString(16).substring(1) +
          (((1+Math.random())*0x10000)|0).toString(16).substring(1) +
          (((1+Math.random())*0x10000)|0).toString(16).substring(1) +
          (((1+Math.random())*0x10000)|0).toString(16).substring(1) +
        '');
      }

    });

    /**
     * Expose this functionality in a public easy-to-access way
     *
     * For further information on how to use this method look at the
     * sendMessage method.
     */
    window.broadcastMessage = function( args ){
      return bm.sendMessage( args );
    };

    bm.init();

    return bm;

  })(theory.plugins.broadcast);

});