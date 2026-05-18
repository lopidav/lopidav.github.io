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
Current Game State (state object)

Networking: Deterministic host resolution based on Peer ID.
Phase Flow: LOBBY -> INITIAL_DRAFT -> RPS <-> BONUS_DRAFT -> END.
Catch-up Mechanic: Every time a player crosses an even score (2, 4, 6, 8), the opponent receives bonusDrafts.
Multi-move Support: "Speedesis" allows players to queue multiple moves per round, which are resolved in "mini-rounds."
Recent Major Implementation Details

Consolidated Drafting: All card acquisitions (local, network, or "Timesis" re-simulations) are routed through executeDraftSelection(). This ensures card effects (like Regressesis or Soulesis) trigger identically regardless of who picked them or how.
Authoritative Timers (Gastroenteresis):
Each player’s game is authoritative over their own timer.
If a player's timer hits 0, they send a TIME_OUT network message.
The opponent's view of the timer is purely cosmetic but is synchronized via TIMER_SYNC every 10 seconds.
Timesis Engine: Allows players to change a past move or draft. The game then enters isFastForwarding mode, resets the state to the beginning, and re-simulates the entire match using master move/draft logs to reach the new "Present."
Recent Card Changes:
Poisonesis (20): Retroactive point reduction based on scissors played.
Gravitesis (21): Inverts point gain into point loss if the card owner plays Rock.
Durablesis (5): Replaced "Invisibilesis." Halves opponent points if the owner plays Rock.
Card Reference Summary

Score Modifiers: Intelegenesis (Paper x2), Strengthesis (Rock +2), Poisonesis (Retro-Scissors penalty).
Transformation: Telekinesis (Paper -> Rock), Magnetesis (Scissors -> Rock), Pyrokinesis (Win vs Paper).
Rule Breakers: Lesbianesis (Win on Draw), Speedesis (Double Moves), Agrokinesis (Flower move), Durablesis (Shield/Half points).
Reality Warpers: Soulesis (Swap everything), Timesis (Change the past), Regressesis (Reset scores).
Next Steps / Ideas

Refactor resolveRoundSequence to reduce complexity.