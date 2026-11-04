# AGENTS.md — Project Guidelines for Catwalk Retro Game

## 🕹️ Project Overview
**Catwalk Retro Game** — a retro-style 2D arcade/browser game built with clean vanilla HTML5, CSS3, and JavaScript. The project focuses on lightweight performance, nostalgic retro visuals, and modular game loops.

---

## 🛠️ Setup & Verification Commands
- **Run locally:** Open `index.html` directly in a browser or use a local dev server (e.g., Live Server in VS Code).
- **Testing/Linting:** No complex build steps required; pure vanilla JS.

---

## 📜 Project Rules & Standards

### 1. The Modular Game Loop Rule
- **Where it applies:** All JavaScript game logic (`/js` or main script files).
- **Why it exists:** Keeps the game architecture clean. Separate game states (menu, playing, game over) into distinct functions or modules rather than writing massive monolithic scripts.

### 2. Retro Visual Consistency (No Mystery Colors)
- **Where it applies:** CSS styles and Canvas rendering.
- **Why it exists:** To maintain an authentic 8-bit/16-bit retro aesthetic. Always stick to a predefined retro color palette (e.g., high-contrast pixel colors) and avoid modern smooth gradients or random modern hex codes unless specified.

### 3. Clear Acceptance Criteria for AI Tickets
- **Where it applies:** When prompting coding agents or creating new feature tasks.
- **Why it exists:** Every new feature (like adding a score counter, obstacles, or player movement) must include explicit boundaries: expected input, rendering behavior, and what triggers a game-over state.

### 4. Performance & Simplicity First
- **Where it applies:** DOM manipulation and Canvas draw calls.
- **Why it exists:** The game should load instantly and run smoothly without heavy external libraries or frameworks. Keep dependencies to absolute zero.

### 5. Changing README.md after features changes
- **Where it applies:** When changing features update README.md.
- **Why it exists:** Keeps README.md updated if added, improved, changed or deleted features that contain features and instructions.