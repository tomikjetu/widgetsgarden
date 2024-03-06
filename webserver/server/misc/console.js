import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import formatDate from "./formatDate.js";

const logPath = path.join(__dirname, "..", "..", `/logs/logs-${Date.now()}.log`);
const log_file = fs.createWriteStream(logPath, { flags: 'w' });
const log_stdout = process.stdout;


console.log = function (...text) {
  text.map(t => t?.toString().replace(/(\r\n|\n|\r)/gm, "") || "undefined");
  text = text.join(" ");
  var output = `[${formatDate(new Date())}] ${text}`;
  log_file.write(output + '\n');
  log_stdout.write(output + '\n');
};