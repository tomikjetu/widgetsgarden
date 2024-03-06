import axios from "axios";
import React from "react";
import { useEffect, useRef, useState } from "react";
import { screenToWorld, worldToScreen } from "./Tools/misc";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import { toast, Bounce } from "react-toastify";

import { Widget } from "./Elements/Widget";

import loop, { drawBackground, updateLoopElements } from "./Tools/loop";
import { loadLayout, addElement, getElement, updateManagerElements, removeElement } from "./Tools/manager";
import { Text } from "./Elements/Text";
import { ImageElement } from "./Elements/Image";
import { BackIcon, BinIcon, EmbedIcon, EyeIcon, ForwardsIcon, GearIcon, InfoIcon, PenIcon, PlayIcon, PlusIcon, SaveIcon, TickIcon } from "../../../Styles/Svg";

import { DropdownMenu } from "../../../Components/DropdownMenu";
import { useParams, useSearchParams } from "react-router-dom";
import Modal from "../../../Components/Modal";
import InputStyle from "../Components/WidgetsEditor/Components/Styles/Input.module.css";
import CodeCopy from "../../../Components/CodeCopy";
import InputSwitch from "../Components/WidgetsEditor/InputSwitch";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { ButtonElement } from "./Elements/Button";
import { Container } from "./Elements/Container";

export var PLUGINS;

export default function Editor() {
  axios.defaults.withCredentials = true;
  var canvas = useRef(null);
  var backgroundCanvas = useRef(null);
  var [ctx, setCtx] = useState(null);

  var [elements, setElements] = useState([]);

  useEffect(() => {
    updateELements(elements);
  }, [elements]);

  var [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });
  var [contextMenu, setContextMenu] = useState(false);
  var [newElementContextMenu, setNewElementContextMenu] = useState(false);
  var [editElementContextMenu, setEditElementContextMenu] = useState(false);

  var [isLeftDown, setLeftDown] = useState(false);
  var [isMiddleDown, setMiddleDown] = useState(false);
  var [isRightDown, setRightDown] = useState(false);

  var [firstPos, setFirstPos] = useState({ x: 0, y: 0 });
  var [isMoving, setMoving] = useState(false);

  var [clickElement, setClickElement] = useState(null);
  var [selectedElement, setSelectedElement] = useState(null);
  function selectElement(element) {
    setPluginSettingsSeed(Math.random());
    setSettingsSeed(Math.random());

    var selection = false;

    if (selectedElement) {
      selectedElement.selected = false;
      selectedElement.deselect();
    }
    if (element) {
      element.selected = true;
      selection = true;
    }
    showSettings(selection);
    setSelectedElement(element);
  }
  var [resizeElement, setResizeElement] = useState(null);

  var radius = 9 * 9;
  var [isDragging, setDragging] = useState(false);
  var [isResizing, setResizing] = useState(false);
  var [resizeOrigin, setResizeOrigin] = useState(0);

  useEffect(() => {
    canvas.current.getContext("2d").zoom = 1;
    canvas.current.getContext("2d").pan = { x: 0, y: 0 };
    setCtx(canvas.current.getContext("2d"));

    canvas.current.addEventListener("mousewheel", handleScroll);
  }, []);

  // INIT

  var [isLoading, setLoading] = useState(true);
  var [previewActive, setPreviewActive] = useState(false);

  var [widget, setWidget] = useState(null);
  var [displayName, setDisplayName] = useState("Loading...");
  function changeDisplayName(name) {
    widget.displayName = name;
    setDisplayName(name);
  }
  var [editingDisplayName, setEditingDisplayName] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (!ctx) return;

    function adjustSizes() {
      if (previewActive) return;
      backgroundCanvas.current.width = canvas.current.clientWidth;
      backgroundCanvas.current.height = canvas.current.clientHeight;
      canvas.current.width = canvas.current.clientWidth;
      canvas.current.height = canvas.current.clientHeight;
    }
    adjustSizes();
    drawBackground(backgroundCanvas.current);
    loop(canvas.current, elements);

    window.addEventListener("resize", () => {
      adjustSizes();
      drawBackground(backgroundCanvas.current);
    });
    loadLayout(canvas, elements, setElements, setResizeElement, setResizeOrigin, openPluginMenu, setOpenPluginsModal);

    axios.get(`${process.env.REACT_APP_SERVER_URL}/plugins/data`).then((data) => {
      PLUGINS = data.data;
      axios.get(`${process.env.REACT_APP_SERVER_URL}/dashboard/widget?data=true&id=${searchParams.get("id")}`).then((res) => {
        if (res.data == null) return (window.location = "/dashboard/widgets");
        setWidget(res.data);
        setDisplayName(res.data.displayName);
        importWidget(res.data.data);
        setLoading(false);
      });
    });
  }, [ctx]);

  async function saveDataToast() {
    await toast.promise(saveData(), {
      pending: "Saving",
      success: "Widget Saved",
      error: "Error, please try again",
    });
  }

  async function saveData() {
    return new Promise((resolve, reject) => {
      try {
        axios({
          method: "PUT",
          data: {
            widgetId: widget.widgetId,
            data: exportWidget(),
            displayName: widget.displayName,
          },
          url: `${process.env.REACT_APP_SERVER_URL}/dashboard/editwidgetdata`,
        }).then((res) => {
          var success = res.data.message;
          if (success) resolve();
          else reject();
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  var [isOpenCodeModal, setOpenCodeModal] = useState(false);
  var [isOpenCloseModal, setOpenCloseModal] = useState(false);
  var [isOpenPluginsModal, setOpenPluginsModal] = useState(false);
  var [isOpenAddPluginFunctionModal, setOpenAddPluginFunctionModal] = useState(false);
  var [isOpenPluginMenuModal, setOpenPluginMenuModal] = useState(false);

  useEffect(() => {
    // Because it's opened from a click on canvas, so left downn is left on true
    setLeftDown(false);
    setMiddleDown(false);
  }, [isOpenPluginMenuModal, isOpenPluginsModal]);

  var [pluginMenuModalData, setPluginMenuModalData] = useState(null);
  var [filteredPluginFunctions, setFilteredPluginFunctions] = useState([]);

  function closeEditor() {
    setOpenCloseModal(true);
  }

  async function closeAndSave() {
    setOpenCloseModal(false);
    await saveDataToast();
    window.location = "/dashboard/widgets";
  }

  function closeWithoutSaving() {
    window.location = "/dashboard/widgets";
  }

  var [isOpenDeleteModal, setOpenDeleteModal] = useState(false);
  function deleteWidget() {
    setOpenDeleteModal(true);
  }
  function deleteWidgetConfirmed() {
    setOpenDeleteModal(false);
    axios({
      method: "DELETE",
      data: {
        widgetId: widget.widgetId,
      },
      url: `${process.env.REACT_APP_SERVER_URL}/dashboard/widget`,
    }).then(() => {
      window.location = "/dashboard/widgets";
    });
  }

  function addPlugin(id) {
    var widget = elements.filter((w) => w.type == "Widget")[0];
    var plugin = PLUGINS.filter((p) => p.id == id)[0];
    if (widget.data.plugins.filter((p) => p == id).length == 0) widget.data.plugins.push(plugin.id);
    setOpenPluginsModal(false);
  }

  function removePlugin(id) {
    setOpenPluginMenuModal(false);
    var widget = elements.filter((w) => w.type == "Widget")[0];
    widget.data.plugins = widget.data.plugins.filter((p) => p != id);

    // Remove functions of that plugin on all of the elements

    elements.forEach((element) => {
      for (var i = element.pluginfunctions.length - 1; i >= 0; i--) {
        var pluginfunction = element.pluginfunctions[i];
        if (pluginfunction.plugin == id) {
          var pluginLock = pluginfunction.lock;
          element.pluginfunctions.splice(i, 1);
            if(typeof pluginLock == "boolean") element.locked = false;
            else if(typeof pluginLock == "object") element.locked = element.locked.filter((l) => !pluginLock.includes(l));
          }
        }
    });
  }

  function openPluginMenu(id) {
    var plugin = PLUGINS.filter((p) => p.id == id)[0];
    setPluginMenuModalData(plugin);
    setOpenPluginMenuModal(true);
  }

  /* SETTINGS MENU */

  var editorSettings = useRef(null);
  var [settingsSeed, setSettingsSeed] = useState(Math.random());
  var [pluginSettingsSeed, setPluginSettingsSeed] = useState(Math.random());

  function showSettings(force) {
    if (typeof force == "boolean") editorSettings.current.classList.toggle("shown", force);
    else editorSettings.current.classList.toggle("shown");
  }

  function checkCondition(element, setting) {
    var { condition, preset } = setting;
    var regex = /\{[A-z.]{1,}\}/g;

    var found = condition.match(regex);
    if (found == null) return false;
    found.forEach((variable) => {
      var name = variable.substring(1, variable.length - 1);
      var value = getValue(element, name, preset.conditionDefault);

      condition = condition.replace(variable, value);
    });

    return eval(condition);
  }

  function checkPluginCondition(pluginfunction, parameter) {
    var { condition } = parameter;

    var regex = /\{[a-z_]{1,}\}/g;

    var found = condition.match(regex);
    if (found == null) return false;
    found.forEach((variable) => {
      var name = variable.substring(1, variable.length - 1);
      var { value } = pluginfunction.parameters.find((parameter) => parameter.id == name);

      condition = condition.replace(variable, value);
    });

    return eval(condition);
  }

  function getValue(element, setting, defaultValue) {
    let settingIterator = setting.split(".");
    while (element && settingIterator[0]) {
      element = element[settingIterator.shift()];
      if (element === null) element = undefined;
    }
    if (element == null) element = defaultValue ?? "";
    return element;
  }

  function setValue(element, setting, value) {
    var path = `element['${setting.path.split(".").join("']['")}']`;
    if (setting.path == "zIndex")
      setElements((elements) => {
        elements.sort((a, b) => (a.zIndex > b.zIndex ? 1 : -1));
        return elements;
      });
    switch (setting.type) {
      case "number":
      case "range":
        eval(path + " = parseInt(value)");
        break;
      default:
        eval(path + " = value");
        break;
    }
  }

  /*
  ███████╗██╗░░░██╗███████╗███╗░░██╗████████╗░██████╗
  ██╔════╝██║░░░██║██╔════╝████╗░██║╚══██╔══╝██╔════╝
  █████╗░░╚██╗░██╔╝█████╗░░██╔██╗██║░░░██║░░░╚█████╗░
  ██╔══╝░░░╚████╔╝░██╔══╝░░██║╚████║░░░██║░░░░╚═══██╗
  ███████╗░░╚██╔╝░░███████╗██║░╚███║░░░██║░░░██████╔╝
  ╚══════╝░░░╚═╝░░░╚══════╝╚═╝░░╚══╝░░░╚═╝░░░╚═════╝░*/

  function updateELements(elements) {
    setElements(elements);
    updateLoopElements(elements);
    updateManagerElements(elements);
  }

  function handleScroll(event) {
    event.preventDefault();
    var mutliplier = event.deltaY > 0 ? -0.05 : 0.05;

    var mousePos = canvas.current.getContext("2d").mousePos;
    if (!mousePos) return;
    var oldZoom = canvas.current.getContext("2d").zoom;

    var mouseBeforeZoom = screenToWorld(canvas.current.getContext("2d"), mousePos.x, mousePos.y);

    var newZoom = oldZoom + mutliplier;
    if (newZoom < 0.1) newZoom = 0.1;
    canvas.current.getContext("2d").zoom = newZoom;

    var mouseAfterZoom = screenToWorld(canvas.current.getContext("2d"), mousePos.x, mousePos.y);

    canvas.current.getContext("2d").pan.x += mouseAfterZoom.x - mouseBeforeZoom.x;
    canvas.current.getContext("2d").pan.y += mouseAfterZoom.y - mouseBeforeZoom.y;
  }

  function handleMouseDown(event) {
    event.preventDefault();
    if (event.button == 0) {
      setFirstPos({ x: event.offsetX, y: event.offsetY });
      setLeftDown(true);
      setClickElement(getElement(event.offsetX, event.offsetY));
    }
    if (event.button == 1) {
      setFirstPos({ x: event.offsetX, y: event.offsetY });
      setMiddleDown(true);
    }
    if (event.button == 2) {
      setRightDown(true);
    }
  }

  function handleMouseUp(event) {
    if (!isLeftDown && !isMiddleDown && !isRightDown) return;

    event.preventDefault();

    setContextMenu(false);
    setNewElementContextMenu(false);
    setEditElementContextMenu(false);

    if (event.button == 0) {
      setLeftDown(false);
      setClickElement(null);
      setResizeElement(null);

      setMoving(false);
      setDragging(false);
      setResizing(false);

      if (!isMoving && !isDragging) {
        if (clickElement) {
          if (clickElement == selectedElement) return selectedElement.doubleClick();
          selectElement(clickElement);
        } else {
          selectElement(null);
        }
      }
    }
    if (event.button == 1) {
      setMiddleDown(false);

      setMoving(false);
    }
    if (event.button == 2) {
      setRightDown(false);
      if (!canvas.current.getContext("2d").mousePos) return;
      var element = getElement(event.offsetX, event.offsetY);
      setContextMenuPosition({
        left: canvas.current.getContext("2d").mousePos.x,
        top: canvas.current.getContext("2d").mousePos.y,
      });
      if (element == null) {
        setContextMenu(true);
      } else {
        selectElement(element);
        setEditElementContextMenu(true);
      }
    }
  }

  function handleMouseMove(event) {
    event.preventDefault();

    var pos = { x: event.offsetX, y: event.offsetY };
    canvas.current.getContext("2d").mousePos = pos;

    if (isLeftDown || isMiddleDown) {
      var dx = firstPos.x - pos.x,
        dy = firstPos.y - pos.y,
        dist = dx * dx + dy * dy;

      let moving = false;

      if (dist >= radius) moving = true;

      var zoom = canvas.current.getContext("2d").zoom;
      if (moving) {
        if (resizeElement) {
          setResizing(true);

          switch (resizeOrigin) {
            case 0:
              selectedElement.width -= event.movementX / zoom;
              selectedElement.height -= event.movementY / zoom;
              selectedElement.x += event.movementX / zoom;
              selectedElement.y += event.movementY / zoom;
              break;
            case 1:
              selectedElement.width += event.movementX / zoom;
              selectedElement.height -= event.movementY / zoom;
              selectedElement.y += event.movementY / zoom;
              break;
            case 2:
              selectedElement.width -= event.movementX / zoom;
              selectedElement.height += event.movementY / zoom;
              selectedElement.x += event.movementX / zoom;
              break;
            case 3:
              selectedElement.width += event.movementX / zoom;
              selectedElement.height += event.movementY / zoom;
              break;
          }
          if (selectedElement.type == "Text") selectedElement.updateSize(null, selectedElement.height);
          if (selectedElement.sizeChange) selectedElement.sizeChange();
          if (selectedElement.width < 10) selectedElement.width = 10;
          if (selectedElement.height < 10) selectedElement.height = 10;
        } else if (clickElement) {
          if (!clickElement.isDraggable) return;
          setDragging(true);
          clickElement.x += event.movementX / zoom;
          clickElement.y += event.movementY / zoom;
        } else {
          setMoving(true);
          canvas.current.getContext("2d").pan.x += event.movementX / zoom;
          canvas.current.getContext("2d").pan.y += event.movementY / zoom;
        }
      }
    }
  }

  function getCursor() {
    if (isDragging) return "move";
    if (isMoving) return "grab";
    if (isResizing) {
      if ([0, 3].includes(resizeOrigin)) return "nwse-resize";
      return "nesw-resize";
    }
    return "default";
  }

  /*
      CONTEXT MENU
  */

  function addElementContextMenu() {
    setContextMenu(false);
    setEditElementContextMenu(false);
    setNewElementContextMenu(true);
  }

  function addPluginContextMenu() {
    setContextMenu(false);
    setOpenPluginsModal(true);
  }

  function addTextElement() {
    var pos = screenToWorld(ctx, contextMenuPosition.left, contextMenuPosition.top);
    addElement(
      new Text({
        ctx,
        x: pos.x,
        y: pos.y,
        zIndex: 1,
        isDraggable: true,
        data: {
          text: "Placeholder Text",
          font: {
            size: "15",
            family: "Arial",
            color: "black",
            transform: "none",
          },
        },
      })
    );
    setNewElementContextMenu(false);
  }

  function addButtonElement() {
    var { left, top } = contextMenuPosition;
    var pos = screenToWorld(ctx, left, top);

    addElement(
      new ButtonElement({
        ctx,
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 20,
        zIndex: 1,
        isDraggable: true,
        backgroundColor: "black",
        data: {
          text: "Button",
          font: {
            size: "15",
            family: "Arial",
            color: "white",
          },
        },
      })
    );

    setNewElementContextMenu(false);
  }

  function addContainerElement() {
    var { left, top } = contextMenuPosition;
    var pos = screenToWorld(ctx, left, top);
    addElement(
      new Container({
        ctx,
        x: pos.x,
        y: pos.y,
        data: {
          font: {
            size: "15",
            family: "Arial",
            color: "black",
            transform: "none",
          },
        },
        width: 100,
        height: 100,
        zIndex: 1,
        isDraggable: true,
        backgroundColor: "#FFB963",
      })
    );
    setNewElementContextMenu(false);
  }

  function addImageElement() {
    var { left, top } = contextMenuPosition;
    var pos = screenToWorld(ctx, left, top);
    addElement(
      new ImageElement({
        ctx,
        x: pos.x,
        y: pos.y,
        width: 100,
        height: 100,
        zIndex: 1,
        isDraggable: true,
        data: {
          url: `${process.env.REACT_APP_WEBSITE_URL}/missing-image.png`,
        },
      })
    );
    setNewElementContextMenu(false);
  }

  function deleteSelectedElement() {
    removeElement(selectedElement);
    setEditElementContextMenu(false);
  }

  function addLinkToSelectedElement() {
    selectedElement.addLink();
    setEditElementContextMenu(false);
  }

  function removeLinkFromSelectedElement() {
    selectedElement.removeLink();
    setEditElementContextMenu(false);
  }

  function addPluginFunctionToSelectedElementContextMenu() {
    let widgetElement = elements.filter((w) => w.type == "Widget")[0];
    var plugins = widgetElement.data.plugins;

    var availableFunctions = [];

    plugins.forEach((pluginid) => {
      var plugin = PLUGINS.filter((p) => p.id == pluginid)[0];
      if (!plugin) return;
      plugin.functions.forEach((pluginfunction) => {
        if (pluginfunction.elements == "*" || (pluginfunction.elements == "**" && selectedElement.type !== "Widget") || pluginfunction.elements.includes(selectedElement.type)) {
          availableFunctions.push(pluginfunction);
          availableFunctions[availableFunctions.length - 1].parameters?.forEach((param) => {
            param.value = param.preset.default;
          });
        }
      });
    });

    setFilteredPluginFunctions(availableFunctions);

    setOpenAddPluginFunctionModal(true);

    setEditElementContextMenu(false);
  }

  function checkLock(elementLock, settingsLock) {
    if (!elementLock) return false;
    if (typeof elementLock == "undefined" || elementLock == null) return false;
    if (typeof elementLock == "boolean" && elementLock) return true;
    var locked=  false;
    if (typeof elementLock == "object") {
      elementLock.forEach((lock) => {
        if (settingsLock.includes(lock)) locked = true;
      });
    }
    return locked;
  }

  function addPluginFunctionToSelectedElement(pluginfunction) {
    var pluginFunction = JSON.parse(JSON.stringify(pluginfunction));
    if (!selectedElement) return;

    if (checkLock(selectedElement.locked, pluginFunction.lock)) return setOpenAddPluginFunctionModal(false);

    var id = pluginFunction.id;
    if (selectedElement.pluginfunctions.filter((pf) => pf.id == id).length == 0) {
      selectedElement.pluginfunctions.push(pluginFunction);
      if (pluginFunction.lock) {
        if (typeof pluginFunction.lock == "boolean") selectedElement.locked = true;
        else {
          if (typeof selectedElement.locked == "boolean") selectedElement.locked = [];
          selectedElement.locked = selectedElement.locked.concat(pluginFunction.lock);
        }
      }
    }
    setOpenAddPluginFunctionModal(false);
  }

  function removePluginFunctionFromSelectedElement(pluginfunctionid) {
    if (!selectedElement) return;
    var temp = selectedElement;
    selectedElement.pluginfunctions = selectedElement.pluginfunctions.filter((pf) => pf.id != pluginfunctionid);

    if (!selectedElement.pluginfunctions.some((pf) => pf.lock)) selectedElement.locked = false;
    else if (selectedElement.pluginfunctions.some((pf) => typeof pf.lock == "boolean")) selectedElement.locked = true;
    else {
      var lockedPaths = [];
      selectedElement.pluginfunctions.forEach((pf) => {
        if (pf.lock) lockedPaths = lockedPaths.concat(pf.lock);
      });
      selectedElement.locked = lockedPaths;
    }

    // Refresh react component
    setSelectedElement(null);
    setTimeout(() => {
      setSelectedElement(temp);
    }, 100);
  }

  function setPluginParameter(pluginfunctionid, parameterid, value) {
    var pluginFunctions = selectedElement.pluginfunctions;
    var pfId = pluginFunctions.findIndex((pf) => pf.id == pluginfunctionid);
    var parameters = pluginFunctions[pfId].parameters;
    var pmId = parameters.findIndex((pm) => pm.id == parameterid);

    selectedElement.pluginfunctions[pfId].parameters[pmId].value = value;
  }

  /*  
  ███╗░░░███╗██╗░██████╗░█████╗░
  ████╗░████║██║██╔════╝██╔══██╗
  ██╔████╔██║██║╚█████╗░██║░░╚═╝
  ██║╚██╔╝██║██║░╚═══██╗██║░░██╗
  ██║░╚═╝░██║██║██████╔╝╚█████╔╝
  ╚═╝░░░░░╚═╝╚═╝╚═════╝░░╚════╝░*/

  function importPluginFunctions(pluginfunctions) {
    var updatedPluginFunctions = [];
    if (pluginfunctions == null || pluginfunctions.length == 0) return updatedPluginFunctions;

    pluginfunctions.forEach((pluginfunction) => {
      var pluginid = pluginfunction.plugin;
      var plugin = PLUGINS.filter((p) => p.id == pluginid)[0];
      if (!plugin) return;
      var PLUGINFUNCTION = JSON.parse(JSON.stringify(plugin.functions.filter((pf) => pf.id == pluginfunction.id)[0]));

      PLUGINFUNCTION.parameters?.forEach((parameter) => {
        var parameterid = parameter.id;
        parameter.value = pluginfunction.parameters.filter((par) => par.id == parameterid)[0]?.value || parameter.preset.default;
      });
      updatedPluginFunctions.push(PLUGINFUNCTION);
    });
    return updatedPluginFunctions;
  }

  function importWidget(data) {
    // TODO calculate x and y from half of width and height

    if (typeof data != "object") data = JSON.parse(data);

    var widget = data.filter((w) => w.type == "Widget")[0];

    var importedElements = [];
    data.forEach((element) => {
      switch (element.type) {
        case "Widget":
          importedElements.push(
            new Widget({
              ctx,
              backgroundColor: element.backgroundColor,
              x: element.x,
              y: element.y,
              width: element.width,
              height: element.height,
              zIndex: element.zIndex,
              isDraggable: false,
              data: element.data,
              pluginfunctions: importPluginFunctions(element.pluginfunctions),
            })
          );
          break;
        case "Text":
          importedElements.push(
            new Text({
              ctx,
              x: element.x + widget.x,
              y: element.y + widget.y,
              zIndex: element.zIndex,
              link: element.link,
              isDraggable: true,
              data: element.data,
              pluginfunctions: importPluginFunctions(element.pluginfunctions),
            })
          );
          break;
        case "Button":
          importedElements.push(
            new ButtonElement({
              ctx,
              x: element.x + widget.x,
              y: element.y + widget.y,
              width: element.width,
              height: element.height,
              zIndex: element.zIndex,
              link: element.link,
              isDraggable: true,
              data: element.data,
              backgroundColor: element.backgroundColor,
              pluginfunctions: importPluginFunctions(element.pluginfunctions),
            })
          );
          break;
        case "Container":
          importedElements.push(
            new Container({
              ctx,
              x: element.x + widget.x,
              y: element.y + widget.y,
              width: element.width,
              height: element.height,
              zIndex: element.zIndex,
              link: element.link,
              data: element.data,
              isDraggable: true,
              backgroundColor: element.backgroundColor,
              pluginfunctions: importPluginFunctions(element.pluginfunctions),
            })
          );
          break;
        case "Image":
          importedElements.push(
            new ImageElement({
              ctx,
              x: element.x + widget.x,
              y: element.y + widget.y,
              width: element.width,
              height: element.height,
              zIndex: element.zIndex,
              link: element.link,
              isDraggable: true,
              data: element.data,
              pluginfunctions: importPluginFunctions(element.pluginfunctions),
            })
          );
          break;
      }
    });

    importedElements = importedElements.sort((a, b) => a.zIndex - b.zIndex);

    updateELements(importedElements);
  }

  function exportWidget() {
    var data = JSON.parse(JSON.stringify(elements));

    var widget = data.filter((w) => w.type == "Widget")[0];

    data.forEach((element) => {
      delete element.ctx;
      delete element.settings;
      delete element.isDraggable;
      delete element.selected;
      delete element.sizeText;
      delete element.url;
      delete element.locked;
      delete element.imagedata;
      if (element.type == "Widget") return;

      // Offset from 0,0 from widget frame;
      element.x = element.x - widget.x;
      element.y = element.y - widget.y;
    });

    return data;
  }

  var defaultSettingsDropdown = [
    {
      type: "link",
      text: "Widget Size",
      onClick: function () {
        setSettingsDropdown(sizeSettingsDropdown);
      },
    },
    {
      type: "link",
      text: "Delete",
      onClick: function () {
        deleteWidget();
      },
    },
  ];

  function updateSize(width, height) {
    var widget = elements.filter((element) => element.type == "Widget")[0];
    widget.width = width;
    widget.height = height;
    widget.sizeText = `${widget.width}px x ${widget.height}px`;
  }
  var sizeSettingsDropdown = [
    {
      type: "text",
      text: "Standard Sizes",
    },
    {
      type: "separator",
    },
    {
      type: "link",
      text: "400 x 225",
      onClick: function () {
        updateSize(400, 225);
      },
    },
    {
      type: "link",
      text: "300 x 300",
      onClick: function () {
        updateSize(300, 300);
      },
    },
    {
      type: "link",
      text: "300 x 200",
      onClick: function () {
        updateSize(300, 200);
      },
    },
  ];

  var [SettingsDropdown, setSettingsDropdown] = useState(defaultSettingsDropdown);
  function setDefaultDropdown() {
    setSettingsDropdown(defaultSettingsDropdown);
  }

  return (
    <div className="editor-workspace">
      <Modal width={"500px"} height="auto" className="addplugins-modal" display={isOpenPluginsModal} setDisplay={setOpenPluginsModal}>
        <h3 style={{ marginBottom: "10px" }}>Install Plugin</h3>
        <div
          className="buttons"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: "1rem",
            width: "100%",
            margin: "2rem 0 ",
          }}
        >
          {PLUGINS &&
            PLUGINS.map((plugin) => {
              return (
                <div
                  style={{
                    cursor: "pointer",
                    textAlign: "center",
                    width: "100px",
                  }}
                  key={plugin.id}
                  onClick={() => {
                    addPlugin(plugin.id);
                  }}
                >
                  <img
                    style={{
                      width: "100px",
                      borderRadius: "4px",
                      marginBottom: "7px",
                    }}
                    src={`${process.env.REACT_APP_SERVER_URL}/assets/library/plugin/${plugin.id}`}
                    alt="Plugin Thumbnail"
                  />
                  <p>{plugin.name}</p>
                </div>
              );
            })}
        </div>
        <button className="btn" onClick={() => setOpenPluginsModal(false)}>
          Cancel
        </button>
      </Modal>

      <Modal height="auto" className="pluginfunctions-modal" display={isOpenAddPluginFunctionModal} setDisplay={setOpenAddPluginFunctionModal}>
        <h3 style={{ marginBottom: "10px", marginLeft: "auto" }}>Add Plugin Function</h3>
        <button
          className="btn"
          onClick={() => {
            setOpenAddPluginFunctionModal(false);
            setOpenPluginsModal(true);
          }}
        >
          Install more plugins
        </button>
        <div
          className="buttons"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            margin: "2rem 0",
          }}
        >
          {filteredPluginFunctions.map((pluginfunction) => {
            return (
              <div key={pluginfunction.name} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <p
                  style={{
                    cursor: checkLock(selectedElement?.locked, pluginfunction.lock) ? "not-allowed" : "pointer",
                    color: checkLock(selectedElement?.locked, pluginfunction.lock) ? "#888" : "#fff",
                  }}
                  onClick={() => {
                    if (checkLock(selectedElement?.locked, pluginfunction.lock)) return;
                    addPluginFunctionToSelectedElement(pluginfunction);
                  }}
                >
                  {pluginfunction.name}
                </p>
                <span
                  style={{
                    cursor: "pointer",
                    width: "16px",
                    height: "16px",
                  }}
                  onClick={() => {
                    setOpenAddPluginFunctionModal(false);
                    openPluginMenu(pluginfunction.plugin);
                  }}
                >
                  <InfoIcon />
                </span>
              </div>
            );
          })}
        </div>
        <button className="btn" onClick={() => setOpenAddPluginFunctionModal(false)}>
          Cancel
        </button>
      </Modal>

      <Modal height="auto" width={"80%"} maxWidth="80%" className="plugininfo-modal" display={isOpenPluginMenuModal} setDisplay={setOpenPluginMenuModal}>
        {pluginMenuModalData && (
          <>
            <div
              style={{
                display: "flex",
                gap: "10px",
                alignItems: "baseline",
                width: "100%",
                justifyContent: "center",
                margin: "0 1rem",
              }}
            >
              <h2 style={{ marginBottom: "10px", marginLeft: "auto" }}>{pluginMenuModalData.name}</h2>
              <span
                style={{
                  display: "block",
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
                onClick={() => {
                  removePlugin(pluginMenuModalData.id);
                }}
              >
                <BinIcon />
              </span>
            </div>
            <div
              style={{
                margin: "1rem",
                maxHeight: "50vh",
                overflowY: "auto",
                width: "100%",
              }}
            >
              <p>{pluginMenuModalData.description}</p>
              {pluginMenuModalData.functions.map((pluginfunction) => {
                return (
                  <div
                    style={{
                      marginTop: "1rem",
                    }}
                    key={pluginfunction.id}
                  >
                    <span
                      style={{
                        display: "flex",
                        gap: ".5rem",
                      }}
                    >
                      <h3>{pluginfunction.name}</h3>
                      <div className="element-tags">
                        {pluginfunction.elements == "*" && <span className="element-tag">All Elements</span>}
                        {typeof pluginfunction.elements == "object" &&
                          pluginfunction.elements.map((tag) => {
                            return (
                              <span key={Math.random()} className="element-tag">
                                {tag}
                              </span>
                            );
                          })}
                      </div>
                    </span>

                    <p>{pluginfunction.description ?? "Undocumented"}</p>

                    {pluginfunction.parameters &&
                      pluginfunction.parameters.map((parameter) => {
                        return (
                          <div style={{ marginTop: ".7rem" }} key={parameter.id}>
                            <span
                              style={{
                                display: "flex",
                                gap: ".5rem",
                              }}
                            >
                              <h4>{parameter.title}</h4>
                              <span className="element-tag gray">{parameter.type}</span>
                            </span>
                            <p style={{ whiteSpace: "pre-wrap" }}>{parameter.description ?? "Undocumented"}</p>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          </>
        )}
        <button
          className="btn"
          onClick={() => {
            setOpenPluginMenuModal(false);
          }}
        >
          Close
        </button>
      </Modal>

      <Modal height="auto" className="close-modal" display={isOpenCloseModal} setDisplay={setOpenCloseModal}>
        <h2 style={{ marginBottom: "10px" }}>Are You sure?</h2>
        <div
          className="buttons"
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <button style={{ fontSize: "15px", whiteSpace: "nowrap" }} className="btn" onClick={() => closeWithoutSaving()}>
            Discard Changes
          </button>
          <button style={{ fontSize: "15px", whiteSpace: "nowrap" }} className="btn" onClick={() => closeAndSave()}>
            Save & Close
          </button>
          <button style={{ fontSize: "15px", whiteSpace: "nowrap" }} className="btn" onClick={() => setOpenCloseModal(false)}>
            Cancel
          </button>
        </div>
      </Modal>

      <Modal height="auto" className="delete-modal" display={isOpenDeleteModal} setDisplay={setOpenDeleteModal}>
        <h2 style={{ marginBottom: "10px" }}>Are You sure?</h2>
        <div
          className="buttons"
          style={{
            display: "flex",
            gap: "1rem",
          }}
        >
          <button className="btn" onClick={() => deleteWidgetConfirmed()}>
            Delete
          </button>
          <button className="btn" onClick={() => setOpenDeleteModal(false)}>
            Keep
          </button>
        </div>
      </Modal>

      <Modal height="auto" width="80%" className={"code-modal"} display={isOpenCodeModal}>
        {widget && <CodeCopy code={`<div class="widgetsgarden" widgetId="${widget.widgetId}"></div>`} />}
        <button className="btn" onClick={() => setOpenCodeModal(false)}>
          Close
        </button>
      </Modal>

      <header className="navigation">
        <div onClick={closeEditor} style={{ cursor: "pointer" }}>
          <BackIcon />
        </div>

        <div className="title">
          {editingDisplayName ? (
            <>
              <input name="widget-name" className={InputStyle.Input} value={displayName} onChange={(e) => changeDisplayName(e.target.value)} />
              <div
                className="edit"
                onClick={() => {
                  setEditingDisplayName(false);
                }}
              >
                <TickIcon />
              </div>
            </>
          ) : (
            <>
              <h2>{displayName}</h2>
              <div
                style={{
                  visibility: previewActive ? "hidden" : "visible",
                  display: "block",
                  height: "2rem",
                  width: "2rem",
                  cursor: "pointer",
                }}
                className="edit"
                onClick={() => {
                  setEditingDisplayName(true);
                }}
              >
                <PenIcon />
              </div>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: "1rem", marginLeft: "auto", marginRight: "2rem" }}>
          <span
            style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}
            onClick={() => {
              setPreviewActive((last) => {
                return !last;
              });
            }}
          >
            {previewActive && <PenIcon />}
            {!previewActive && <PlayIcon />}
          </span>
          {!isLoading && !previewActive && (
            <DropdownMenu onToggle={setDefaultDropdown} options={SettingsDropdown}>
              <span style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}>
                <GearIcon />
              </span>
            </DropdownMenu>
          )}
          {!isLoading && !previewActive && (
            <span
              style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}
              onClick={function () {
                saveDataToast();
              }}
            >
              <SaveIcon />
            </span>
          )}
          <span
            style={{ display: "block", height: "2rem", width: "2rem", cursor: "pointer" }}
            onClick={function () {
              setOpenCodeModal(true);
            }}
          >
            <EmbedIcon />
          </span>
        </div>
      </header>
      {isLoading && <div className="center">Loading...</div>}
      {previewActive && (
        <div className="editor-preview">
          <iframe style={{ width: "100%", height: "100%" }} src={`${process.env.REACT_APP_WEBSITE_URL}/preview/${searchParams.get("id")}`} frameBorder="0"></iframe>
        </div>
      )}
      <div
        className="canvas-wrapper"
        style={{
          visibility: isLoading || previewActive ? "hidden" : "visible",
        }}
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        <canvas className="canvas-renderer" ref={backgroundCanvas}></canvas>
        <canvas
          className="canvas-renderer"
          onMouseUp={(e) => {
            handleMouseUp(e.nativeEvent);
          }}
          onMouseDown={(e) => {
            handleMouseDown(e.nativeEvent);
          }}
          onMouseMove={(e) => {
            handleMouseMove(e.nativeEvent);
          }}
          ref={canvas}
          style={{
            cursor: getCursor(),
          }}
        />
        <div
          className="context-menu"
          style={{
            display: contextMenu ? "flex" : "none",
            top: contextMenuPosition.top + "px",
            left: contextMenuPosition.left + "px",
          }}
        >
          <p onClick={() => addElementContextMenu()}>Add Element</p>
          <p onClick={() => addPluginContextMenu()}>Add Plugin</p>
        </div>
        <div
          className="context-menu"
          style={{
            display: newElementContextMenu ? "flex" : "none",
            top: contextMenuPosition.top + "px",
            left: contextMenuPosition.left + "px",
          }}
        >
          <p onClick={() => addContainerElement()}>Container</p>
          <p onClick={() => addImageElement()}>Image</p>
          <p onClick={() => addTextElement()}>Text</p>
          <p onClick={() => addButtonElement()}>Button</p>
        </div>
        <div
          className="context-menu"
          style={{
            display: editElementContextMenu ? "flex" : "none",
            top: contextMenuPosition.top + "px",
            left: contextMenuPosition.left + "px",
          }}
        >
          {selectedElement?.type != "Widget" && (
            <>
              <p onClick={() => deleteSelectedElement()}>Delete</p>
              {selectedElement?.hasLink() ? <p onClick={() => removeLinkFromSelectedElement()}>Remove Link</p> : <p onClick={() => addLinkToSelectedElement()}>Add Link</p>}
            </>
          )}
          {selectedElement?.type == "Widget" && (
            <>
              <p onClick={() => addElementContextMenu()}>Add Element</p>
            </>
          )}
          <p onClick={() => addPluginFunctionToSelectedElementContextMenu()}>Add Plugin Function</p>
        </div>
        <div ref={editorSettings} className="editor-settings">
          <div className="hidden-settings">
            <span className="icon" onClick={showSettings}>
              <BackIcon />
            </span>
          </div>
          <div className="shown-settings">
            <span className="icon" onClick={showSettings}>
              <ForwardsIcon />
            </span>
            {selectedElement && (
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
                <div key={settingsSeed} className="settings-list">
                  {selectedElement.settings.map((setting) => {
                    if (setting.condition) if (!checkCondition(selectedElement, setting)) return null;

                    return (
                      <span className="setting-wrapper" key={Math.random()}>
                        <p>{setting.title}</p>
                        {typeof selectedElement.locked == "object" && selectedElement.locked.includes(setting.path) ? (
                          "Managed by Plugin"
                        ) : (
                          <InputSwitch
                            name={setting.id}
                            type={setting.type}
                            value={getValue(selectedElement, setting.path, setting.preset?.default)}
                            setValue={(value) => {
                              setValue(selectedElement, setting, value);
                              if (setting.refresh) setSettingsSeed(Math.random());
                            }}
                            preset={setting.preset}
                          />
                        )}
                      </span>
                    );
                  })}
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <h2>Functions</h2>

                    <span
                      style={{
                        display: "block",
                        width: "16px",
                        height: "16px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        addPluginFunctionToSelectedElementContextMenu();
                      }}
                    >
                      <PlusIcon />
                    </span>
                  </span>
                </div>

                <div className="settings-list" key={pluginSettingsSeed}>
                  {selectedElement.pluginfunctions.map((pluginfunction) => {
                    return (
                      <React.Fragment key={pluginfunction.id}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <h3
                            style={{
                              marginBottom: ".5rem",
                            }}
                          >
                            {pluginfunction.name}
                          </h3>
                          <span
                            style={{
                              display: "block",
                              width: "16px",
                              height: "16px",
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              removePluginFunctionFromSelectedElement(pluginfunction.id);
                            }}
                          >
                            <BinIcon />
                          </span>
                        </div>
                        {pluginfunction.parameters &&
                          pluginfunction.parameters.map((parameter) => {
                            if (parameter.condition) if (!checkPluginCondition(pluginfunction, parameter)) return null;
                            return (
                              <span className="setting-wrapper" key={parameter.id}>
                                <p>{parameter.title}</p>
                                <InputSwitch
                                  name={parameter.id}
                                  type={parameter.type}
                                  value={parameter.value}
                                  setValue={(value) => {
                                    setPluginParameter(pluginfunction.id, parameter.id, value);
                                    if (parameter.refresh) setSettingsSeed(Math.random());
                                  }}
                                  preset={parameter.preset}
                                />
                              </span>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </div>
              </LocalizationProvider>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
