/**
 * MOCK DATA ONLY — not Excalidraw production analytics.
 *
 * Replace this module with a real analytics/API client when export tracking exists.
 * Expected future shape: GET /analytics/exports?from&to&format&method&attribution
 * returning aggregated rows { date, format, method, attribution, count, clicks }.
 */

export const FORMATS = ["PNG", "SVG", "PDF", "PPTX"];
export const METHODS = ["Download", "Share", "Embed"];
export const ATTRIBUTION_STATUSES = ["All", "Attributed", "Unattributed"];

export const DATE_PRESETS = [
  { id: "all", label: "All dates (Sep 14–20)", from: "2026-09-14", to: "2026-09-20" },
  { id: "early", label: "Sep 14–16", from: "2026-09-14", to: "2026-09-16" },
  { id: "mid", label: "Sep 17–18", from: "2026-09-17", to: "2026-09-18" },
  { id: "recent", label: "Sep 19–20", from: "2026-09-19", to: "2026-09-20" }
];

export const MOCK_DATA_NOTICE = "All values shown are mock data for product exploration.";

/**
 * Daily attributed / unattributed counts by format.
 * Tuned so unfiltered totals match the prototype targets:
 * PNG 4,500 / 70%, SVG 2,400 / 65%, PDF 1,800 / 55%, PPTX 900 / 45%
 * and the brand visibility trend is 52% → 70% without a sudden jump.
 */
const dailyFormatCounts = [
  { date: "2026-09-14", format: "PNG", attributed: 140, unattributed: 80 },
  { date: "2026-09-14", format: "SVG", attributed: 70, unattributed: 50 },
  { date: "2026-09-14", format: "PDF", attributed: 35, unattributed: 70 },
  { date: "2026-09-14", format: "PPTX", attributed: 15, unattributed: 40 },
  { date: "2026-09-15", format: "PNG", attributed: 200, unattributed: 100 },
  { date: "2026-09-15", format: "SVG", attributed: 100, unattributed: 70 },
  { date: "2026-09-15", format: "PDF", attributed: 60, unattributed: 90 },
  { date: "2026-09-15", format: "PPTX", attributed: 25, unattributed: 55 },
  { date: "2026-09-16", format: "PNG", attributed: 270, unattributed: 130 },
  { date: "2026-09-16", format: "SVG", attributed: 130, unattributed: 90 },
  { date: "2026-09-16", format: "PDF", attributed: 80, unattributed: 100 },
  { date: "2026-09-16", format: "PPTX", attributed: 33, unattributed: 67 },
  { date: "2026-09-17", format: "PNG", attributed: 350, unattributed: 150 },
  { date: "2026-09-17", format: "SVG", attributed: 170, unattributed: 100 },
  { date: "2026-09-17", format: "PDF", attributed: 100, unattributed: 110 },
  { date: "2026-09-17", format: "PPTX", attributed: 40, unattributed: 80 },
  { date: "2026-09-18", format: "PNG", attributed: 500, unattributed: 200 },
  { date: "2026-09-18", format: "SVG", attributed: 240, unattributed: 130 },
  { date: "2026-09-18", format: "PDF", attributed: 150, unattributed: 140 },
  { date: "2026-09-18", format: "PPTX", attributed: 55, unattributed: 85 },
  { date: "2026-09-19", format: "PNG", attributed: 750, unattributed: 300 },
  { date: "2026-09-19", format: "SVG", attributed: 370, unattributed: 180 },
  { date: "2026-09-19", format: "PDF", attributed: 240, unattributed: 160 },
  { date: "2026-09-19", format: "PPTX", attributed: 92, unattributed: 108 },
  { date: "2026-09-20", format: "PNG", attributed: 940, unattributed: 390 },
  { date: "2026-09-20", format: "SVG", attributed: 480, unattributed: 220 },
  { date: "2026-09-20", format: "PDF", attributed: 325, unattributed: 140 },
  { date: "2026-09-20", format: "PPTX", attributed: 145, unattributed: 60 }
];

const methodWeightsAttributed = {
  PNG: { Download: 0.36, Share: 0.38, Embed: 0.26 },
  SVG: { Download: 0.48, Share: 0.28, Embed: 0.24 },
  PDF: { Download: 0.4, Share: 0.42, Embed: 0.18 },
  PPTX: { Download: 0.55, Share: 0.32, Embed: 0.13 }
};

const methodWeightsUnattributed = {
  PNG: { Download: 0.64, Share: 0.28, Embed: 0.08 },
  SVG: { Download: 0.78, Share: 0.18, Embed: 0.04 },
  PDF: { Download: 0.72, Share: 0.24, Embed: 0.04 },
  PPTX: { Download: 0.84, Share: 0.14, Embed: 0.02 }
};

const clickRates = {
  Download: 0,
  Share: 0.19,
  Embed: 0.26
};

function splitByWeights(total, weights) {
  const keys = Object.keys(weights);
  const raw = keys.map((key) => total * weights[key]);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((sum, value) => sum + value, 0);
  const order = raw
    .map((value, index) => ({ index, fraction: value - floors[index] }))
    .sort((a, b) => b.fraction - a.fraction);

  for (let i = 0; i < remainder; i += 1) {
    floors[order[i].index] += 1;
  }

  return Object.fromEntries(keys.map((key, index) => [key, floors[index]]));
}

function buildMockExports() {
  const rows = [];
  let id = 1;

  dailyFormatCounts.forEach((row) => {
    const attributedSplit = splitByWeights(row.attributed, methodWeightsAttributed[row.format]);
    const unattributedSplit = splitByWeights(row.unattributed, methodWeightsUnattributed[row.format]);

    METHODS.forEach((method) => {
      const attributedCount = attributedSplit[method];
      const unattributedCount = unattributedSplit[method];

      if (attributedCount > 0) {
        rows.push({
          id: id++,
          date: row.date,
          format: row.format,
          method,
          attribution: true,
          count: attributedCount,
          clicks: method === "Download" ? 0 : Math.round(attributedCount * clickRates[method])
        });
      }

      if (unattributedCount > 0) {
        rows.push({
          id: id++,
          date: row.date,
          format: row.format,
          method,
          attribution: false,
          count: unattributedCount,
          clicks: 0
        });
      }
    });
  });

  return rows;
}

export const mockExports = buildMockExports();
