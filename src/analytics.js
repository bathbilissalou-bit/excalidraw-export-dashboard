import { ATTRIBUTION_TYPES, FORMATS, METHODS } from "./mockData";

export function visibilityRate(attributed, total) {
  return total ? attributed / total : 0;
}

export function formatPercent(rate) {
  return `${Math.round(rate * 100)}%`;
}

export function formatNumber(value) {
  return value.toLocaleString("en-US");
}

export function formatShortDate(isoDate) {
  const [, month, day] = isoDate.split("-").map(Number);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[month - 1]} ${day}`;
}

export function formatTimestamp(isoDateTime) {
  const [isoDate, time] = isoDateTime.split("T");
  const [hourString, minute] = time.split(":");
  const hour = Number(hourString);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${formatShortDate(isoDate)}, 2026 · ${hour12}:${minute} ${suffix}`;
}

export function filterExports(rows, { format, status, method, datePreset }) {
  return rows.filter((row) => {
    const matchesFormat = format === "All" || row.format === format;
    const matchesStatus =
      status === "All" ||
      (status === "Attributed" && row.attribution) ||
      (status === "Unattributed" && !row.attribution);
    const matchesMethod = method === "All" || row.method === method;
    const matchesDate = row.date >= datePreset.from && row.date <= datePreset.to;
    return matchesFormat && matchesStatus && matchesMethod && matchesDate;
  });
}

export function summarize(rows) {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const attributed = rows.reduce((sum, row) => sum + (row.attribution ? row.count : 0), 0);
  const unattributed = total - attributed;
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const views = rows.reduce((sum, row) => sum + (row.views || 0), 0);

  return {
    total,
    attributed,
    unattributed,
    clicks,
    views,
    rate: visibilityRate(attributed, total)
  };
}

export function performanceByFormat(rows) {
  return FORMATS.map((format) => {
    const group = rows.filter((row) => row.format === format);
    const stats = summarize(group);
    return { format, ...stats };
  });
}

export function performanceByMethod(rows) {
  return METHODS.map((method) => {
    const group = rows.filter((row) => row.method === method);
    const stats = summarize(group);
    return { method, ...stats };
  });
}

export function performanceByAttributionType(rows) {
  return ATTRIBUTION_TYPES.map((type) => {
    const group = rows.filter((row) => row.attributionType === type);
    const stats = summarize(group);
    return { type, ...stats };
  });
}

export function brandVisibilityTrend(rows) {
  const byDate = {};

  rows.forEach((row) => {
    if (!byDate[row.date]) {
      byDate[row.date] = { total: 0, attributed: 0 };
    }
    byDate[row.date].total += row.count;
    if (row.attribution) {
      byDate[row.date].attributed += row.count;
    }
  });

  return Object.entries(byDate)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, value]) => ({
      date,
      rate: visibilityRate(value.attributed, value.total),
      total: value.total,
      attributed: value.attributed
    }));
}

export function shareEmbedMetrics(rows) {
  const overall = summarize(rows);
  const share = summarize(rows.filter((row) => row.method === "Share"));
  const embed = summarize(rows.filter((row) => row.method === "Embed"));
  const brandedShareViews = rows
    .filter((row) => row.attributionType === "Branded Share Page")
    .reduce((sum, row) => sum + (row.views || 0), 0);

  return {
    overall,
    shareLinksCreated: share.total,
    embedsCreated: embed.total,
    brandedShareViews,
    clicks: overall.clicks,
    share,
    embed
  };
}

export function rankFormats(byFormat) {
  const active = byFormat.filter((row) => row.total > 0);
  if (!active.length) {
    return { best: null, worst: null };
  }
  const ranked = [...active].sort((a, b) => b.rate - a.rate || b.total - a.total);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  return {
    best,
    worst: worst.format === best.format ? null : worst
  };
}

export function rankMethods(byMethod) {
  const active = byMethod.filter((row) => row.total > 0);
  if (!active.length) {
    return { best: null, worst: null };
  }
  const ranked = [...active].sort((a, b) => b.rate - a.rate || b.total - a.total);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  return {
    best,
    worst: worst.method === best.method ? null : worst
  };
}

function methodLabel(method) {
  return method === "Download" ? "Direct Download" : method;
}

export function buildVisibilityOpportunities({ totals, byFormat, byMethod }) {
  if (!totals.total) {
    return [
      {
        id: "empty",
        title: "No visibility opportunities in this view",
        body: "Adjust filters to see where Brand Visibility Rate could improve after drawings leave the app.",
        metric: null
      }
    ];
  }

  const opportunities = [];
  const { best: bestFormat, worst: worstFormat } = rankFormats(byFormat);
  const { best: bestMethod, worst: worstMethod } = rankMethods(byMethod);
  const share = byMethod.find((row) => row.method === "Share");
  const download = byMethod.find((row) => row.method === "Download");

  if (worstFormat && bestFormat && worstFormat.rate < bestFormat.rate) {
    opportunities.push({
      id: "lowest-format",
      title: `Lowest-performing format: ${worstFormat.format}`,
      body: `${worstFormat.format} currently has the lowest Brand Visibility Rate at ${formatPercent(worstFormat.rate)}, making it a strong area to explore additional optional attribution approaches.`,
      metric: formatPercent(worstFormat.rate)
    });
  }

  if (worstMethod && bestMethod && worstMethod.rate < bestMethod.rate) {
    const comparison =
      worstMethod.method === "Download" && share?.total && share.rate > worstMethod.rate ? share : bestMethod;
    const downloadVsShare =
      worstMethod.method === "Download" && comparison.method === "Share"
        ? `Direct Download has lower visible attribution than Share (${formatPercent(worstMethod.rate)} vs ${formatPercent(comparison.rate)}), suggesting an opportunity to test additional optional attribution in the download flow.`
        : `${methodLabel(worstMethod.method)} currently has a Brand Visibility Rate of ${formatPercent(worstMethod.rate)}, below ${methodLabel(comparison.method)} at ${formatPercent(comparison.rate)}. This is an opportunity to test contextual attribution around that export path.`;

    opportunities.push({
      id: "lowest-method",
      title: `Lowest-performing method: ${methodLabel(worstMethod.method)}`,
      body: downloadVsShare,
      metric: formatPercent(worstMethod.rate)
    });
  }

  if (bestMethod && bestMethod.total && (bestMethod.method === "Share" || bestMethod.method === "Embed")) {
    const shareCopy =
      bestMethod.method === "Share"
        ? `Share links retain higher Excalidraw visibility at ${formatPercent(bestMethod.rate)}, suggesting branded share experiences are an effective organic discovery channel.`
        : `Embeds currently retain the highest Brand Visibility Rate at ${formatPercent(bestMethod.rate)}, suggesting contextual attribution around embedded drawings is an effective organic discovery channel.`;

    opportunities.push({
      id: "strong-method",
      title: `Strong-performing method: ${bestMethod.method}`,
      body: shareCopy,
      metric: formatPercent(bestMethod.rate)
    });
  } else if (share?.total && download?.total && share.rate > download.rate) {
    opportunities.push({
      id: "strong-method",
      title: "Strong-performing method: Share",
      body: `Share links retain higher Excalidraw visibility than Direct Download (${formatPercent(share.rate)} vs ${formatPercent(download.rate)}), suggesting branded share experiences are an effective organic discovery channel.`,
      metric: formatPercent(share.rate)
    });
  }

  if (totals.clicks > 0) {
    opportunities.push({
      id: "engagement",
      title: "Engagement path back to Excalidraw",
      body: `${formatNumber(totals.clicks)} Open/Edit in Excalidraw clicks show that branded attribution can create a path back into the product.`,
      metric: formatNumber(totals.clicks)
    });
  } else if (totals.attributed === 0) {
    opportunities.push({
      id: "unattributed-view",
      title: "No visible attribution in this view",
      body: `All ${formatNumber(totals.total)} exports in the current filters leave the app without a visible Excalidraw cue. Optional credit, branded share pages, or Open/Edit links around the artifact may be useful experiments.`,
      metric: "0%"
    });
  }

  return opportunities.slice(0, 4);
}

export function searchEvents(events, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return events;
  return events.filter((event) => {
    const haystack = [
      event.timestamp,
      formatTimestamp(event.timestamp),
      event.format,
      event.method,
      event.attributionStatus,
      event.attributionType,
      event.openEditClick ? "yes" : "no",
      event.status
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  });
}

export function buildInsights({ totals, byFormat, byMethod, trend }) {
  const activeFormats = byFormat.filter((row) => row.total > 0);

  if (!activeFormats.length || totals.total === 0) {
    return [
      {
        title: "No export activity in this view.",
        body: "Adjust filters to see brand visibility for the selected period."
      }
    ];
  }

  const insights = [];
  const { best, worst } = rankFormats(byFormat);

  if (best) {
    insights.push({
      title: `${best.format} currently has the highest Brand Visibility Rate at ${formatPercent(best.rate)}.`,
      body: `${formatNumber(best.attributed)} of ${formatNumber(best.total)} ${best.format} exports carry visible attribution.`
    });
  }

  if (worst) {
    insights.push({
      title: `${worst.format} has the lowest Brand Visibility Rate at ${formatPercent(worst.rate)}.`,
      body: `${formatNumber(worst.unattributed)} ${worst.format} exports have no visible attribution.`
    });
  }

  const share = byMethod.find((row) => row.method === "Share");
  const download = byMethod.find((row) => row.method === "Download");
  if (share?.total && download?.total) {
    if (share.rate > download.rate) {
      insights.push({
        title: "Share exports have higher attribution than direct downloads.",
        body: `Share Brand Visibility Rate is ${formatPercent(share.rate)} vs ${formatPercent(download.rate)} for Download.`
      });
    } else if (download.rate > share.rate) {
      insights.push({
        title: "Direct downloads currently retain more attribution than shares.",
        body: `Download Brand Visibility Rate is ${formatPercent(download.rate)} vs ${formatPercent(share.rate)} for Share.`
      });
    }
  }

  if (trend.length >= 2) {
    const first = trend[0];
    const last = trend[trend.length - 1];
    const delta = Math.round(last.rate * 100) - Math.round(first.rate * 100);
    if (delta !== 0) {
      insights.push({
        title: `Brand Visibility Rate ${delta > 0 ? "improved" : "declined"} from ${formatPercent(first.rate)} to ${formatPercent(last.rate)}.`,
        body: `${delta > 0 ? "+" : ""}${delta} percentage points across the selected dates.`
      });
    }
  }

  return insights.slice(0, 4);
}
