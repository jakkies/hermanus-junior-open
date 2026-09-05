import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "dist");
const FILES = ["index.html", "favicon.svg", "manifest.webmanifest"];
const DIRECTORIES = [
  "admin",
  "assets",
  "court1",
  "court2",
  "court3",
  "court4",
  "css",
  "data",
  "js",
  "schedule",
  "standings"
];

await fs.rm(OUTPUT_DIR, { recursive: true, force: true });
await fs.mkdir(OUTPUT_DIR, { recursive: true });

await Promise.all([
  ...FILES.map(file => fs.copyFile(path.join(PROJECT_ROOT, file), path.join(OUTPUT_DIR, file))),
  ...DIRECTORIES.map(directory => fs.cp(
    path.join(PROJECT_ROOT, directory),
    path.join(OUTPUT_DIR, directory),
    { recursive: true }
  ))
]);

console.log(`Built ${OUTPUT_DIR}`);
