# Pebbl Matter

## 31 July 2022

Due to dust being such a big project and my time available getting even smaller I've decided to focus on a simple page-by-page approach to Pebbl using Matter js as a base. It's support for polygon collisions seems to be enough for what I need in terms of collision detection in Pebbl. The only thing I need to watch out for is that it doesn't seem to handle fiddly bits very well.

Tasks I'm currently focusing on:

- [x] ShadowCasting using a ray query
- [x] Improving the floating behaviour of rocks using ray query distancing
- Improve the players movement handling
- [REMOVED] Correct the scaling tricks that were built for Gadgets that are still linked into the code here, but do not work as expected.


## 2 Aug 2022

Have spent some time tidying up the rushed codebase hacked together from a previous attempt at using Matter js.

- Uploaded a test version to pebbl.co.uk/v0.5

Things to do next:

- Tidying up core.js (breaking off into modular files)
- Improve rocks by making them into classes
- Combine all the viewport handling into the viewport-handler.
- Improve viewport handling so that it can deal with a viewport resize and still go on to correctly pan and scale.
- Still uncertain if listeners should be kept separate for visibility or if they are fine to form part of specific handlers e.g. viewport-handler.
- Work towards getting the scene file to be a bit more "in control" of what is going on. This is so that we can switch scenes in the future.

- Uncertain how to achieve advanced render techniques with Matter e.g. combining shadows on the same layer and apply blend modes so that shadows do not "double up". Recommendation is that the renderer that ships with Matter is basic but is easy to extend your own version.

## 3 Aug 2022

Added more assets to the scene, plus further tidying up.

- jump ability is enabled whenever the player collides with anything, in any way. This needs to be improved.