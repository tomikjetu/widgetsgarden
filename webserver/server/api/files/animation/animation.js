function animation_hover_scale(elementId, ...parameters) {
  var duration = parameters[0];
  var scale = parameters[1];

  var element = document.getElementById(elementId);

  element.style.transition = `scale ${duration}ms ease-in-out`;

  element.addEventListener("mouseover", () => {
    element.style.scale = scale;
  });

  element.addEventListener("mouseout", () => {
    element.style.scale = 1;
  });
}
