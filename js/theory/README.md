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