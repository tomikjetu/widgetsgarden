import { worldToScreen } from "../Tools/misc";

export class Element {
  constructor(props) {
    this.type = props.type;
    this.selected = false;
    this.isDraggable = props.isDraggable != null ? props.isDraggable : true;

    this.ctx = props.ctx;

    this.width = props.width;
    this.height = props.height;
    this.x = props.x;
    this.y = props.y;
    this.backgroundColor = props.backgroundColor;
    this.zIndex = props.zIndex || 0;

    this.data = props.data;
    this.pluginfunctions = props.pluginfunctions || [];

    this.sizeText = `${this.width}px x ${this.height}px`;
    if (!this.pluginfunctions.some((pf) => pf.lock)) this.locked = false;
    else if (this.pluginfunctions.some((pf) => typeof pf.lock == "boolean")) this.locked = true;
    else {
      var lockedPaths = [];
      this.pluginfunctions.forEach((pf) => {
        if (pf.lock) lockedPaths = lockedPaths.concat(pf.lock);
      });
      this.locked = lockedPaths;
    }

    this.pluginIconImage = new Image();
    this.pluginIconImage.src = `${process.env.REACT_APP_WEBSITE_URL}/editor/plugin-icon.svg`;

    this.settings = [
      {
        title: "Layer",
        path: "zIndex",
        type: "range",
        preset: {
          min: 0,
          max: 30,
        },
      },
      {
        title: "Width",
        path: "width",
        type: "number",
      },
      {
        title: "Height",
        path: "height",
        type: "number",
      },
      {
        title: "Position X",
        path: "x",
        type: "number",
      },
      {
        title: "Position Y",
        path: "y",
        type: "number",
      },
      {
        title: "Background",
        path: "backgroundColor",
        type: "color",
      },
    ];
    if (props.link) {
      this.addLink();
      this.link = props.link;
    }
  }

  addSettings(array) {
    this.settings = this.settings.concat(array);
  }

  removeSettings(paths) {
    this.settings = this.settings.filter((el) => !paths.includes(el.path));
  }

  /*
    LINK
  */

  addLink() {
    this.link = "";
    this.addSettings([
      {
        title: "Link",
        path: "link",
        type: "text",
      },
    ]);
  }

  removeLink() {
    delete this.link;
    this.removeSettings(["link"]);
  }

  hasLink() {
    return typeof this.link == "string";
  }

  /*

    CANVAS

  */

  drawSelection() {
    if (!this.selected) return;

    var pos = worldToScreen(this.ctx, this.x, this.y);
    var zoom = this.ctx.zoom;

    this.ctx.beginPath();
    this.ctx.setLineDash([10, 10]);
    this.ctx.lineWidth = "2";
    this.ctx.strokeStyle = "#f3e779";
    this.ctx.rect(pos.x - 1, pos.y - 1, this.width * zoom + 2, this.height * zoom + 2);
    this.ctx.stroke();

    var circles = [
      [pos.x, pos.y],
      [pos.x + this.width * zoom, pos.y],
      [pos.x, pos.y + this.height * zoom],
      [pos.x + this.width * zoom, pos.y + this.height * zoom],
    ];

    var mousePos = this.ctx.mousePos;
    if (!mousePos) return;

    circles.forEach((circle) => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = "#f3e779";

      this.ctx.shadowColor = "black";
      this.ctx.shadowBlur = 5;

      var distance = Math.sqrt(Math.pow(mousePos.x - circle[0], 2) + Math.pow(mousePos.y - circle[1], 2));

      if (distance < 5) this.ctx.fillStyle = "#f3e779";
      else this.ctx.fillStyle = "white";
      this.ctx.arc(circle[0], circle[1], 5, 0, 2 * Math.PI);
      this.ctx.fill();
    });
    this.ctx.shadowBlur = 0;
    this.drawSize();
  }

  drawPluginOverlay() {
    if (this.pluginfunctions.length == 0) return;
    var pos = worldToScreen(this.ctx, this.x + this.width * 0.9, this.y);
    this.ctx.drawImage(this.pluginIconImage, pos.x, pos.y - 12.5 * this.ctx.zoom, 20 * this.ctx.zoom, 25 * this.ctx.zoom);
  }

  drawSize() {
    let padding = 15;
    let radius = 7;

    if (this.ctx.zoom < 0.5) return;

    this.sizeChange();
    this.ctx.font = "20px serif";
    var { width } = this.ctx.measureText(this.sizeText);

    this.ctx.fillStyle = "#f3e779";
    var pos = worldToScreen(this.ctx, this.x + this.width / 2 - width / 2, this.y);
    this.ctx.beginPath();
    this.ctx.roundRect(pos.x, pos.y - 30, width + padding, 25, radius);
    this.ctx.fill();

    this.ctx.fillStyle = "black";
    this.ctx.fillText(this.sizeText, pos.x + padding / 2, pos.y - 12.5);
  }

  sizeChange() {
    this.sizeText = `${Math.floor(this.width)}px x ${Math.floor(this.height)}px`;
  }

  doubleClick() {}

  deselect() {}
}
