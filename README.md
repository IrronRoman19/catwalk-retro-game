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
- **Water**: +150 points

The game also includes synthesized retro sound effects: footsteps play while the cat walks, and each collectible has its own pickup chime. Sound starts after the first arrow-key press because browsers block audio before user interaction.

One fish and one water item spawn immediately at game start. After a restart, one randomly selected fish or water item spawns immediately. After that, exactly one randomly selected fish or water item spawns at one random location every 4 seconds; the animation loop does not add food. Fish are white and water is blue; spawned items stay on the map until the cat collects them. The HUD displays how many food items the cat has received.

Use the **Mute Audio** button in the game HUD or pause menu to mute and unmute sound effects.

Press **Esc** or the **Pause** button to open the pause menu. The pause menu freezes movement, animation, item timers, and score activity; choose **Resume Game** or press **Esc** again to continue.

The cat starts with 100 HP. A poisoned mushroom appears every 15 seconds; touching one removes 25 HP and the mushroom disappears. When health reaches 0, the game ends and shows the final score and food count. Select **Play Again** to reset the entire session.

Poisoned mushrooms spawn at least 3 map blocks (120 pixels) from the cat. Contact plays a damage sound, and reaching 0 HP plays a distinct game-over sound. These sounds follow the mute control.

## Files

- `index.html` - game layout and interface
- `styles.css` - retro arcade styling and responsive layout
- `game.js` - canvas rendering, movement, animation, and keyboard controls

## Style

The game uses a CRT-inspired dark-green board, grid-based open terrain, pixelated rendering, and a bold color-coded arcade HUD. The cat is drawn directly on the HTML canvas, so the game does not need external image assets.