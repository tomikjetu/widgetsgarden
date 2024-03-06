import { worldToScreen } from "../Tools/misc";
import { Element } from "./Element";
import { fonts } from "./Text";

export class Container extends Element {
  constructor(props) {
    props.type = "Container";
    super(props);

    this.addSettings([
      {
        title: "Border Radius",
        path: "data.borderRadius",
        type: "number",
        preset: {
          default: "0",
        }
      },
      {
        title: "Font Size",
        path: "data.font.size",
        type: "number",
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
      {
        title: "Scroll",
        path: "data.scroll",
        type: "switch",
        preset: {
          on: "ON",
          off: "OFF",
          default: false,
        },
      },
    ]);
  }

  draw() {
    var zoom = this.ctx.zoom;
    var pos = worldToScreen(this.ctx, this.x, this.y + this.height);

    this.ctx.lineWidth = "2";
    this.ctx.setLineDash([0]);
    this.ctx.strokeStyle = this.data?.font?.color || "#da33ed";

    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y - this.height * zoom);
    this.ctx.lineTo(pos.x + this.width * zoom, pos.y);
    this.ctx.moveTo(pos.x, pos.y);
    this.ctx.lineTo(pos.x + this.width * zoom, pos.y - this.height * zoom);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(pos.x, pos.y - this.height * zoom, this.width * zoom, this.height * zoom);
    this.ctx.rect(pos.x, pos.y - this.height * zoom, this.width * zoom, this.height * zoom);
    this.ctx.stroke();
  }
}
