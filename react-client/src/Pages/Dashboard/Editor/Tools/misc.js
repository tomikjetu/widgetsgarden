export function screenToWorld(ctx, x, y) {
  var canvasSize = { width: ctx.canvas.clientWidth, height: ctx.canvas.clientHeight };
  
  var zoom = ctx.zoom;
  var pan = ctx.pan;
  
  var positionX = (x - canvasSize.width / 2) / zoom - pan.x;
  var positionY = (y - canvasSize.height / 2) / zoom - pan.y;
 
  return { x: positionX, y: positionY };
}

export function worldToScreen(ctx, x, y) {
  var canvasSize = { width: ctx.canvas.clientWidth, height: ctx.canvas.clientHeight };

  var zoom = ctx.zoom;
  var pan = ctx.pan;

  var positionX = canvasSize.width / 2 + zoom * (x + pan.x);
  var positionY = canvasSize.height / 2 + zoom * (y + pan.y);

  return { x: positionX, y: positionY };
}
