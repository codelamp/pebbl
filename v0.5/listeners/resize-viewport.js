/**
 * 
 */
function applyResizeViewport() {
  const listener = () => {
    render.bounds.max.x = viewport.width;
    render.bounds.max.y = viewport.height;
    render.options.width = viewport.width;
    render.options.height = viewport.height;
    render.canvas.width = viewport.width;
    render.canvas.height = viewport.height;
  };

  // @TODO add debounce
  window.addEventListener('resize', listener);
  return () => window.removeEventListener('resize', listener);;
}