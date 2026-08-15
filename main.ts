// Gacha drought explainer. The histogram is built from the same draw logic
// as the live "Pull" button -- same rate, just run many times up front, not
// a plotted formula standing in for it.

const SSR_RATE = 0.006;
const POPULATION_SIZE = 5000;
const MAX_PULLS_PER_TRIAL = 800; // trials that never hit are dropped from the population, not extended forever
const BUCKET_WIDTH = 25;
const BUCKET_COUNT = Math.ceil(MAX_PULLS_PER_TRIAL / BUCKET_WIDTH);

function drawIsSSR(): boolean {
  return Math.random() < SSR_RATE;
}

function simulateOnePlayer(): number | null {
  for (let pull = 1; pull <= MAX_PULLS_PER_TRIAL; pull++) {
    if (drawIsSSR()) return pull;
  }
  return null; // still hadn't hit by the cap -- excluded from the histogram, not clamped into the last bucket
}

function bucketFor(pullNumber: number): number {
  return Math.min(BUCKET_COUNT - 1, Math.floor((pullNumber - 1) / BUCKET_WIDTH));
}

function buildPopulationHistogram(): number[] {
  const buckets = Array.from<number>({ length: BUCKET_COUNT }).fill(0);
  for (let i = 0; i < POPULATION_SIZE; i++) {
    const firstHitPull = simulateOnePlayer();
    if (firstHitPull !== null) buckets[bucketFor(firstHitPull)]++;
  }
  return buckets;
}

const populationBuckets = buildPopulationHistogram();
const maxBucketCount = Math.max(...populationBuckets);

const cardEl = document.getElementById("card")!;
const cardLabelEl = document.getElementById("card-label")!;
const pullButton = document.getElementById("pull-button") as HTMLButtonElement;
const pullTenButton = document.getElementById("pull-ten-button") as HTMLButtonElement;
const tenPullResultsEl = document.getElementById("ten-pull-results")!;
const streakEl = document.getElementById("stat-streak")!;
const totalEl = document.getElementById("stat-total")!;
const ssrsEl = document.getElementById("stat-ssrs")!;
const histogramEl = document.getElementById("histogram")!;

let pullsSinceLastSSR = 0;
let totalPulls = 0;
let totalSSRs = 0;

function renderHistogram() {
  histogramEl.innerHTML = "";
  const markerBucket = bucketFor(pullsSinceLastSSR + 1);
  for (let i = 0; i < BUCKET_COUNT; i++) {
    const bar = document.createElement("div");
    bar.className = "bar" + (i === markerBucket ? " marker" : "");
    const heightPct = maxBucketCount === 0 ? 0 : (populationBuckets[i] / maxBucketCount) * 100;
    bar.style.height = `${heightPct}%`;
    bar.title = `${i * BUCKET_WIDTH + 1}–${(i + 1) * BUCKET_WIDTH} pulls: ${populationBuckets[i]} players`;
    histogramEl.appendChild(bar);
  }
  histogramEl.setAttribute(
    "aria-label",
    `Histogram of pulls until first SSR across ${POPULATION_SIZE} simulated players. ` +
      `Your current streak of ${pullsSinceLastSSR} pulls falls in the ${markerBucket * BUCKET_WIDTH + 1}-` +
      `${(markerBucket + 1) * BUCKET_WIDTH} pull range.`,
  );
}

function renderStats() {
  streakEl.textContent = String(pullsSinceLastSSR);
  totalEl.textContent = String(totalPulls);
  ssrsEl.textContent = String(totalSSRs);
}

// One draw, real and independent — the ×10 button below is this run ten
// times in a row, not a different mechanic with better odds.
function performPull(): boolean {
  totalPulls++;
  const hit = drawIsSSR();

  if (hit) {
    totalSSRs++;
    pullsSinceLastSSR = 0;
    cardEl.dataset.state = "ssr";
    cardLabelEl.textContent = "SSR!";
  } else {
    pullsSinceLastSSR++;
    cardEl.dataset.state = "common";
    cardLabelEl.textContent = "common";
  }

  return hit;
}

function renderTenPullResults(hits: boolean[]) {
  tenPullResultsEl.innerHTML = "";
  for (const hit of hits) {
    const chip = document.createElement("div");
    chip.className = "chip" + (hit ? " ssr" : "");
    tenPullResultsEl.appendChild(chip);
  }
  const ssrCount = hits.filter(Boolean).length;
  tenPullResultsEl.setAttribute("aria-label", `Last ×10 pull: ${ssrCount} of 10 were SSR.`);
}

pullButton.addEventListener("click", () => {
  performPull();
  renderStats();
  renderHistogram();
});

pullTenButton.addEventListener("click", () => {
  const hits = Array.from({ length: 10 }, () => performPull());
  renderTenPullResults(hits);
  renderStats();
  renderHistogram();
});

renderStats();
renderHistogram();
