import { Element } from "./Element";
import { worldToScreen } from "../Tools/misc";

export const fonts = [
  {
    text: "Arial",
    value: "Arial",
  },
  {
    text: "Serif",
    value: "Serif",
  },
];

export class Text extends Element {
  constructor(props) {
    props.type = "Text";
    super(props);
    
    // Measure text
    props.ctx.font = props.data.font.size + "px " + props.data.font.family;
    var { width } = props.ctx.measureText(this.getText());
    this.width = width;
    this.height = parseInt(props.data.font.size);

    this.sizeDisplayed = props.data.font.size;
    this.sizeText = props.data.font.size + "px";
    this.addSettings([
      {
        title: "Text",
        path: "data.text",
        type: "text-multiline",
      },
      {
        title: "Font Size",
        path: "data.font.size",
        type: "range",
        preset: {
          min: 1,
          max: 80,
        },
      },
      {
        title: "Font Family",
        path: "data.font.family",
        type: "dropdown",
        preset: {
          options: fonts,
        },
      },
      {
        title: "Text Transform",
        path: "data.font.transform",
        type: "dropdown",
        preset: {
          default: "none",
          options: [
            { text: "None", value: "none" },
            { text: "Capitalize", value: "capitalize" },
            { text: "Uppercase", value: "uppercase" },
            { text: "Lowercase", value: "lowercase" },
          ],
        },
      },
      {
        title: "Color",
        path: "data.font.color",
        type: "color",
      },
    ]);
    this.removeSettings(["width", "height", "backgroundColor"]);
  }

  getText() {
    var text = this.data.text;
    if (typeof this.locked == 'object' && this.locked.includes('data.text')) text = "Plugin";
    switch(this.data.font.transform) {
      case "capitalize":
        text = text.charAt(0).toUpperCase() + text.slice(1);
        break;
      case "uppercase":
        text = text.toUpperCase();
        break;
      case "lowercase":
        text = text.toLowerCase();
        break;
    }
    return text;
  }

  draw() {
    var zoom = this.ctx.zoom;
    var pos = worldToScreen(this.ctx, this.x, this.y + this.height);

    if (this.sizeDisplayed != this.data.font.size) this.updateSize(this.data.font.size);

    this.ctx.font = this.data.font.size * zoom + "px " + this.data.font.family;
    this.ctx.fillStyle = this.data.font.color;
    this.ctx.fillText(this.getText(), pos.x, pos.y);
  }

  updateSize(fontSize, height) {
    var value = fontSize || height;
    this.height = value;
    this.data.font.size = value;
    this.sizeChange();
  }

  sizeChange() {
    this.ctx.font = this.data.font.size + "px " + this.data.font.family;
    var { width } = this.ctx.measureText(this.getText());
    this.width = width;
    this.sizeText = Math.floor(this.height) + "px";
  }

  doubleClick() {
    // TODO focus on text setting
  }

  deselect() {}
}
