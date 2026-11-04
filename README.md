# CATWALK // Arcade

CATWALK is a small retro-style browser arcade game starring an upright black-and-white cat. The cat can wander freely across an open grid map, with simple standing and walking animations that respond to movement.

## Play

Open `index.html` in a modern web browser. No build step, server, or dependency installation is required.

Use the arrow keys to move:

- **Up**: move north
- **Down**: move south
- **Left**: move west
- **Right**: move east

The cat can explore the entire blank map and is kept inside its visible boundaries.

Collect the occasional items to increase the score:

- **Fish**: +100 points
- **Milk**: +150 points

The game also includes synthesized retro sound effects: footsteps play while the cat walks, and each collectible has its own pickup chime. Sound starts after the first arrow-key press because browsers block audio before user interaction.

One fish and one milk spawn every 3 seconds. Spawned items stay on the map until the cat collects them.

Use the **Mute Audio** button in the game HUD or pause menu to mute and unmute sound effects.

Press **Esc** or the **Pause** button to open the pause menu. The pause menu freezes movement, animation, item timers, and score activity; choose **Resume Game** or press **Esc** again to continue.

## Files

- `index.html` - game layout and interface
- `styles.css` - retro arcade styling and responsive layout
- `game.js` - canvas rendering, movement, animation, and keyboard controls

## Style

The game uses a monochrome CRT-inspired palette, grid-based open terrain, pixelated rendering, and an arcade HUD. The cat is drawn directly on the HTML canvas, so the game does not need external image assets.