import { worldToScreen } from "../Tools/misc";
import { Element } from "./Element";
import { fonts } from "./Text";

export class Container extends Element {
  constructor(props) {
    props.type = "Container";
    super(props);

    this.FunctionContainerId = "";
    this.FunctionContainerImage = new Image();
    this.FunctionContainerImageMissing = new Image();
    this.FunctionContainerImageMissing.src = `${process.env.REACT_APP_SERVER_URL}/assets/library/function/missing`;

    this.addSettings([
      {
        title: "Border Radius",
        path: "data.borderRadius",
        type: "range",
        preset: {
          default: "0",
        },
      },
      {
        title: "Font Size",
        path: "data.font.size",
        type: "range",
        preset: {
          default: "15",
          min: 1,
          max: 100,
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
        title: "Text Color",
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

  fetchFunctionContainerImage(id) {
    if (this.FunctionContainerId === id) return;
    this.FunctionContainerId = id;
    this.FunctionContainerImage.src = `${process.env.REACT_APP_SERVER_URL}/assets/library/function/${this.FunctionContainerId}`;
    var data = this;
  }

  draw() {
    var zoom = this.ctx.zoom;
    var pos = worldToScreen(this.ctx, this.x, this.y + this.height);

    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(pos.x, pos.y - this.height * zoom, this.width * zoom, this.height * zoom);
    // this.ctx.rect(pos.x, pos.y - this.height * zoom, this.width * zoom, this.height * zoom);

    if (this.locked !== true) {
      this.ctx.lineWidth = "2";
      this.ctx.setLineDash([0]);
      this.ctx.strokeStyle = this.data?.font?.color || "#da33ed";

      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y - this.height * zoom);
      this.ctx.lineTo(pos.x + this.width * zoom, pos.y);

      this.ctx.moveTo(pos.x, pos.y);
      this.ctx.lineTo(pos.x + this.width * zoom, pos.y - this.height * zoom);
      this.ctx.stroke();
    } else {
      var FunctionLock = this.pluginfunctions.filter((el) => el.lock === true)[0];
      var id = `${FunctionLock.plugin}-${FunctionLock.id}`;
      var text = FunctionLock.name;

      this.fetchFunctionContainerImage(id);

      this.ctx.font = `16px Arial`;
      var { width } = this.ctx.measureText(text || "");
      var fontSize = Math.floor((this.width * zoom) / (width / text.length * 1.5));

      this.ctx.font = `${fontSize}px Arial`;
      var { width } = this.ctx.measureText(text || "");

      this.ctx.fillStyle = this.data?.font?.color || "#da33ed";
      this.ctx.fillText(text, pos.x + (this.width * zoom - width) / 2, pos.y - (this.height * zoom) * .65);

      // Image

      var aspectRatio = this.FunctionContainerImage.naturalHeight / this.FunctionContainerImage.naturalWidth;
      var width = this.width * zoom * 0.4;
      var height = width * aspectRatio;
      var padding = 5
      var posX = pos.x + this.width * zoom - width - padding * zoom;
      var posY = pos.y - height - padding * zoom;

      if (this.FunctionContainerImage.complete) this.ctx.drawImage(this.FunctionContainerImage, posX, posY, width, height);
      else if (this.FunctionContainerImageMissing.complete) this.ctx.drawImage(this.FunctionContainerImageMissing, posX, posY, width, height);
    }
  }
}
