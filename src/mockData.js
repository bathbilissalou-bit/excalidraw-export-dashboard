/**
 * MOCK DATA ONLY — not Excalidraw production analytics.
 *
 * Replace this module with a real analytics/API client when export tracking exists.
 * Expected future shape: GET /analytics/exports?from&to&format&method&attribution
 * returning aggregated rows { date, format, method, attribution, attributionType, count, clicks, views }.
 *
 * Individual export events would come from telemetry such as:
 * export_completed, share_link_created, embed_published, attribution_visible, open_in_excalidraw_clicked.
 */

export const FORMATS = ["PNG", "SVG", "PDF", "PPTX"];
export const METHODS = ["Download", "Share", "Embed"];
export const ATTRIBUTION_STATUSES = ["All", "Attributed", "Unattributed"];
export const ATTRIBUTION_TYPES = ["Made with Excalidraw", "Branded Share Page", "Open/Edit Link", "None"];

export const NAV_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "exports", label: "Exports" },
  { id: "attribution", label: "Attribution" },
  { id: "share-embed", label: "Share & Embed" }
];

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

const attributedTypeWeights = {
  Download: { "Made with Excalidraw": 1 },
  Share: { "Branded Share Page": 0.68, "Open/Edit Link": 0.32 },
  Embed: { "Branded Share Page": 0.35, "Open/Edit Link": 0.65 }
};

const clickRates = {
  Download: 0,
  Share: 0.19,
  Embed: 0.26
};

const SAMPLE_TIMES = ["08:14", "09:32", "10:05", "11:47", "13:21", "14:08", "15:55", "16:42", "18:19"];

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

function methodStatus(method) {
  if (method === "Download") return "Downloaded";
  if (method === "Share") return "Link created";
  return "Embed published";
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
      const typeSplit = splitByWeights(attributedCount, attributedTypeWeights[method]);

      Object.entries(typeSplit).forEach(([attributionType, count]) => {
        if (count <= 0) return;
        const clicks = method === "Download" ? 0 : Math.round(count * clickRates[method]);
        rows.push({
          id: id++,
          date: row.date,
          format: row.format,
          method,
          attribution: true,
          attributionType,
          count,
          clicks,
          views: attributionType === "Branded Share Page" ? Math.round(count * 2.8) : 0
        });
      });

      if (unattributedCount > 0) {
        rows.push({
          id: id++,
          date: row.date,
          format: row.format,
          method,
          attribution: false,
          attributionType: "None",
          count: unattributedCount,
          clicks: 0,
          views: 0
        });
      }
    });
  });

  return rows;
}

function buildMockEvents(aggregates) {
  // Sample event-level telemetry, not the full 9,600 exports.
  // In production these records would be the source for Brand Visibility Rate.
  return aggregates.map((row, index) => {
    const time = SAMPLE_TIMES[index % SAMPLE_TIMES.length];
    return {
      id: `evt-${row.id}`,
      timestamp: `${row.date}T${time}:00`,
      date: row.date,
      format: row.format,
      method: row.method,
      attribution: row.attribution,
      attributionStatus: row.attribution ? "Attributed" : "Unattributed",
      attributionType: row.attributionType,
      openEditClick: row.clicks > 0,
      status: methodStatus(row.method)
    };
  });
}

export const mockExports = buildMockExports();
export const mockEvents = buildMockEvents(mockExports);
