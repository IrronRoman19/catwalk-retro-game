---
name: offline-and-dom-integrity
description: Verify that catwalk-retro-game stays 100% offline, safely handles localStorage, and keeps all DOM element IDs in game.js synchronized with index.html. Use after editing index.html, game.js, or styles.css before committing.
---

# Offline & DOM Integrity Check

## Context & Inputs
- **Project:** `catwalk-retro-game` (zero-dependency offline HTML5 Canvas + Vanilla JS game).
- **Target files:** `index.html`, `game.js`, `styles.css` in the repository root.

## Stop Conditions (Ask Human Before Continuing)
Stop immediately and ask the user for clarification if:
1. Any of `index.html`, `game.js`, or `styles.css` is missing from the expected root path.
2. An external `http://` or `https://` URL is found in game code and it is unclear whether it was intentionally requested.
3. A dynamic ID lookup (`getElementById` with a variable/template string) cannot be statically verified against `index.html`.

## Ordered Verification Steps
1. **Syntax & Diff Check:**
   Run `node --check game.js` and `git diff --check` to ensure valid JS syntax and clean whitespace.
2. **Offline Independence Check:**
   Search `index.html`, `game.js`, and `styles.css` for `http://`, `https://`, `fetch(`, or `XMLHttpRequest` (e.g., via `grep -rnE "https?://|fetch\(|XMLHttpRequest" index.html game.js styles.css`). Verify zero external runtime/asset dependencies exist.
3. **Storage Safety Check:**
   Search `game.js` for `localStorage` (`grep -rn "localStorage" game.js`) and inspect surrounding lines to confirm every read/write is wrapped in a `try { ... } catch` block.
4. **DOM ID Synchronization Check:**
   Extract all static `document.getElementById('...')` / `document.getElementById("...")` calls from `game.js` and verify each ID exists in `index.html` (`grep -rn 'id="' index.html`).

## Required Evidence Output
Do not report "all checks passed" without proof. Output a structured report containing:
- Exact commands executed and their raw stdout/exit status.
- A table mapping each `getElementById` call in `game.js` to its matching line in `index.html`.
- Exact line numbers for any `localStorage` usage and its `try/catch` guard.