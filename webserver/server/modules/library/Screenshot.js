//http://localhost:4100/api/widget?widgetId=wc0aa2ec785792672&previewSecret=1d2652cde0cbd5

import { getWidgetPreviewSecret } from "../../routers/widgets.js";
import puppeteer from "puppeteer";
import fs from "fs";

export function hasScreenshot(widgetId) {
  if (fs.existsSync(`./server/assets/screenshots/${widgetId}.png`)) {
    return fs.statSync(`./server/assets/screenshots/${widgetId}.png`).mtime;
  } else return 0;
}

export async function takeLibraryScreenshot(widgetId) {
    return new Promise(async (resolve) => {
      // no sandbox for linux
      try{
        const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
        try{
          const page = await browser.newPage();
          await page.goto(`${process.env.API_URL}/widget?widgetId=${widgetId}&previewSecret=${getWidgetPreviewSecret()}`, {waitUntil: 'load'});
          // listen to width and height from console
          var Matcher = new RegExp("Loaded (?<width>.+)x(?<height>.+)", "g");
          page.on("console", (msg) => {
            if (msg.text().includes("Loaded")) {
              var match = Matcher.exec(msg.text());
              var width = parseInt(match.groups.width);
              var height = parseInt(match.groups.height);
              setTimeout(async () => {
                await page.screenshot({
                  path: `./server/assets/screenshots/${widgetId}.png`,
                  clip: {
                    x: 0,
                    y: 0,
                    width,
                    height,
                  },
                });
                await browser.close();
                resolve();
              }, 5000);
            }
          });
        }catch(e){
          browser.close();
          console.log("Error Taking Screenshot: ", e.message);
          resolve();
        }
      }catch(e){
        console.log("Error Starting browser: ", e.message);
        resolve();
      }
    });
}