Theory plugins should have a dependency on the main theory lib.

## Core

These scripts can (and probably will) be loaded before the main theory script is evaluated. This means core scripts cannot rely on theory being in existence, they are only there to add basic extensions to theory itself. Current core scripts are:

- theory.is — check variable types
- theory.has — check properties or attributes
- theory.to — convert things to other things
- theory.base — base theory object handler
- theory.run — better setTimeout wrapper

## Plugins

Plug-ins are scripts the depend on theory being already in existence, so they need to wait for theory to be loaded, these currently are:

- theory.array — better array wrapper
- theory.broadcast — talk between tabs
- theory.creator — create theory-based objects
- theory.events — event handling
- theory.expreg — regular expression wrapper
- theory.navigate — navigate objects using string paths
- theory.overload — create overloaded methods
- theory.store — handle storing information locally and sync remotely
- theory.string — create string parsers
- theory.transform — a bundle of transformation maths
- theory.velocity-range — a bundle of velocity maths

## Create an object with Theory

Currently there are multiple ways to create an object/constructor using Theory. This is down to historical changes, but both are still useful and valid.

### theory.creator

This is a controlled creator system, that comes with a number of benefits. Benefits that may be overkill for some cases, but not for others. Its base working is powered by `Object.create`.

    t.creator({
      i: null,
      prep: function(){
        this.i = {}; // <-- set up a new object with each instance.
      },
      sharedMethod: function(){
        // Whilst we are creating a new `this.i` each istance, this method will be shared.
      }
    });


### theory.base.mix

If you want a simpler construction system, you can use `theory.mix`. This just takes a provided object, and uses it as the base for created instances. You can then mix down other objects on top of this object. Again, its base handling is powered by `Object.create`.

    t.base.mix({
      i: null,
      prep: function(){
        this.i = {}; // <-- set up a new object with each instance.
      }
      sharedMethod: function(){
        // Whilst we are creating a new `this.i` each istance, this method will be shared.
      }
    });


## Design notes

You have the option of having a mixed in handler for events, i.e. the methods are directly applied
to the this object. or a subobject i.e. `this.events.<function>`

The benefits of the mixed in approach are:
- each time an object is created, the this is automatically handled
- the "object" for each instance is different, allowing for non-shared dealings
- you can't access the "shared" prototype directly on this, you have to use the original creator i.e. `polycade.events.<shared>`

The benefits of the subobject:
- you can test against the subobject for instanceOf and other js-handlings
- the event object is the same for all instances so allows for shared dealings
- the prototype could be shared, but this is shared across all instances of events, and not grouped to a "type"

Really you often need both situations when coding, so a solution somewhere down the middle would be best.
- A subobject that is different per each instance, but has the same prototype
- a subobject that can be given an instance on a per "type implementation" i.e. I add a
  grouped event handler for characters, but a different one for landscape items.


## Whilst implementing Polycade

In Polycade there are a number of objects that rely on sub-objects, parent objects, and also delegate to other objects that we have no control over.

As an example, the following is a choice over how things can be implemented:

- When implementing the 'handlers' sub-objects, any methods found within will not have the correct context.
- To fix this, we can re-bind those functions for each created instance.
- This has the benefit of not adding proprietarily named properties to the sub objects.
- You can also use `this.` inside the function to refer to the owning instance.
- This however requires pre-processing and also means that if you use the methods in other context they would need to be rebound.

Example:

    {
      prep: function(){
        this.handlers = t.bindCollection(this.handlers, this);
      },
      handlers: {
        collection: {
          update: {
            this.handlers.collection.update;
          }
        }
      }
    }

Another approach:

- When prepping an instance, we could instead just Object.create each level of sub-object
- We could then attach a property that points back to the parent instance.
- The downside to this approach is that inside the handers `this.i.` would have to be used, rather than `this.`
- The benefits of this approach are that the current operating instance can be switched out entirely.
- You can also easily reset any instance by deleting its `i` property.

For example:

    {
      prep: function(){
        this.i = Object.create(this);
        // this could be implemented automatically without specifying sub-objects by name
        this.i.handlers = Object.create(this.handlers);
        this.i.handlers.self = this.i;
        this.i.handlers.collection.self = this.i;
      },
      handlers: {
        collection: {
          update: {
            this.i.handlers.collection.update;
          }
        }
      }
    }
