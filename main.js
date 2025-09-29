#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

// ---- Парсинг аргументів ----
function parseArgs(args) {
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "-i":
      case "--input":
        parsed.input = args[i + 1];
        i++;
        break;
      case "-o":
      case "--output":
        parsed.output = args[i + 1];
        i++;
        break;
      case "-d":
      case "--display":
        parsed.display = true;
        break;
      case "-c":
      case "--cylinders":
        parsed.cylinders = true;
        break;
      case "-m":
      case "--mpg":
        parsed.mpg = parseFloat(args[i + 1]);
        i++;
        break;
    }
  }
  return parsed;
}

const options = parseArgs(process.argv.slice(2));

// ---- Перевірки ----
if (!options.input) {
  console.error("Please, specify input file");
  process.exit(1);
}

const inputPath = path.resolve(options.input);

if (!fs.existsSync(inputPath)) {
  console.error("Cannot find input file");
  process.exit(1);
}

// ---- Читання JSON або NDJSON ----
let data;
try {
  const raw = fs.readFileSync(inputPath, "utf8").trim();
  if (raw.startsWith("[")) {
    data = JSON.parse(raw);
  } else {
    data = raw.split("\n").map(line => JSON.parse(line));
  }
} catch (err) {
  console.error("Invalid JSON format");
  process.exit(1);
}

// ---- Обробка даних ----
let resultData = data;

// фільтрація по mpg
if (options.mpg !== undefined && !isNaN(options.mpg)) {
  resultData = resultData.filter(item => Number(item.mpg) < options.mpg);
}

// формування текстового виводу
let output = resultData
  .map(item => {
    const parts = [item.model];
    if (options.cylinders) parts.push(item.cyl);
    if (item.mpg !== undefined) parts.push(item.mpg);
    return parts.join(" ");
  })
  .join("\n");

// ---- Вивід ----
if (options.output) {
  const outputPath = path.resolve(options.output);
  fs.writeFileSync(outputPath, output, "utf8");
}

if (options.display) {
  console.log(output);
}
