// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";

// This exercises the real interaction in main.ts against a jsdom document
// shaped like index.html's puller markup — the invariants check what ships
// as static HTML; this checks the one mechanic actually works: pulling
// changes the visible pull-count and can trigger an SSR reveal.
describe("pulling", () => {
  let pullButton: HTMLButtonElement;
  let pullTenButton: HTMLButtonElement;
  let tenPullResultsEl: HTMLElement;
  let cardEl: HTMLElement;
  let streakEl: HTMLElement;
  let totalEl: HTMLElement;
  let ssrsEl: HTMLElement;

  beforeAll(async () => {
    document.body.innerHTML = `
      <div class="card" id="card" data-state="idle"><span id="card-label">ready</span></div>
      <div class="pull-actions">
        <button id="pull-button" type="button">Pull</button>
        <button id="pull-ten-button" type="button">Pull x10</button>
      </div>
      <div class="ten-pull-results" id="ten-pull-results"></div>
      <dl class="stats">
        <dd id="stat-streak">0</dd>
        <dd id="stat-total">0</dd>
        <dd id="stat-ssrs">0</dd>
      </dl>
      <div class="histogram" id="histogram"></div>
    `;
    await import("../main");
    pullButton = document.getElementById("pull-button") as HTMLButtonElement;
    pullTenButton = document.getElementById("pull-ten-button") as HTMLButtonElement;
    tenPullResultsEl = document.getElementById("ten-pull-results")!;
    cardEl = document.getElementById("card")!;
    streakEl = document.getElementById("stat-streak")!;
    totalEl = document.getElementById("stat-total")!;
    ssrsEl = document.getElementById("stat-ssrs")!;
  });

  it("a miss increases the total and streak but not the SSR count", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.99);
    pullButton.click();

    expect(totalEl.textContent).toBe("1");
    expect(streakEl.textContent).toBe("1");
    expect(ssrsEl.textContent).toBe("0");
    expect(cardEl.dataset.state).toBe("common");
  });

  it("a hit resets the streak and increments the SSR count", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0);
    pullButton.click();

    expect(totalEl.textContent).toBe("2");
    expect(streakEl.textContent).toBe("0");
    expect(ssrsEl.textContent).toBe("1");
    expect(cardEl.dataset.state).toBe("ssr");
  });

  it("a ×10 pull runs ten real draws and shows a chip per result", () => {
    const random = vi.spyOn(Math, "random");
    // 3 hits (< 0.006) among 10 draws
    random
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0.5)
      .mockReturnValueOnce(0.5);

    const totalBefore = Number(totalEl.textContent);
    const ssrsBefore = Number(ssrsEl.textContent);

    pullTenButton.click();

    expect(totalEl.textContent).toBe(String(totalBefore + 10));
    expect(ssrsEl.textContent).toBe(String(ssrsBefore + 3));
    expect(tenPullResultsEl.querySelectorAll(".chip").length).toBe(10);
    expect(tenPullResultsEl.querySelectorAll(".chip.ssr").length).toBe(3);
  });
});
