import { FORMATS, SHARING_LINK_FORMAT } from "./mockData";

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

export function filterExports(rows, { format, status, datePreset }) {
  return rows.filter((row) => {
    const matchesFormat = format === "All" || row.format === format;
    const matchesStatus =
      status === "All" ||
      (status === "Attributed" && row.attribution) ||
      (status === "Unattributed" && !row.attribution);
    const matchesDate = row.date >= datePreset.from && row.date <= datePreset.to;
    return matchesFormat && matchesStatus && matchesDate;
  });
}

export function countSharingLinks(rows) {
  return rows
    .filter((row) => row.format === SHARING_LINK_FORMAT)
    .reduce((sum, row) => sum + row.count, 0);
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
    linksShared: countSharingLinks(rows),
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

export function buildVisibilityOpportunities({ totals, byFormat }) {
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
  const sharing = byFormat.find((row) => row.format === SHARING_LINK_FORMAT);
  const embed = byFormat.find((row) => row.format === "Embed");

  if (worstFormat && bestFormat && worstFormat.rate < bestFormat.rate) {
    opportunities.push({
      id: "lowest-format",
      title: `Lowest-performing format: ${worstFormat.format}`,
      body: `${worstFormat.format} currently has the lowest Brand Visibility Rate at ${formatPercent(worstFormat.rate)}, making it a strong area to explore additional optional attribution approaches.`,
      metric: formatPercent(worstFormat.rate)
    });
  }

  if (bestFormat && bestFormat.total && bestFormat.rate > 0) {
    const discoveryCopy =
      bestFormat.format === SHARING_LINK_FORMAT
        ? `${SHARING_LINK_FORMAT} currently retains the highest Brand Visibility Rate at ${formatPercent(bestFormat.rate)}, suggesting branded share experiences are an effective organic discovery channel.`
        : bestFormat.format === "Embed"
          ? `Embed currently retains the highest Brand Visibility Rate at ${formatPercent(bestFormat.rate)}, suggesting contextual attribution around embedded drawings is an effective organic discovery channel.`
          : `${bestFormat.format} currently has the highest Brand Visibility Rate at ${formatPercent(bestFormat.rate)}, making it a useful reference for optional attribution on other export paths.`;

    opportunities.push({
      id: "strong-format",
      title: `Strong-performing format: ${bestFormat.format}`,
      body: discoveryCopy,
      metric: formatPercent(bestFormat.rate)
    });
  }

  if (
    sharing?.total &&
    bestFormat?.format !== SHARING_LINK_FORMAT &&
    sharing.rate > totals.rate
  ) {
    opportunities.push({
      id: "sharing-link",
      title: `${SHARING_LINK_FORMAT} visibility`,
      body: `${SHARING_LINK_FORMAT} retains a Brand Visibility Rate of ${formatPercent(sharing.rate)}, above the overall rate of ${formatPercent(totals.rate)}, suggesting branded share experiences are an effective organic discovery channel.`,
      metric: formatPercent(sharing.rate)
    });
  } else if (embed?.total && bestFormat?.format !== "Embed" && embed.rate > totals.rate) {
    opportunities.push({
      id: "embed-visibility",
      title: "Embed visibility",
      body: `Embed retains a Brand Visibility Rate of ${formatPercent(embed.rate)}, above the overall rate of ${formatPercent(totals.rate)}, suggesting contextual attribution around embedded drawings is an effective discovery path.`,
      metric: formatPercent(embed.rate)
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

export function buildInsights({ totals, byFormat, trend }) {
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

  if (worst && worst.rate < (best?.rate ?? 0)) {
    insights.push({
      title: `${worst.format} has the lowest Brand Visibility Rate at ${formatPercent(worst.rate)}.`,
      body: `${formatNumber(worst.unattributed)} ${worst.format} exports have no visible attribution.`
    });
  }

  const sharing = byFormat.find((row) => row.format === SHARING_LINK_FORMAT);
  const otherFormats = byFormat.filter((row) => row.format !== SHARING_LINK_FORMAT && row.total > 0);
  if (sharing?.total && otherFormats.length) {
    const other = summarizeTotals(otherFormats);
    if (sharing.rate > other.rate) {
      insights.push({
        title: `${SHARING_LINK_FORMAT} has higher attribution than other export formats.`,
        body: `${SHARING_LINK_FORMAT} Brand Visibility Rate is ${formatPercent(sharing.rate)} vs ${formatPercent(other.rate)} for the remaining formats in this view.`
      });
    } else if (other.rate > sharing.rate) {
      insights.push({
        title: `Other export formats currently retain more attribution than ${SHARING_LINK_FORMAT}.`,
        body: `Remaining formats are at ${formatPercent(other.rate)} vs ${formatPercent(sharing.rate)} for ${SHARING_LINK_FORMAT}.`
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

function summarizeTotals(formatRows) {
  const total = formatRows.reduce((sum, row) => sum + row.total, 0);
  const attributed = formatRows.reduce((sum, row) => sum + row.attributed, 0);
  return { total, attributed, rate: visibilityRate(attributed, total) };
}
