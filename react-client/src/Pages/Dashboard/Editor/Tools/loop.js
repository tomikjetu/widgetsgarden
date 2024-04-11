var elements;
var ctx;
var canvas;
export default function (_canvas, _elements) {
  elements = _elements;
  canvas = _canvas;
  ctx = _canvas.getContext("2d");
  requestAnimationFrame(animate);
}

export function updateLoopElements(_elements) {
  elements = _elements;
}

function animate() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

  elements.sort((a, b) => a.zIndex - b.zIndex).forEach((element) => element.draw());
  elements.forEach((element) => {
    element.drawSelection();
    element.drawPluginOverlay();
  });

  requestAnimationFrame(animate);
}

export function drawBackground(backgroudcanvas) {
  var backgroundCtx = backgroudcanvas.getContext("2d");
  const circleRadius = 2;
  const distanceBetweenCircles = 25;
  backgroundCtx.fillStyle = "#1183a5";
  backgroundCtx.fillRect(0, 0, backgroudcanvas.clientWidth, backgroudcanvas.clientHeight);
  for (let y = circleRadius + distanceBetweenCircles / 2; y < backgroudcanvas.clientHeight; y += distanceBetweenCircles) {
    for (let x = circleRadius + distanceBetweenCircles / 2; x < backgroudcanvas.clientWidth; x += distanceBetweenCircles) {
      backgroundCtx.beginPath();
      backgroundCtx.arc(x, y, circleRadius, 0, Math.PI * 2);
      backgroundCtx.fillStyle = "#9ce5fb";
      backgroundCtx.fill();
      backgroundCtx.closePath();
    }
  }
}
