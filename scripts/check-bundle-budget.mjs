#!/usr/bin/env node
/**
 * scripts/check-bundle-budget.mjs
 *
 * Checks that the initial-entry JavaScript does not exceed the budget.
 * Lazy chunks (firebase/ai, route pages) are excluded from the budget.
 * Fails with exit code 1 if over budget, which blocks CI and git commit checks.
 *
 * Budget: 650 kB raw (≈ 180 kB gzip) for the initial entry bundle.
 * This covers: react, react-dom, react-router-dom, firebase/app,
 * firebase/auth, firebase/firestore, and the application index chunk.
 */

import { readdirSync, statSync, readFileSync } from "fs";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DIST = resolve(__dirname, "../dist/assets");

// Budget in bytes (raw, not gzip)
const INITIAL_BUDGET_BYTES = 650 * 1024; // 650 kB

// Read the Vite manifest to determine initial chunks
const manifestPath = resolve(__dirname, "../dist/.vite/manifest.json");
let initialFiles = new Set();

try {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const entry of Object.values(manifest)) {
    if (entry.isEntry) {
      if (entry.file) initialFiles.add(entry.file.replace("assets/", ""));
      for (const imp of entry.imports ?? []) {
        const dep = manifest[imp];
        if (dep?.file) initialFiles.add(dep.file.replace("assets/", ""));
      }
    }
  }
} catch {
  // Manifest not found — fall back to heuristic: any file matching index-*.js
  console.warn("⚠ Vite manifest not found; using heuristic to find entry chunks.");
  for (const file of readdirSync(DIST)) {
    if (file.match(/^index-[^.]+\.js$/) || file.match(/^vendor-[^.]+\.js$/)) {
      initialFiles.add(file);
    }
  }
}

// Exclude known lazy chunks
const LAZY_PATTERNS = [/firebase-/, /createAiRepository/, /page-/, /layout-/, /recommendations/, /ledger/, /AskPrithvi/];

let totalInitialBytes = 0;
const measured = [];

for (const file of initialFiles) {
  if (LAZY_PATTERNS.some((p) => p.test(file))) continue;
  try {
    const size = statSync(join(DIST, file)).size;
    totalInitialBytes += size;
    measured.push({ file, size });
  } catch {
    // file may not exist
  }
}

measured.sort((a, b) => b.size - a.size);
console.log("\n📦 Initial bundle files:");
for (const { file, size } of measured) {
  const kb = (size / 1024).toFixed(1);
  console.log(`  ${kb.padStart(7)} kB  ${file}`);
}

const totalKb = (totalInitialBytes / 1024).toFixed(1);
const budgetKb = (INITIAL_BUDGET_BYTES / 1024).toFixed(0);
const over = totalInitialBytes > INITIAL_BUDGET_BYTES;

console.log(`\nTotal initial JS: ${totalKb} kB  (budget: ${budgetKb} kB)`);

if (over) {
  console.error(`\n❌ BUNDLE BUDGET EXCEEDED: ${totalKb} kB > ${budgetKb} kB`);
  process.exit(1);
} else {
  console.log(`✅ Bundle within budget.`);
}
