import { FORMATS, METHODS } from "./mockData";

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

  return {
    total,
    attributed,
    unattributed,
    clicks,
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
  const rankedByRate = [...activeFormats].sort((a, b) => b.rate - a.rate || b.total - a.total);
  const best = rankedByRate[0];
  const worst = rankedByRate[rankedByRate.length - 1];

  insights.push({
    title: `${best.format} has the highest visibility rate at ${formatPercent(best.rate)}.`,
    body: `${formatNumber(best.attributed)} of ${formatNumber(best.total)} ${best.format} exports carry visible attribution.`
  });

  if (worst.format !== best.format) {
    insights.push({
      title: `${worst.format} has the lowest visibility rate at ${formatPercent(worst.rate)}.`,
      body: `${formatNumber(worst.unattributed)} ${worst.format} exports have no visible attribution.`
    });
  }

  const belowAverage = FORMATS.map((format) => activeFormats.find((row) => row.format === format)).filter(
    (row) => row && row.rate < totals.rate
  );

  if (belowAverage.length >= 2) {
    const opportunity = belowAverage.reduce((sum, row) => sum + row.unattributed, 0);
    insights.push({
      title: `${belowAverage.map((row) => row.format).join(" + ")} represent the largest attribution opportunity.`,
      body: `${formatNumber(opportunity)} unattributed exports sit below the overall visibility rate of ${formatPercent(totals.rate)}.`
    });
  } else if (belowAverage.length === 1) {
    insights.push({
      title: `${belowAverage[0].format} is the primary attribution opportunity.`,
      body: `${formatNumber(belowAverage[0].unattributed)} unattributed ${belowAverage[0].format} exports sit below the overall visibility rate.`
    });
  }

  if (trend.length >= 2) {
    const first = trend[0];
    const last = trend[trend.length - 1];
    const delta = Math.round(last.rate * 100) - Math.round(first.rate * 100);
    if (delta !== 0) {
      insights.push({
        title: `Brand visibility ${delta > 0 ? "improved" : "declined"} from ${formatPercent(first.rate)} to ${formatPercent(last.rate)}.`,
        body: `${delta > 0 ? "+" : ""}${delta} percentage points across the selected dates.`
      });
    }
  }

  return insights.slice(0, 4);
}
