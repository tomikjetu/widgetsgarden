import { Element } from "./Element";
import { worldToScreen } from "../Tools/misc";

export class ImageElement extends Element {
  constructor(props) {
    props.type = "Image";

    super(props);

    this.imagedata = new Image();
    this.url = "";

    this.lockedImage = new Image();
    this.lockedImage.src = `${process.env.REACT_APP_WEBSITE_URL}/locked-image.png`;

    this.brokenImage = new Image();
    this.brokenImage.src = `${process.env.REACT_APP_WEBSITE_URL}/broken-image.png`;

    this.fetchImage();
    this.broken = false;

    this.removeSettings(["backgroundColor"]);
    this.addSettings([
      {
        title: "Image",
        path: "data.url",
        type: "image",
      },
    ]);
  }

  fetchImage() {
    this.broken = false;
    this.url = this.data.url;
    this.imagedata = new Image();
    this.imagedata.src = this.url;
    var data = this;
    this.imagedata.onerror = function () {
      data.broken = true;
      data.imagedata.src = data.brokenImage.src;
    };
  }

  draw() {
    if (this.url != this.data.url) this.fetchImage();

    var zoom = this.ctx.zoom;
    var pos = worldToScreen(this.ctx, this.x, this.y);
    if (typeof this.locked == 'object' && this.locked.includes('data.url')) this.ctx.drawImage(this.lockedImage, pos.x, pos.y, this.width * zoom, this.height * zoom);
    else if (this.imagedata.complete && !this.broken) this.ctx.drawImage(this.imagedata, pos.x, pos.y, this.width * zoom, this.height * zoom);
    else {
      if (!this.brokenImage.complete) {
        this.ctx.fillStyle = "6F6F6F";
        this.ctx.fillRect(pos.x, pos.y, this.width * zoom, this.height * zoom);
      } else {
        this.ctx.drawImage(this.brokenImage, pos.x, pos.y, this.width * zoom, this.height * zoom);
      }
    }
  }
}
