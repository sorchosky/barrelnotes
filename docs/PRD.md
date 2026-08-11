# PRD — BarrelNotes

> Fill this out by talking through it, not writing it cold. Speak the answers,
> then clean it up. This is what Claude Code reads before touching anything —
> vague sections become vague builds.

**Status:** partially seeded. The sections below marked **`TODO — needs your voice`**
were left empty on purpose. BarrelNotes was built before it had a PRD, so what's
filled in here is reverse-engineered from the shipped code and is descriptive, not
directive — it says what the app *is*, not what it should become. The forward-looking
sections are the ones that actually steer future work, and they should be yours.

## Problem

Whiskey is expensive and easy to forget. You try something good at a bar or a
friend's place, mean to remember it, and by the time you're standing in a liquor
store two months later you can't recall whether you liked the Weller or the Elijah
Craig — let alone why. Meanwhile the shelf in front of you has two hundred bottles,
most of which you know nothing about, at $40-$120 a swing.

Two failures, one loop: no durable record of what you've tried, and no help at the
moment of purchase.

## Users

Primarily one person: the owner. That sets the bar — speed and taste over polish,
no onboarding flow, no accounts, no empty-state hand-holding beyond one line. Sample
data seeds on first run so the app is never blank.

It's built so it *could* be handed to a friend without embarrassment, but nothing in
it assumes a second user. There is no multi-user story, no sync, no sharing.

## Core loop

Two loops, sharing one data store:

**Log:** finish a pour → add the bottle with a 1-10 rating and notes → it's in your
tried list, permanently, searchable by eye.

**Decide:** standing in a store → photograph a label → get an identification, a
tasting profile, and a High/Medium/Low match score computed against everything
you've already rated → add it to the wishlist or walk away.

The second loop only works because the first one has data in it. Logging is what
makes scanning smart; scanning is what makes logging worth the effort. Neither half
is interesting alone, and any change that weakens one to help the other is probably
wrong.

## Shipped so far

Descriptive — this is what exists today, at the time this PRD was written.

1. **Bottle log** — add, edit, delete. Name, distillery, type, proof, price,
   status, 1-10 rating, free-text notes.
2. **Tried / wishlist split** — one `status` field, two filter tabs with counts.
   `rating` and `notes` are cleared when a bottle isn't `tried`.
3. **Grid and list views** — toggle persists across sessions.
4. **Scan a bottle** — camera capture → Claude Haiku 4.5 reads the label and
   returns name, distillery, type, proof, description, tasting notes, and a
   personalized match score with reasoning. Confirm card → prefilled add form.
5. **Local persistence** — `localStorage`, seeded with three sample bottles.

## Scope — this version

**TODO — needs your voice.** What's next, ordered by build priority, each scoped
tight enough that "done" is unambiguous. Candidates visible from the code, offered
only as prompts to react to, not a roadmap:

- `src/data/bourbons.json` has 100 bourbons with MSRP, proof, mashbill, and critic
  ratings, and nothing reads it. Autocomplete on the add form? A browse view? Delete it?
- The app can't survive a corrupt or full `localStorage` (see ARCHITECTURE.md).
- No search or sort — fine at 20 bottles, not at 200.
- Nothing exports. The entire log dies with the browser profile.

1.
2.
3.

## Explicitly out of scope

**TODO — needs your voice.** Naming these matters as much as naming the scope —
it's what stops Claude from creeping and stops you from second-guessing a call
mid-build. Things the current architecture implies are out, worth confirming:
accounts, sync across devices, sharing/social, price tracking, and a real backend.

## Success criteria

**TODO — needs your voice.** Concrete, not vibes — "identifies a common bourbon
from a phone photo of the front label 9 times out of 10" not "scanning feels good."

## Constraints

- **Budget for any paid API/service:** the Anthropic API bills per scan
  (`claude-haiku-4-5-20251001`, one image + ~600 output tokens per call). The only
  brake is a 10-per-IP-per-day limit that lives in memory in `api/scan.js` — it
  resets on cold start and doesn't coordinate across instances, so it is a speed
  bump, not a ceiling. **A per-month spend cap is not yet defined and should be.**
- **Timeline pressure:** none. Personal project.
- **Devices/browsers that matter:** mobile is the primary surface — the scan flow
  is a phone-in-a-liquor-store interaction. Desktop is secondary but supported.
- **Anything that must NOT change:** the `localStorage` keys and bottle shape
  documented in ARCHITECTURE.md, without a migration. The log is the product and
  there is no backup. The `whiskey-tracker-bottles` → `barrelnotes-bottles`
  migration in `src/App.jsx` stays until you're certain no browser still holds
  the old key.

## Open questions

- What's the acceptable monthly spend on scanning, and what should happen when
  it's hit — hard stop, or degrade to non-personalized identification?
- Does the log ever need to leave the browser (export, backup, second device)?
  This is the single biggest architectural fork left, and localStorage is a
  one-way door until it's answered.
- Is `bourbons.json` a feature waiting to happen or dead weight?
