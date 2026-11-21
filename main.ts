// gta6-meme-x-01 round-2 entry for @fahimasl
// Validates the X post pointer and hands it to the make.fun gate.
//
// The meme is a fake hotel folio from the LEONIDA PALMS HOTEL:
// one night in 2013 that somehow lasted 4,818 nights while
// waiting for GTA 6 to drop. The folio joke lands because every
// line item is a real wait cost — minibar patience, a LONGEST
// STAY EVER stamp, and a $2,026 total for the release year.

import { readFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const EXPECTED_STATUS_ID = "2123969690787807379";
const MEME_CONCEPT = "LEONIDA PALMS HOTEL — GUEST FOLIO";
const X_POST_PATTERN = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/(\d+)$/;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function resolveDirs(): { botDir: string; outputDir: string } {
  const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
  const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  return { botDir, outputDir };
}

function loadPost(botDir: string): { raw: string; url: string } {
  const postPath = join(botDir, "POST.json");
  let raw: string;
  try {
    raw = readFileSync(postPath, "utf8");
  } catch {
    fail(`could not read POST.json at ${postPath}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw!);
  } catch {
    fail("POST.json is not valid JSON");
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !("url" in parsed) ||
    typeof (parsed as { url: unknown }).url !== "string"
  ) {
    fail("POST.json must be an object with a string 'url' field");
  }

  return { raw: raw!, url: (parsed as { url: string }).url };
}

function validateUrl(url: string): void {
  const match = X_POST_PATTERN.exec(url);
  if (!match) {
    fail(`url "${url}" is not an X post address (expected https://x.com/<handle>/status/<digits>)`);
  }
  const statusId = match[1];
  if (statusId !== EXPECTED_STATUS_ID) {
    fail(`unexpected status id ${statusId} — this entry must point at status ${EXPECTED_STATUS_ID}`);
  }
}

function main(): void {
  const { botDir, outputDir } = resolveDirs();
  const { url } = loadPost(botDir);

  validateUrl(url);

  mkdirSync(outputDir, { recursive: true });
  copyFileSync(join(botDir, "POST.json"), join(outputDir, "POST.json"));

  console.log(`ok: ${url} — ${MEME_CONCEPT} — POST.json copied to ${outputDir}`);
}

main();
