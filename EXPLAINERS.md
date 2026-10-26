# Animated explainers (`js/explainers.js`)

Each game can have a short animated explainer shown above its rules: 3–6 steps, each a
caption plus a scene drawn by `js/explain.js` on a 320×200 stage with clay-style blob people.
The player auto-advances, loops, and can read the caption aloud. Nothing is downloaded: a
whole explainer is ~0.5 KB of data.

`js/explainers.js` assigns `window.GP_EXPLAINERS = { 'game-id': [step, step, ...], ... }`.
Run `node tools/validate-explainers.js` after editing.

## A step

```js
{
  say: 'Music plays. Pass the parcel round the circle.',   // caption, read aloud on demand. ≤ 90 chars.
  people: 8,                 // how many people on stage (2..16). Sticky: omit to keep the previous step's value.
  layout: 'circle',          // sticky. circle | row | teams | scatter | pair | chairs
  chairs: 7,                 // only for layout 'chairs': number of chairs (default people - 1)
  states: { 0: 'it', 3: 'out' },      // per-person look, by index (see States). Reset every step.
  labels: { 0: 'Host' },              // short text under a person (≤ 10 chars)
  bubbles: { 2: 'Four!' },            // speech bubble above a person (≤ 14 chars)
  point: { 1: 4 },                    // person 1 points at person 4
  props: [ { id: 'parcel', type: 'parcel', at: 'p2' } ],   // props on stage this step (see Props). Reset every step.
  moves: [ { id: 'parcel', orbit: [2, 6], dur: 2 } ],      // animations within this step (see Moves)
  fx: ['music'],             // ambient effects: music | stop | timer | confetti | zzz | whistle | night
  hold: 3                    // seconds before auto-advancing (default 3, min 1.5, max 8)
}
```

Everything moves smoothly between steps: if person 3 is at a chair in one step and at the
centre in the next, they glide there. Props with the same `id` glide too; a prop that
disappears fades out.

## Layouts

* `circle` – everyone round an ellipse, index 0 at the top, clockwise.
* `row` – a line across the middle, index 0 on the left.
* `teams` – first half on the left facing right, second half on the right facing left.
* `pair` – two people facing each other (uses people 0 and 1; extra people stand behind).
* `scatter` – spread around randomly but deterministically.
* `chairs` – chairs in an inner ring, people walking round an outer ring. Anchor `c0..cN` are the chairs.

## Anchors (where things are)

`p3` person 3 · `p3.hand` their hand (right side) · `p3.head` above their head ·
`c2` chair 2 · `center` · `left` `right` `top` `bottom` · `corner` (top-left, good for a host/referee standing aside) `corner2` (top-right) · `mid:2,5` midway between two people ·
`{ x: 160, y: 40 }` absolute (stage is 320 wide × 200 high).

## States (person look)

`normal` · `it` (glowing ring, the active/chosen person) · `out` (faded with an X) ·
`blind` (blindfold) · `sleep` (eyes shut; add fx `zzz`) · `happy` · `sad` · `shout` (open mouth
+ motion lines) · `hands` (arms up) · `sit` (used with chairs; put them at a chair with a move) ·
`mafia` (dark, shifty), `host` (wears a cap).

## Props

`parcel` `chair` `ball` `balloon` `note` (music note) `phone` `paper` `cup` `spoon` (with lemon)
`rope` `stones` `bowl` `chit` `potato` `line` (a floor line across the stage) `timer` `star`
`text` (needs `text: 'STOP'`, ≤ 12 chars) `x` (a red cross) `tick` (green tick) `hat` `gift`.

A prop needs `id` (unique within the explainer), `type`, `at`. Optional `size` (0.6–1.6) and `text`.

## Moves (animation inside a step)

Each move names a target `id`: a prop id, or `p3` for a person.

* `{ id, to: anchor, dur: 1.5, loop: false }` – glide to the anchor. `loop: true` goes back and forth.
* `{ id, orbit: [from, to], dur: 2, loop: true }` – travel round the circle from person `from` to person `to` (passing things). Only sensible in `circle`/`chairs`.
* `{ id, bounce: true }` – bob up and down (balloon in the air, excited person).
* `{ id, shake: true }` – wobble (nervous, "no", counting down).
* `{ id, spin: true }` – rotate (bottle, wheel).
* `{ id, pop: true, at: 1.5 }` – scale up and vanish at `at` seconds (balloon burst). Pair with fx `stop`.
* `{ id, fall: true }` – drop and fade (ball hits floor, person "dies" dramatically).
* `{ id, grow: true }` / `{ id, shrink: true }` – scale over the step.
* `{ id, path: [anchor, anchor, ...], dur, loop }` – visit several anchors in order (relay running).

`dur` is seconds (default 1.5). Loops repeat until the step ends.

## Writing good explainers

* First step shows the setup. Middle steps show the one mechanic people get wrong. Last step
  shows how you win or who is out. 3–6 steps; most games need 4.
* Captions are read aloud; write them as the host would say them. One sentence each.
* Keep people ≤ 10 unless the point is "big crowd". Use states to make the active person obvious.
* Don't narrate what the picture already shows; add the rule.
