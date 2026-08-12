// @vitest-environment jsdom
import { beforeAll, describe, expect, it, vi } from "vitest";

// This exercises the real interaction in main.ts against a jsdom document
// shaped like index.html's puller markup — the invariants check what ships
// as static HTML; this checks the one mechanic actually works: pulling
// changes the visible pull-count and can trigger an SSR reveal.
describe("pulling", () => {
  let pullButton: HTMLButtonElement;
  let cardEl: HTMLElement;
  let streakEl: HTMLElement;
  let totalEl: HTMLElement;
  let ssrsEl: HTMLElement;

  beforeAll(async () => {
    document.body.innerHTML = `
      <div class="card" id="card" data-state="idle"><span id="card-label">ready</span></div>
      <button id="pull-button" type="button">Pull</button>
      <dl class="stats">
        <dd id="stat-streak">0</dd>
        <dd id="stat-total">0</dd>
        <dd id="stat-ssrs">0</dd>
      </dl>
      <div class="histogram" id="histogram"></div>
    `;
    await import("../main");
    pullButton = document.getElementById("pull-button") as HTMLButtonElement;
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
});
