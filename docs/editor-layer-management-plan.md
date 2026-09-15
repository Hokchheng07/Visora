# Visora Editor: Layer Management Master Plan

## Status

- Planning only; no product code is changed by this document.
- Scope: layer management, the text-editor Space-key defect, and the Customize sidebar changes that layer rules require.
- Estimated implementation: **13–19 working days**, including integration and tests (phase sum; see each phase).
- Schema: these fields are added to **clientSchemaVersion 3**, which has not shipped to the backend yet. No version 4. The Notion `backdrop-controller` page must be updated in the same change.

### Revision 2 — changes from the review

| # | Change | Where |
|---|--------|-------|
| 1 | Fields fold into schema v3; the example no longer claims version 4 | Status, API impact |
| 2 | "No Customize sidebar changes" removed; the sidebar work is now listed | Non-goals, Phase D, Phase G |
| 3 | Locking enforced in the store, with every existing editing path listed | Phase D |
| 4 | Page duplicate and paste regenerate group ids and remap `groupId` | Phase B, Phase G |
| 5 | Moving layers to another page keeps `morphKey` unique on the destination | Phase H |
| 6 | Space fix: drag hook ignores clicks while editing; `\u00A0` normalised on commit | Phase A |
| 7 | Group selection derived from the selection, not stored separately | Phase B |
| 8 | `[` / `]` already appear in menus but do nothing; browser shortcut conflicts handled | Phase F |
| 9 | Locked layers may be renamed; hidden layers may be edited from the sidebar | Phase D |
| 10 | Layer drag added as the first step of the editor's Escape order | Phase E |
| 11 | Group rotation declared out of scope | Non-goals, Phase G |
| 12 | One invariant checker runs after every action in reducer tests | Phase B, tests |
| 13 | ARIA tree roles specified | Phase I |
| 14 | Estimate recomputed from the phases | Status |
| 15 | `layerIndex` meaning and backend contiguity responsibility stated | API impact |

## Goals

Build a Figma-like layer-management experience that supports:

- Dragging layers to change their stacking order.
- Bring forward, bring to front, send backward, and send to back.
- Hiding and showing elements and groups.
- Locking and unlocking elements and groups.
- Grouping a selection, selecting a group, renaming it, and ungrouping it.
- Naming individual layers and pages.
- Moving individual layers, multi-selections, and groups between pages.
- Fixing text editing so Space, repeated spaces, line breaks, paste, and Khmer IME input work normally.

## Non-goals

- Nested groups in the first release.
- Rotating a group as a whole. Multi-selection frames have no rotate handle today; members keep their own rotation.
- Component instances, masks, frames, or auto layout.
- Cross-document layer movement.
- Changes to effects, outlines, or vector editing.

The Customize sidebar **is** in scope where layer rules reach it: disabled fields for locked layers, a group body, and the header's existing layer-order and delete actions.

## Investigation findings

All verified against the code.

### Text boxes cannot type spaces

The editable text in `EditorElement.jsx` is nested inside an element wrapper with `role="button"`. The wrapper's keyboard handler (`EditorElement.jsx`, the `onKeyDown` on `.editor-element-hit`) calls `preventDefault()` for Space and Enter, including when the event came from the editable text.

The global editor keyboard handler is not the cause; it already ignores `[contenteditable='true']` and `[contenteditable='plaintext-only']`. The canvas Space-to-pan handler in `EditorCanvas.jsx` ignores both too.

Related issues fixed at the same time:

- `useElementDrag.js` listens for `pointerdown` on the same wrapper, so clicking to place the caret while editing starts a canvas drag.
- An editable text control is nested inside an element acting as a button, which gives ambiguous keyboard semantics.
- Pasted text can carry non-breaking spaces. Typing does not add them, because `.editor-text-art` uses `white-space: pre-wrap`.

### Layers cannot be dragged

`EditorLayersPanel.jsx` renders layers as ordinary buttons. It has no drag threshold, pointer capture, drop targets, insertion indicators, auto-scroll, or reorder-on-drop action. Page thumbnails use native HTML drag-and-drop; layers have nothing equivalent.

### Visibility is persisted but has no management UI

Elements store and serialize `visible`, and hidden elements stop rendering. The shape sidebar has an eye in Appearance, but there is no eye in the Layers panel, no group visibility, and no convenient way to find a hidden element.

### Locking is persisted but not enforced

Elements store and serialize `locked`, but nothing reads it. A locked element can be selected, dragged, resized, rotated, nudged, reordered, deleted, restyled, and text-edited.

### Layer shortcuts are advertised but not implemented

`editorMenus.js` and the sidebar's layer-order menu show `]` and `[`, but `useEditorKeyboard.js` has no handler for either.

## Architecture decision

### Preserve the flat artwork array

Keep `page.elements` as the canonical back-to-front render order. Add one-level group metadata instead of converting the editor to a recursive layer tree.

```js
{
  id: "page-1",
  name: "Opening Ceremony",
  groups: [
    { id: "group-1", name: "Header", visible: true, locked: false }
  ],
  elements: [
    { id: "text-1", type: "text", name: "Event title", groupId: "group-1" },
    { id: "shape-1", type: "shape", name: "Purple star", groupId: "group-1" }
  ]
}
```

Group members stay contiguous in `page.elements`. A group's stacking position is the position of that block. Group bounds are derived from members and never stored.

### Required invariants

- An element belongs to zero or one group.
- Group members are contiguous in `page.elements`.
- Creating a group requires at least two elements.
- A group may remain with one element after deletion or movement.
- Empty groups are removed automatically.
- Missing or invalid group references are removed during hydration.
- Element ids are unique across the document; group ids are unique across the document.
- No nested groups in the first release.
- (When `morphKey` lands, v3 plan Phase H) `morphKey` is unique within a page.

`layerModel.js` exports `checkInvariants(document)`, which returns a list of violations. Reducer tests call it after **every** action, so a future reducer cannot silently split a group.

## Phase A: Repair text editing

**Estimate: 0.5–1 day**

### Implementation

- While editing, the wrapper does not apply its button keyboard behaviour: its `onKeyDown` returns early when the event target is inside the editable span.
- Never intercept keys while `event.isComposing` is true (Khmer IME commits a composition with Space).
- Remove `role="button"` and `tabIndex` from the wrapper while editing, so the editable text is not nested in a button.
- Keep Escape as cancel and Command/Ctrl+Enter as commit.
- `useElementDrag.js` ignores `pointerdown` while the element is being edited, or when the target is inside an editable control.
- On commit, replace `\u00A0` (non-breaking space) with a normal space, then strip one trailing newline (the existing `innerText` handling).

### Tests

- `Hello world` can be entered.
- Consecutive spaces are preserved.
- Leading and trailing spaces are preserved (content policy: never trim user text).
- Khmer text and IME composition are not intercepted.
- Line breaks and pasted text are preserved; pasted non-breaking spaces become spaces.
- Space does not select or drag the element; clicking inside text while editing does not start a drag.
- Escape restores the original content.
- Blur creates one committed undo entry.

### Acceptance

Text accepts normal spaces without weakening canvas keyboard selection.

## Phase B: Layer and page data foundation

**Estimate: 1.5–2 days**

### State additions

```js
page.name
page.groups
element.name
element.groupId
```

### Group selection is derived, not stored

There is no `selectedGroupId` field. Every selection change already passes through `setSelection` in `editorSlice.js`, and a separate field would go stale after undo, delete, or a page change.

Instead, selection state carries one editor-only flag, `selectionMode: "group" | "direct"`, which `setSelection` resets to `"direct"` unless the caller passes `"group"`:

- A group is selected when `selectionMode === "group"` and `selectedIds` equals exactly that group's members.
- `selectedGroup(state)` is a selector that returns that group or `null`.
- Undo, redo, loading, and page switching restore `selectedIds` through `setSelection`, so a stale group selection is impossible.

### Pure layer helpers

`layerModel.js`:

- `layerRows`, `groupMembers`, `groupBounds`, `selectionBlocks`
- `reorderBlocks`, `groupSelection`, `ungroupSelection`, `cleanupEmptyGroups`
- `effectiveVisible`, `effectiveLocked`
- `cloneLayers(elements, groups)` — new element ids **and** new group ids, with every `groupId` remapped
- `checkInvariants`

### ID regeneration

Every path that copies elements uses `cloneLayers`:

- `pageCloned` (duplicate page and paste page). Today its `prepare` gives elements new ids but would copy group ids unchanged.
- `selectionPasted` and duplicate (Ctrl+D).

### Acceptance

- Existing ungrouped documents render without visual changes.
- Undo, redo, document loading, and page switching cannot leave a stale group selection.
- Invalid group references cannot crash rendering.
- Duplicating a page with groups produces no duplicate group ids (`checkInvariants` passes).

## Phase C: Page, layer, and group names

**Estimate: 1 day**

### Page names

- Existing unnamed pages show `Page N`.
- New pages receive the next `Page N` name.
- Duplicating `Agenda` produces `Agenda copy`.
- Duplicate names are allowed; menus disambiguate by page number.
- Rename from the page strip, the page context menu, or the Layers-panel page header.

### Layer names

- Individual elements receive an optional `name` that does not change their visible content.
- Fallbacks are computed, never stored: text → truncated content; shape → shape name; timer → `Countdown timer`.
- Groups receive `Group 1`, `Group 2`, and so on.

### Rename behaviour

- Double-click or F2 starts renaming. Enter or blur commits. Escape cancels.
- Empty values restore the previous name. Whitespace is trimmed. Maximum length is 80 characters.
- Each committed rename creates one undo entry (`targetChanged` with an elements or page target).
- Locked layers **can** be renamed (see Phase D).

### Acceptance

All names survive save, reload, duplication, page reordering, and undo.

## Phase D: Visibility and locking

**Estimate: 2–3 days**

### Visibility semantics

```js
effectiveVisible = element.visible !== false && group?.visible !== false
```

- Eye controls appear on element and group rows.
- Group visibility never overwrites individual child visibility; showing a group restores each child's own state.
- Hidden layers remain in the Layers panel and can be selected, renamed, reordered, deleted, or shown from there.
- Hidden layers have no canvas selection frame and cannot be transformed on the canvas.
- Hidden layers **can** be edited from the Customize sidebar (X, Y, fill, and so on), as in Figma.
- Visibility applies consistently in the editor, page thumbnails, and display mode.

### Lock semantics

```js
effectiveLocked = element.locked === true || group?.locked === true
```

- Locked layers cannot be selected by clicking the canvas, by marquee, or by Select all.
- They can be selected from the Layers panel to inspect or unlock them.
- They cannot be dragged, resized, rotated, nudged, reordered, deleted, cut, restyled, or text-edited.
- They **can** be copied, hidden, shown, renamed, or unlocked.
- If any layer in a selection is locked, transform and destructive commands are disabled for the whole selection. Never silently change only the unlocked part.
- Group visibility and locking preserve each child's own flags.

### Enforcement lives in the store

UI disabling is a convenience; the reducers are the protection. A shared guard `isEditable(state, ids)` is checked by every mutating path below. A refused action changes nothing and adds no undo entry.

| Path | File |
|------|------|
| `elementChanged`, `elementsChanged`, `elementTransformed` | `editorSlice.js` |
| `elementNudged`, `elementDeleted` (also Cut: copy + delete) | `editorSlice.js` |
| `elementReordered` and the new layer actions | `editorSlice.js` |
| `selectionAligned`, `selectionDistributed` | `editorSlice.js` |
| `targetChanged`, `editStarted`, `editUpdated` (all sidebar edits) — `validTarget` rejects locked element targets except for `name`, `visible`, `locked` | `editorSlice.js` |
| `gestureStarted` with a locked selection | `editorSlice.js` |
| Canvas click selection and drag start | `useElementDrag.js`, `EditorElement.jsx` |
| Double-click text editing | `EditorElement.jsx` |
| Marquee selection (`elementsInRect`) | `EditorCanvas.jsx`, `elementGeometry.js` |
| Select all (Ctrl+A and context menu) | `useEditorKeyboard.js`, `EditorCanvas.jsx` |
| Resize and rotate handles, keyboard resize and rotate | `EditorSelectionFrame.jsx` |
| Group resize handles | `EditorGroupSelectionFrame.jsx` |
| Context menu items | `editorMenus.js` |

### Customize sidebar

- With a locked selection, every sidebar field is disabled, and the header shows a lock icon with "Locked — unlock to edit".
- The header's Layer order menu and Delete button follow the same rules as Phase F and Phase G.

### Acceptance

- Locking gives real protection: a test dispatches every action in the table against a locked element and checks nothing changed.
- Every hidden layer can be recovered through the Layers panel.

## Phase E: Draggable layer ordering

**Estimate: 2–3 days**

Pointer events, not native HTML drag-and-drop, so mouse, pen, and touch behave the same.

### Drag lifecycle

- Start only after a 5–6px movement threshold.
- Capture the pointer and snapshot the original ordering.
- Show a drag preview and the proposed drop location.
- Commit once on pointer release.
- Escape, pointer cancel, lost pointer capture, or window blur restores the original order.
- One completed drag creates one undo entry.

### Escape order

Layer drag becomes the first step of the order documented in `useEditorKeyboard.js`:

1. Cancel an active layer drag.
2. Cancel the active canvas drag.
3. Close the open pop-up.
4. Leave point editing.
5. Cancel an open inspector edit.
6. Move a child selection up to its group (Phase G).
7. Deselect.

### Drop locations

- Before or after an ungrouped layer.
- Before or after a child inside its group.
- Inside a group.
- Outside a group.

### Visual feedback

- Horizontal insertion line between rows.
- Highlighted group row when dropping inside it.
- Indentation preview.
- Drag preview showing the layer name or selected-layer count.
- Automatic panel scrolling near the top and bottom edges.

### Ordering rules

- Array start is the back; array end is the front. The Layers panel shows the array in reverse.
- A group moves as one contiguous block.
- Multiple selected ungrouped layers move as one block and keep their relative order.
- Dragging into a group assigns `groupId` and inserts at the chosen child position.
- Dragging out of a group clears `groupId`.
- Locked layers and locked groups cannot be dragged.

### Reducer actions

```js
layersReordered({ ids, targetId, placement })        // placement: "before" | "after"
layersMovedIntoGroup({ ids, groupId, targetId, placement })
layersRemovedFromGroup({ ids, targetId, placement })
```

Reducers validate ids and targets rather than trusting UI indexes, and run `cleanupEmptyGroups`.

### Acceptance

The Layers-panel order always matches canvas z-order, including after undo and reload.

## Phase F: Bring and send commands

**Estimate: 1 day**

Bring forward, bring to front, send backward, send to back — through the layer context menu, selection context menu, sidebar header menu, keyboard, and panel buttons.

### Shortcuts

| Key | Command |
|-----|---------|
| `]` | Bring forward |
| `[` | Send backward |
| `Cmd/Ctrl+]` | Bring to front |
| `Cmd/Ctrl+[` | Send to back |

- `]` and `[` are already shown in `editorMenus.js` and the sidebar's layer menu but not handled; this phase makes them work.
- `Cmd+[` and `Cmd+]` are Back and Forward in Chrome and Safari on macOS. The handler calls `preventDefault()` and must be tested in Chrome, Safari, and Opera, with focus on the canvas and in the Layers panel.
- All shortcuts are ignored inside inputs, rename fields, and editable text.

### Rules

- A group is one layer block.
- Multiple sibling layers move together and keep their relative order.
- Children reorder only inside their current group.
- A selection spanning different levels cannot be reordered together.
- Locked selections cannot be reordered.

`elementReordered` is replaced by one generalized action, so every entry point gives the same result.

## Phase G: Group creation and management

**Estimate: 2.5–3.5 days**

### Create a group

Through the Layers-panel Group button, the context menu, and `Cmd/Ctrl+G` (with `preventDefault()`; the browser uses it for Find next).

- At least two elements selected, on the same page, not already in different groups, none locked.
- Members become a contiguous block and keep their relative z-order.
- The group takes the frontmost selected element's position.
- The new group becomes selected and expanded.

### Canvas behaviour

- Clicking a grouped element selects the group (`selectionMode: "group"`).
- Double-clicking or Cmd/Ctrl-clicking deep-selects a child.
- Clicking a child row in the Layers panel selects that child directly.
- Escape moves a child selection up to its group before deselecting.
- Moving or resizing a group updates all members as one undoable gesture. Rotation of the group as a whole is out of scope.

### Customize sidebar: group body

- Header: group icon, group name (renamable), Layer order menu, Delete.
- Sections: Align and Distribute (as for multiple elements), Opacity for all members, and an **Ungroup** button.

### Ungroup

Through the context menu, panel action, sidebar button, and `Cmd/Ctrl+Shift+G`.

- Remove the group metadata and clear members' `groupId`.
- Preserve geometry and order; select the former members.
- One undo entry.

### Copy, duplicate, and delete

- Copying a group copies all members.
- Duplicating and pasting use `cloneLayers`: new group id, new member ids, members stay grouped.
- Deleting a group deletes all members; deleting the final member removes the empty group.
- Undo restores the group, name, members, order, and selection.

## Phase H: Move to a named page

**Estimate: 1–2 days**

`Move to page` in layer and selection context menus:

```text
Move to page
  1 · Opening Ceremony
  2 · Agenda
  3 · Speakers
```

The current page is disabled.

### Move behaviour

- Moving a group transfers its group metadata and every member.
- Moving individual child layers detaches them from their source group.
- Multi-selection keeps relative order.
- Moved layers are inserted at the front of the destination page.
- Ids, geometry, names, visibility, locking, and styles are unchanged.
- **`morphKey`:** if the destination page already has a layer with the same `morphKey`, the moved layer gets a new key; otherwise it keeps its key.
- Empty source groups are removed. Locked layers cannot be moved.
- After the move, switch to the destination page and select the moved result.
- One undo restores both pages, membership, current page, and selection.

## Phase I: Layers-panel styling and accessibility

**Estimate: 1–2 days**

### Visual treatment

- Compact 36–40px rows with group indentation and chevrons.
- Type previews (shapes already use `ShapeArtwork` swatches) or type icons.
- Selected rows use the primary tint; hidden rows reduced opacity; locked rows show a lock.
- Truncated names with the full name in the accessible label.
- Touch-sized eye, lock, and drag controls.

### Tree semantics

- The list is `role="tree"` with `aria-label="Layers"` and `aria-multiselectable="true"`.
- Rows are `role="treeitem"` with `aria-level` (1 or 2), `aria-selected`, and, on groups, `aria-expanded`.
- Children sit in a `role="group"` container under their group row.
- One row is in the tab order at a time (roving `tabIndex`).

### Keyboard

- Arrow Up/Down: move between visible rows.
- Arrow Right: expand group. Arrow Left: collapse group or focus its parent.
- Enter/Space: select. Shift+Arrow or Shift-click: sibling range selection.
- F2: rename. Delete: delete when unlocked.
- Escape: cancel rename or drag, or move selection to the parent group.

Keyboard commands ignore inline rename inputs and editable canvas text.

## API impact

The API work is the backend developer's; this section describes what the frontend will send.

### Short answer

The response envelope does not change. The backdrop document keeps `pages` and `components`. These optional fields are added to **schema version 3**:

- `pages[].name`
- `pages[].groups[]` — `{ uuid, name, visible, locked }`
- `pages[].components[].name`
- `pages[].components[].groupUuid`

`visible` and `locked` already exist on components; only their enforcement is new.

### Field meanings

- `layerIndex` stays the component's index in its **page's** `components` array (back to front), not its index within a group.
- `groupUuid` must refer to a group on the same page.
- Group members are contiguous in `components`. The frontend repairs non-contiguous or dangling groups on load, so the backend may validate but is not required to reorder.

### Example document

```json
{
  "clientSchemaVersion": 3,
  "uuid": "backdrop-1",
  "name": "Annual Conference",
  "pages": [
    {
      "uuid": "page-1",
      "pageNumber": 1,
      "name": "Opening Ceremony",
      "background": { "type": "COLOR", "value": "#FFFFFF" },
      "groups": [
        { "uuid": "group-1", "name": "Header", "visible": true, "locked": false }
      ],
      "components": [
        {
          "uuid": "text-1",
          "type": "TEXT",
          "name": "Event title",
          "groupUuid": "group-1",
          "content": "Annual Technology Conference",
          "position": { "x": 200, "y": 120 },
          "size": { "width": 900, "height": 180 },
          "rotation": 0,
          "layerIndex": 0,
          "visible": true,
          "locked": false,
          "styles": {}
        }
      ]
    }
  ]
}
```

### Requests

The client saves the complete document with `PATCH /api/v1/backdrops/{backdropUuid}`, so the same request carries the new fields. No new endpoint is required, and moving a layer between pages is one atomic save.

### Backward compatibility

All additions are optional:

- Missing page `name` → `Page N`.
- Missing `groups` → `[]`.
- Missing `groupUuid` → ungrouped layer.
- Missing component `name` → generated label.
- Missing `visible` → visible; missing `locked` → unlocked.

The backend should:

- Keep these fields rather than dropping them, and return them on reads.
- Accept documents without them.
- Reject duplicate component uuids and duplicate group uuids.
- Optionally reject a `groupUuid` that does not match a group on the same page.
- Keep applying the existing `version` conflict check.

### Documentation

Update the Notion `backdrop-controller` page in the same change: example page `name` and `groups`, component `name` and `groupUuid`, and business rules for the invariants and `layerIndex`.

## Required test coverage

### Invariants

- `checkInvariants` runs after every action in the reducer test suites.

### Text regression

- Spaces, repeated spaces, Khmer IME, newlines, paste with non-breaking spaces.
- Escape cancellation and blur commit.
- No element drag while editing.

### Ordering and dragging

- Single and multiple layers, group blocks, into and out of groups.
- Auto-scroll and cancelled drags (Escape, pointer cancel, blur).
- Bring/send commands and relative-order preservation.
- Keyboard shortcuts, including `preventDefault` on `Cmd+[` / `Cmd+]` / `Cmd+G`.

### Visibility and locking

- Element and group visibility; child visibility preserved through group hide/show.
- Canvas hit-testing, marquee, and Select all skip locked layers.
- Every path in the Phase D enforcement table refuses a locked target.
- Rename and hide still work on locked layers.
- Save and reload.

### Groups

- Group, rename, transform, ungroup, copy, duplicate, delete, and undo.
- Duplicate page and paste regenerate group ids; empty-group cleanup.

### Pages and API

- Rename, duplicate, and reorder named pages.
- Move an element, selection, and group between pages; `morphKey` collision gets a new key.
- Atomic undo across source and destination pages.
- Old document migration; serialization and hydration of every new field.

## Integration sequence

1. The inspector and edit-session work this plan depends on has landed (`EditorInspector.jsx`, `inspectorEdit.js`, `targetChanged`).
2. Land the Space-key repair and its tests (Phase A).
3. Add the layer model, `cloneLayers`, `checkInvariants`, serialization, hydration, and compatibility tests (Phase B).
4. Add page and layer naming (Phase C).
5. Enforce visibility and locking in the store, then expose controls and sidebar disabled states (Phase D).
6. Implement pointer-based layer dragging and generalized ordering (Phases E–F).
7. Implement grouping, group transforms, and the sidebar group body (Phase G).
8. Implement cross-page movement (Phase H).
9. Complete styling, accessibility, responsive behaviour, full regression testing, and the Notion update (Phase I).

## Final acceptance criteria

- Text boxes accept spaces and IME input normally.
- Layer rows can be dragged with mouse, pen, and touch.
- Panel order always matches canvas z-order.
- Bring/send commands and their shortcuts work for elements, selections, and groups.
- Hidden layers remain recoverable.
- Locked layers are protected across every path in the Phase D table.
- Groups can be created, selected, renamed, transformed, copied, deleted, and ungrouped.
- Pages can be named.
- Elements and complete groups can move safely between pages.
- Every structural command is one predictable undo step.
- `checkInvariants` passes after every action in the test suites.
- Old documents and old API responses remain compatible; the Notion page matches what the editor sends.
