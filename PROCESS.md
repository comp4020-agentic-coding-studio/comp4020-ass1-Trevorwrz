# Process overview

A reading-guide to how the work came together.

## What I built

A page with one mechanic: a Pull button that draws, for real, at a 0.6% SSR
rate — the base rate several real gacha games publish — with live stats and a
histogram of "pull number of the first SSR" across 5,000 simulated players,
marked with where your own current drought actually sits. The idea is that a
300-pull drought feels like the game cheating you until you see it's an
ordinary point in a real distribution, not an outlier.

## The moments that mattered

> **1. Choosing what "interactive" should mean, not just what's buildable.**
> The first version of this brief was a bloom filter — hash a word in, show
> the bits flip, demonstrate a false positive. It was well underway before I
> stopped and reconsidered: a hash collision is abstract, and nothing about it
> is personal to the person looking at it. A gacha drought is something a
> reader already has a gut feeling about, and that gut feeling is usually
> wrong. So I discarded the bloom filter before writing any prototype code and
> rewrote `CLAUDE.md`'s brief around the drought instead
> ([`0cb64af`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Trevorwrz/commit/0cb64af)).
> I knew it was the right call because the one-sentence pitch got sharper:
> "check this against your own result" is something a reader can actually do
> by looking at their own marker on the histogram, and a hash collision never
> gave a visitor anything to check against themselves.
>
> **2. Ruling out a pity system before writing any code.** Real gacha games
> almost all guarantee the rare drop after N tries, and it would have been
> easy to add "for realism." I wrote **no pity system** into `CLAUDE.md` as a
> hard rule before touching `main.ts`
> ([`0cb64af`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Trevorwrz/commit/0cb64af)),
> rather than leaving it as a maybe. A second mechanic would let a reader
> attribute any outcome to "the game guaranteeing it eventually," which
> quietly defeats the point of showing pure independent probability. The
> explainer section on the page says this out loud rather than silently
> leaving it out, which is how I checked the rule actually held once the page
> was built
> ([`5cd44a5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Trevorwrz/commit/5cd44a5)).
>
> **3. Making the histogram trustworthy, not just plausible.** The easy path
> is a closed-form geometric-distribution curve plotted as a line. Instead
> `buildPopulationHistogram()` runs the same `drawIsSSR()` function the live
> Pull button calls, 5,000 times, so the chart is real simulated data, not a
> formula standing in for it
> ([`5cd44a5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Trevorwrz/commit/5cd44a5)).
> I checked this was sane with a standalone run of the same logic: mean 163.4
> pulls against a theoretical 166.7, median 120, and 16.7% of simulated
> players still empty past 300 pulls — close enough to the closed form to
> trust the simulation, and the 16.7% figure is what ended up in the page's
> own explainer text.
>
> **4. Testing the interaction, not just the shipped markup.** The starter
> spec test only parsed the built `dist/index.html` with JSDOM and checked
> that one element existed — it never ran `main.ts`, so a broken click handler
> would still ship green. I replaced it with `spec/assignment-1.test.ts`,
> which runs in a real jsdom environment, mocks `Math.random` to force a miss
> and then a hit, and asserts the DOM actually updates — pull count, streak,
> SSR count, card state — rather than asserting an element is merely present
> ([`adf5309`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Trevorwrz/commit/adf5309)).
> I trusted it once `pnpm check` went from the starter's single static
> assertion to 17 passing tests that fail immediately if the click handler
> regresses, and then confirmed the real thing in a real browser by running
> `pnpm dev` and clicking Pull myself — after first tracking down a local
> `corepack` permissions problem that had been silently blocking `pnpm` from
> installing at all — and watching the card, stats, and histogram marker move
> exactly as the mocked test predicted
> ([`5cd44a5`](https://github.com/comp4020-agentic-coding-studio/comp4020-ass1-Trevorwrz/commit/5cd44a5)).

## Before you ship

`pnpm check:evidence` verifies your citations resolve to real commits, that the
current reflection entry is in `reflections/`, and that your `CLAUDE.md` is
there --- before a marker ever opens the file. It checks that your map is
traceable, not that it is good: the marker judges whether your small,
deliberately chosen set of moments shows real judgement and reflection. A green
check is not a substitute for that curation.

Images are deliberately not checked, because whether one renders is visible the
moment you look. Open this file on GitHub and look at it before you ship.
