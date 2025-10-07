#!/usr/bin/env node
const fs = require("fs");
const { program } = require("commander");
const path = require("path");

// ---- Парсинг аргументів ----
program
  .requiredOption("-i, --input <file>", "input JSON file")
  .option("-o, --output <file>", "output file")
  .option("-d, --display", "display result in console")
  .option("-c, --cylinders", "show cylinders")
  .option("-m, --mpg <number>", "filter cars with mpg lower than given value", parseFloat);

program.parse(process.argv);

const options = program.opts();

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
 
let resultData = data;
 
if (options.mpg !== undefined && !isNaN(options.mpg)) {
  resultData = resultData.filter(item => Number(item.mpg) < options.mpg);
}


let output = resultData
  .map(item => {
    const parts = [item.model];
    if (options.cylinders) parts.push(item.cyl);
    if (item.mpg !== undefined) parts.push(item.mpg);
    return parts.join(" ");
  })
  .join("\n");
 
if (options.output) {
  const outputPath = path.resolve(options.output);
  fs.writeFileSync(outputPath, output, "utf8");
}

if (options.display) {
  console.log(output);
}
