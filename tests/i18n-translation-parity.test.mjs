import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const enPath = path.join(ROOT, "messages", "en.json");
const arPath = path.join(ROOT, "messages", "ar.json");

function flattenMessages(obj, prefix = "") {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flattenMessages(value, fullKey));
    } else {
      result[fullKey] = value;
    }
  }
  return result;
}

function extractPlaceholders(str) {
  if (typeof str !== "string") return [];
  const matches = [...str.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
  return [...new Set(matches)].sort();
}

test("messages/en.json and messages/ar.json maintain 100% recursive key parity and non-empty strings", () => {
  const enRaw = JSON.parse(fs.readFileSync(enPath, "utf8"));
  const arRaw = JSON.parse(fs.readFileSync(arPath, "utf8"));

  const enFlat = flattenMessages(enRaw);
  const arFlat = flattenMessages(arRaw);

  const enKeys = Object.keys(enFlat).sort();
  const arKeys = Object.keys(arFlat).sort();

  const missingInAr = enKeys.filter((k) => !(k in arFlat));
  const missingInEn = arKeys.filter((k) => !(k in enFlat));

  assert.deepEqual(
    missingInAr,
    [],
    `Keys present in en.json but missing in ar.json: ${missingInAr.join(", ")}`
  );
  assert.deepEqual(
    missingInEn,
    [],
    `Keys present in ar.json but missing in en.json: ${missingInEn.join(", ")}`
  );

  for (const key of enKeys) {
    assert.equal(typeof enFlat[key], "string", `en.json key "${key}" must be a string`);
    assert.equal(typeof arFlat[key], "string", `ar.json key "${key}" must be a string`);
    assert.ok(enFlat[key].trim().length > 0, `en.json key "${key}" must not be empty`);
    assert.ok(arFlat[key].trim().length > 0, `ar.json key "${key}" must not be empty`);
  }
});

test("messages/en.json and messages/ar.json preserve identical interpolation placeholders {token}", () => {
  const enFlat = flattenMessages(JSON.parse(fs.readFileSync(enPath, "utf8")));
  const arFlat = flattenMessages(JSON.parse(fs.readFileSync(arPath, "utf8")));

  for (const key of Object.keys(enFlat)) {
    const enTokens = extractPlaceholders(enFlat[key]);
    const arTokens = extractPlaceholders(arFlat[key]);
    assert.deepEqual(
      arTokens,
      enTokens,
      `Placeholder mismatch at key "${key}": EN has {${enTokens.join(", ")}} vs AR {${arTokens.join(", ")}}`
    );
  }
});

test("messages/ar.json respects brand casing (never lowercase 'yaspro')", () => {
  const arFlat = flattenMessages(JSON.parse(fs.readFileSync(arPath, "utf8")));
  for (const [key, val] of Object.entries(arFlat)) {
    assert.doesNotMatch(
      String(val),
      /\byaspro\b/,
      `ar.json key "${key}" contains lowercase 'yaspro': "${val}"`
    );
  }
});

test("server data mappers preserve Arabic columns from PostgreSQL records", () => {
  const homePage = fs.readFileSync(path.join(ROOT, "src/app/(public)/page.tsx"), "utf8");
  assert.match(homePage, /arabicDescription:\s*p\.arabicDescription/);
  assert.match(homePage, /arabicRole:\s*inf\.arabicRole/);
  assert.match(homePage, /arabicBio:\s*inf\.arabicBio/);

  const projectsPage = fs.readFileSync(
    path.join(ROOT, "src/app/(public)/projects/page.tsx"),
    "utf8"
  );
  assert.match(projectsPage, /arabicDescription:\s*p\.arabicDescription/);

  const influencersPage = fs.readFileSync(
    path.join(ROOT, "src/app/(public)/influencers/page.tsx"),
    "utf8"
  );
  assert.match(influencersPage, /arabicRole:\s*inf\.arabicRole/);
  assert.match(influencersPage, /arabicBio:\s*inf\.arabicBio/);

  const cachedQueries = fs.readFileSync(
    path.join(ROOT, "src/lib/cached-queries.ts"),
    "utf8"
  );
  assert.match(cachedQueries, /arabicDescription:\s*record\.arabicDescription/);
  assert.match(cachedQueries, /arabicRole:\s*record\.arabicRole/);
  assert.match(cachedQueries, /arabicBio:\s*record\.arabicBio/);

  const studioBookingPage = fs.readFileSync(
    path.join(ROOT, "src/app/(public)/studio-booking/page.tsx"),
    "utf8"
  );
  assert.match(studioBookingPage, /arabicName:\s*studio\.arabicName/);
  assert.match(studioBookingPage, /arabicDescription:\s*studio\.arabicDescription/);

  const schemaFile = fs.readFileSync(path.join(ROOT, "src/db/schema.ts"), "utf8");
  assert.match(schemaFile, /arabicBadge:\s*text\("arabic_badge"\)/);
  assert.match(schemaFile, /arabicAmenities:\s*jsonb\("arabic_amenities"\)/);
  assert.match(schemaFile, /arabicSpecs:\s*jsonb\("arabic_specs"\)/);
  assert.match(schemaFile, /arabicDeliverables:\s*jsonb\("arabic_deliverables"\)/);
  assert.match(schemaFile, /arabicTechStack:\s*jsonb\("arabic_tech_stack"\)/);
  assert.match(schemaFile, /arabicCollaborations:\s*jsonb\("arabic_collaborations"\)/);
  assert.match(schemaFile, /arabicSignatureProductions:\s*jsonb\("arabic_signature_productions"\)/);
});

