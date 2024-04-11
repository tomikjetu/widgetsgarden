import { Element } from "./Element";
import { worldToScreen } from "../Tools/misc";
import { PLUGINS } from "../Editor";

var textColor = function (backgroundColor) {
  var result = /^rgba\(([0-9]{0,3}), ?([0-9]{0,3}), ?([0-9]{0,3}), ?([.0-9]{0,})\)$/i.exec(backgroundColor);
  if (!result) {
    return "#000000"; //Happens when not given hex
  }
  if (parseFloat(result[4]) < 0.5) return "#000000";
  var shade = (parseInt(result[1]) + parseInt(result[2]) + parseInt(result[3])) / 3;
  return shade > 128 ? "#000000" : "#FFFFFF";
};

export class Widget extends Element {
  constructor(props) {
    props.type = "Widget";
    props.zIndex = -1;

    if (props.data == null) {
      props.data = {};

      props.data.popup = false;
      props.data.positionlock = ""; //topleft, topRight, bottomleft, bottomright, center
      props.data.backdropBlur = true;
      props.data.openDefaultly = true;
      props.data.borderRadius = 0;
      props.data.borderStroke = 0;
      props.data.borderStrokeColor = "#000";

      props.data.plugins = [];
    }

    super(props);

    this.addSettings([
      {
        title: "Border Radius",
        path: "data.borderRadius",
        type: "range",
        preset: {
          default: "0",
          min: 0,
          max: 100,
        }
      },
      {
        title: "Border Stroke Width",
        path: "data.borderStroke",
        type: "range",
        preset: {
          default: "0",
          min: 0,
          max: 100,
          mouseUp: true
        },
        refresh: true,
      },
      {
        title: "Border Stroke Color",
        path: "data.borderStrokeColor",
        type: "color",
        condition: "{data.borderStroke} > 0",
        preset: {
          conditionDefault: "0",
          default: "#000",
        },
      },
      {
        title: "Popup",
        path: "data.popup",
        type: "switch",
        preset: {
          on: "Popup",
          off: "In Text",
        },
        refresh: true,
      },
      {
        title: "Popup position",
        path: "data.positionLock",
        type: "dropdown",
        condition: "{data.popup} == true",
        preset: {
          default: "center",
          options: [
            { text: "Top Left", value: "topLeft" },
            { text: "Top Right", value: "topRight" },
            { text: "Bottom Left", value: "bottomLeft" },
            { text: "Bottom Right", value: "bottomRight" },
            { text: "Center", value: "center" },
          ],
        },
      },
      {
        title: "Background blur",
        path: "data.backdropBlur",
        type: "switch",
        condition: "{data.popup} == true",
        preset: {
          on: "ON",
          off: "OFF",
        },
      },
      {
        title: "Open by default",
        path: "data.openDefaultly",
        type: "switch",
        condition: "{data.popup} == true",
        preset: {
          on: "ON",
          off: "OFF",
        },
      },
    ]);
    this.removeSettings("zIndex");
  }
  draw() {
    var zoom = this.ctx.zoom;
    var pos = worldToScreen(this.ctx, this.x, this.y);

    this.ctx.beginPath();

    this.ctx.roundRect(pos.x, pos.y, this.width * zoom, this.height * zoom, this.data.borderRadius ?? 0);
    this.ctx.fillStyle = this.backgroundColor;
    if (this.data.borderStroke > 0) {
      this.ctx.strokeStyle = this.data.borderStrokeColor;
      this.ctx.lineWidth = this.data.borderStroke ?? 0;
      this.ctx.setLineDash([]);
      this.ctx.stroke();
    }
    this.ctx.fill();

    /* DRAW WATERMARK */

    var watermarkColor = textColor(this.backgroundColor);
    var fontSize = Math.min(24, parseInt(this.width) / 8) * zoom;
    this.ctx.font = fontSize + "px " + "arial";
    var textLength = this.ctx.measureText("WidgetsGarden");
    this.ctx.fillStyle = watermarkColor;
    this.ctx.fillText("WidgetsGarden", pos.x + (this.width - 10) * zoom - textLength.width, pos.y + (this.height - 10) * zoom);

    /* DRAW PLUGINS */

    var pluginsLength = this.data.plugins.length;

    var gap = 10;
    var initText = 20;
    var PluginBoxWidth = 100;
    var PluginBoxHeight = 40;
    var boxHeight = (pluginsLength + 1) * PluginBoxHeight + gap * (pluginsLength + 1)  + gap + initText;

    var PluginsPos = worldToScreen(this.ctx, this.x + this.width + 50, this.y);
    this.ctx.fillStyle = "#ffffff50";
    this.ctx.fillRect(PluginsPos.x, PluginsPos.y, (PluginBoxWidth + gap * 2) * zoom, boxHeight * zoom);

    this.ctx.font = 18 * zoom + "px " + "arial";
    this.ctx.fillStyle = "#000";
    this.ctx.fillText("Plugins", PluginsPos.x + gap * zoom + 5 * zoom, PluginsPos.y + 22 * zoom);

    function drawPlugin(instance, plugin) {
      instance.ctx.fillStyle = "#ffffff";
      if (instance.ctx.mousePos) {
        if (instance.ctx.mousePos.x > PluginsPos.x + gap * zoom && instance.ctx.mousePos.y > posY && instance.ctx.mousePos.x < PluginsPos.x + gap * zoom + PluginBoxWidth * zoom && instance.ctx.mousePos.y < posY + PluginBoxHeight * zoom) {
          instance.ctx.fillStyle = "#f3e779";
        }
      }
      instance.ctx.fillRect(PluginsPos.x + gap * zoom, posY, PluginBoxWidth * zoom, PluginBoxHeight * zoom);

      instance.ctx.font = 14 * zoom + "px " + "arial";
      instance.ctx.fillStyle = "#000";
      instance.ctx.fillText(plugin.name, PluginsPos.x + gap * zoom + 5 * zoom, posY + 20 * zoom);
    }

    var posY = PluginsPos.y + gap * zoom + initText * zoom;
    for (var pluginid of this.data.plugins) {
      var plugin = PLUGINS.filter((p) => p.id == pluginid)[0];
      if (!plugin) return;

      drawPlugin(this, plugin);

      posY += PluginBoxHeight * zoom + gap * zoom;
    }
    drawPlugin(this, {name: "Add Plugin"})
  }
}
