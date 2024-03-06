import { PLUGINS } from "../Editor";
import { Widget } from "../Elements/Widget";
import { screenToWorld } from "./misc";

var canvas, elements, setElements, setResizeElement, setResizeOrigin, openPluginMenu, setOpenPluginsModal;

export function updateManagerElements(_elements) {
  elements = _elements;
}

export function getElement(mouseX, mouseY) {
  var elementsOver = [];
  var pos = screenToWorld(canvas.current.getContext("2d"), mouseX, mouseY);

  var resizeSelection = null;
  elements.forEach((element) => {
    if (resizeSelection) return;

    if (element.selected) {
      var circles = [
        [element.x, element.y],
        [element.x + element.width, element.y],
        [element.x, element.y + element.height],
        [element.x + element.width, element.y + element.height],
      ];

      for (var i = 0; i < 4; i++) {
        var circle = circles[i];
        var distance = Math.sqrt(Math.pow(circle[0] - pos.x, 2) + Math.pow(circle[1] - pos.y, 2));
        if (distance < 5) {
          resizeSelection = element;
          resizeSelection.resize = true;
          setResizeElement(resizeSelection);
          setResizeOrigin(i);
          return;
        }
      }
    }
    if (pos.x > element.x && pos.x < element.x + element.width && pos.y > element.y && pos.y < element.y + element.height) elementsOver.push(element);
  });

  if (PLUGINS) {
    var widget = elements.filter((w) => w.type == "Widget")[0];
    var PluginBoxWidth = 100;
    var PluginBoxHeight = 40;
    var gap = 10;
    var initText = 20;
    var PluginsX = widget.x + widget.width + 50;
    var PluginsY = widget.y;
    var posY = PluginsY + gap + initText;
    for (var pluginid of widget.data.plugins) {
      var plugin = PLUGINS.filter((p) => p.id == pluginid)[0];
      if (!plugin) return;
      if (pos.x > PluginsX + gap && pos.y > posY && pos.x < PluginsX + gap + PluginBoxWidth && pos.y < posY + PluginBoxHeight) {
        openPluginMenu(plugin.id);
        return null;
      }
      posY += PluginBoxHeight + gap;
    }
    if (pos.x > PluginsX + gap && pos.y > posY && pos.x < PluginsX + gap + PluginBoxWidth && pos.y < posY + PluginBoxHeight) {
      setOpenPluginsModal(true);
    }
  }

  if (resizeSelection) return resizeSelection;

  elementsOver.sort((a, b) => b.zIndex - a.zIndex);
  return elementsOver[0];
}

export function addElement(element) {
  setElements((elements) => {
    elements.push(element);
    return elements;
  });
}

export function removeElement(element) {
  setElements((elements) => {
    elements = elements.filter((e) => e != element);
    return elements;
  });
}

export function loadLayout(_canvas, _elements, _setELements, _setResizeElement, _setResizeOrigin, _openPluginMenu, _setOpenPluginsModal) {
  canvas = _canvas;
  setResizeElement = _setResizeElement;
  setResizeOrigin = _setResizeOrigin;
  setElements = _setELements;
  elements = _elements;
  openPluginMenu = _openPluginMenu;
  setOpenPluginsModal = _setOpenPluginsModal;
}

export function saveLayout() {}
