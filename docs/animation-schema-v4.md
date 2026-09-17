# Animation document format, v4

The existing document envelope and components remain unchanged. `clientSchemaVersion` is 4.
There is no automatic page advance. Users navigate between pages manually.

Each page may contain `transition: { preset, durationMs, delayMs }` and has an
`animations` array. An absent transition means None. Transition presets are
`fade`, `rise`, `slide-left`, `pop`, `morph`.

Each animation row is `{ id, elementId, kind, preset, trigger, delayMs, durationMs }`.
`elementId` references a component's `uuid` on this page. IDs must be unique per page;
copies receive new row IDs. Kinds: `entrance`, `emphasis`, `exit`. Entrance/exit
presets: `fade`, `rise`, `slide-left`, `pop`. Emphasis: `pulse` (two finite cycles).
All times are finite nonnegative milliseconds, limited to 60,000 per field.

`click` starts a new step with anchor zero. `with` shares the previous row's
anchor (not its start); `after` anchors to its end. The first row anchors to zero.
Start = anchor + delayMs; end = start + durationMs. Step duration is the latest
end of any row. Rows before the first click play on page entry. They run alongside
normal transitions, but after Morph. Next during entry completes both as one unit.

An element supports at most one entrance, any number of emphasis rows, and at
most one exit, in that chronological order without overlapping windows. Hidden
elements retain their timing slots; steps containing only hidden elements are skipped.

Components may include a persistent `morphId`; the match key defaults to `uuid`.
Page duplication keeps the source's match key while assigning new component IDs.
Paste/move resolves duplicate match keys on the destination page. A unique custom
name and matching type can provide a fallback match. Timers/custom paths crossfade.

Migration preserves legacy delays and concurrency. Legacy Pulse becomes emphasis
with 5,600 ms total duration. Legacy Pop preserves its 420 ms cap. Migration is
deterministic. The localStorage key remains `visora.editor.document.v1` so prior
work is not orphaned. Playback, preview and selection state are never serialized.

Backend integration must retain these fields on save/read, reject missing references
and invalid timing, and retain unknown future schema documents rather than downgrade
them. No document API is implemented by this change.
