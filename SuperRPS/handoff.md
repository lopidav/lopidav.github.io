do not change this file unless asked to

📄 Project Handoff: Superpower RPS
Project Overview A real-time, 1v1 multiplayer Rock-Paper-Scissors game featuring "Superpowers" (cards) that alter game rules, scores, and time. Built with Vanilla JS and PeerJS for P2P networking.

Core Files

index.html: Game layout and modal structures.
style.css: UI styling, including floating timers and clash animations.
js/data.js: Card definitions (ID 1-21) and SVG assets.
js/ui.js: Visual updates, point animations, and DOM references.
js/network.js: PeerJS handling and authoritative message synchronization.
js/game.js: State machine, RPS resolution logic, and the "Timesis" timeline-rebuilding engine.
Current Game State

Networking: Deterministic host resolution based on Peer ID.
Phase Flow: LOBBY -> INITIAL_DRAFT -> RPS <-> BONUS_DRAFT -> END.
Catch-up Mechanic: Every time a player crosses an even score (2, 4, 6, 8), the opponent receives bonusDrafts.
Multi-move Support: "Speedesis" allows players to queue multiple moves per round, which are resolved in "mini-rounds."
Recent Major Implementation Details

Consolidated Drafting: All card acquisitions (local, network, or "Timesis" re-simulations) are routed through `executeDraftSelection()`. This ensures card effects (like Regressesis or Soulesis) trigger identically regardless of who picked them or how.
Card Toggles: `SUPERPOWER_CARDS` now contain an `enabled` boolean. Disabled cards are filtered out of random drafts but appear grayed out in the F2 debug menu.
Visual Feedback: Added `animated-point lost` particles (red) for point reduction and `conic-gradient` logic in `ui.js` to visualize fractional points on score dots.
Firefox Compatibility: Network invite links now use a split `baseUrl` logic to prevent "null" origins when running on local protocols (`file://`).
Authoritative Timers (Gastroenteresis):
Each player’s game is authoritative over their own timer.
If a player's timer hits 0, they send a TIME_OUT network message.
The opponent's view of the timer is purely cosmetic but is synchronized via TIMER_SYNC every 10 seconds.
Timesis Engine: Allows players to change a past move or draft. The game then enters `isFastForwarding` mode, resets the state to the beginning, and re-simulates the entire match using master move/draft logs to reach the new "Present."
Persistent Queues (Flexesis): Introduced move objects that track `roundAdded`. Flexesis allows move queues to persist across rounds and grants a point bonus based on how many rounds a move was "planned" in advance.
Recent Card Changes:
Poisonesis (20): Retroactive point reduction based on scissors played.
Gravitesis (21): If the owner plays Rock, any points they would have gained are instead subtracted from the opponent.
Invisibilesis (5): Hides the owner's cards, score, and move queue from the opponent.
Durablesis (3): Halves the opponent's point gain if the owner plays Rock.
Card Reference Summary

Score Modifiers: Intelegenesis (Paper x2), Strengthesis (Rock +2), Poisonesis (Retro-Scissors penalty), Gravitesis (Rock point inversion).
Transformation: Telekinesis (Paper -> Rock), Magnetesis (Scissors -> Rock), Pyrokinesis (Win vs Paper).
Rule Breakers: Lesbianesis (Win on Draw), Speedesis (Double Moves), Agrokinesis (Flower move), Durablesis (Half points), Invisibilesis (Stealth).
Reality Warpers: Soulesis (Swap everything), Timesis (Change the past), Regressesis (Reset scores), Flexesis (Persistent Planning).
Next Steps / Ideas

Refactor resolveRoundSequence to reduce complexity.