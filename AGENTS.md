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
- **Why it exists:** Make acceptance criteria measurable before implementation. Every new feature (like adding a score counter, obstacles, or player movement) must specify observable inputs, exact values or thresholds where relevant, expected rendering or state changes, and what triggers a game-over state so the result can be verified.

### 4. Performance & Simplicity First
- **Where it applies:** DOM manipulation and Canvas draw calls.
- **Why it exists:** The game should load instantly and run smoothly without heavy external libraries or frameworks. Keep dependencies to absolute zero.

### 5. Changing README.md after features changes
- **Where it applies:** When changing features update README.md.
- **Why it exists:** Keeps README.md updated if added, improved, changed or deleted features that contain features and instructions.

## 🤖 Automated Trigger & Workflow (`ready-for-agent`)

When an Issue in the GitHub repository is labeled with **`ready-for-agent`**, the AI agent must autonomously execute the following pipeline:

### 1. Task Intake
- Read the assigned Issue title, description, and **Acceptance Criteria** (Definition of Done).
- Do not start work if acceptance criteria are missing; instead, post a comment requesting clarification.

### 2. Branch & Workspace Setup
- Create a dedicated isolated Git branch for the task using the naming convention:
  `feature/issue-[ISSUE_NUMBER]` or `fix/issue-[ISSUE_NUMBER]`.

### 3. Implementation
- Write clean, modular code following the project's existing structure for `catwalk-retro-game`.
- Rely strictly on the instructions and project rules defined in this `AGENTS.md` file.

### 4. Verification & Checks
- Test the changes locally (verify that the game loop, rendering, or specific feature works without errors).
- Ensure all acceptance criteria from the issue are fully satisfied.

### 5. Pull Request (PR) Submission
- Push the branch to the remote repository.
- Open a Pull Request referencing the original issue (include `Closes #[ISSUE_NUMBER]` in the PR description).
- Add the ticket link, acceptance criteria checklist, and a brief summary of implemented changes in the PR body so the Qodo reviewer has full context.

## Qodo Review Quality Gate
Before marking any coding task or PR review as complete:
1. Run Qodo Reviewer (for uncommitted staged/unstaged changes) or Review Resolver (for PRs) with the task requirements and implementation decisions as context.
2. Investigate each finding against the codebase and requirements.
3. **Must Fix (Blocking):** Fix every valid **High** and **Medium** finding (across Bugs, Rule violations, and Requirement gaps). Re-run relevant tests/checks and re-run Qodo review after fixes in a loop until zero valid High/Medium issues remain.
4. **Flag Only (Non-Blocking):** Leave **Low** severity findings (such as Low Rule violations or minor informational notes) unchanged in the code, but explicitly list and flag all of them in the final summary for human review.
5. **Disagreements:** If a High or Medium finding is invalid/false positive, do not apply a blind fix—document the disagreement with code or requirement evidence.
6. **Blocker Rule:** If a valid High/Medium issue cannot be resolved, checks fail, or the review loop stops making progress, report the task as **NOT DONE** and explain what human input is needed.