import { Element } from "./Element";
import { fonts } from "./Text";
import { worldToScreen } from "../Tools/misc";

export class ButtonElement extends Element {
  constructor(props) {
    props.type = "Button";

    super(props);

    this.imagedata = new Image();
    this.url = "";

    this.brokenImage = new Image();
    this.brokenImage.src = `${process.env.REACT_APP_WEBSITE_URL}/broken-image.png`;

    this.fetchImage();
    this.broken = false;

    this.addSettings([
      {
        title: "Text",
        path: "data.text",
        type: "text",
      },
      {
        title: "Font Size",
        path: "data.font.size",
        type: "range",
        preset: {
          min: 1,
          max: 80
        }
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
        title: "Text Color",
        path: "data.font.color",
        type: "color",
      },
      {
        title: "Icon",
        path: "data.enableIcon",
        type: "switch",
        refresh: true,
        preset: { on: "ENABLE", off: "DISABLE", default: false },
      },
      {
        title: "Icon Image",
        path: "data.icon",
        type: "image",
        condition: "{data.enableIcon} == true",
        preset: {
          conditionDefault: false,
        },
      },
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
    ]);
  }

  fetchImage() {
    this.broken = false;
    this.url = this.data.icon;
    this.imagedata = new Image();
    this.imagedata.src = this.url;
    var data = this;
    this.imagedata.onerror = function () {
      data.broken = true;
      data.imagedata.src = data.brokenImage.src;
    };
  }

  getText() {
    if (typeof this.locked == 'object' && this.locked.includes('data.text')) return "PLUGIN";
    return this.data.text;
  }

  draw() {
    if (this.url != this.data.icon) this.fetchImage();

    var zoom = this.ctx.zoom;
    var pos = worldToScreen(this.ctx, this.x, this.y + this.height);


    this.ctx.beginPath();

    this.ctx.roundRect(pos.x, pos.y - this.height * zoom, this.width * zoom, this.height * zoom, this.data.borderRadius ?? 0);
    this.ctx.fillStyle = this.backgroundColor;
    if (this.data.borderStroke > 0) {
      this.ctx.strokeStyle = this.data.borderStrokeColor;
      this.ctx.lineWidth = this.data.borderStroke ?? 0;
      this.ctx.setLineDash([]);
      this.ctx.stroke();
    }
    this.ctx.fill();

    this.ctx.font = this.data.font.size * zoom + "px " + this.data.font.family;
    var { width } = this.ctx.measureText(this.getText());
    let iconSize = this.data.font.size * 2;

    // TODO DRAW THE IMAGE AND TEXT RESPONSIVELY

    if (this.data.enableIcon && this.imagedata.complete && !this.broken) this.ctx.drawImage(this.imagedata, pos.x + (this.width * zoom - width) / 3 - this.data.font.size * zoom, pos.y - (this.height * zoom + 2 * this.data.font.size * zoom) / 2, iconSize * zoom, iconSize * zoom);

    this.ctx.fillStyle = this.data.font.color;
    this.ctx.fillText(this.getText(), pos.x + (this.width * zoom - width) * (this.data.enableIcon ? (2/3) : (1/2)), pos.y - (6 * zoom+this.height * zoom - this.data.font.size * zoom) / 2);
  }
}
