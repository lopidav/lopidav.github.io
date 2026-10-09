// --- 1. Game Data Setup ---
const WIN_SCORE = 8;
const DRAFT_OPTIONS_COUNT = 3;

// Asset Storage
const sounds = {
    win: new Audio('audio/win.mp3'),
    lose: new Audio('audio/lose.mp3'),
    draft: new Audio('audio/draft.mp3')
};
const icons = {
    rock: `<svg viewBox="0 0 24 24"><path d="M 4,11.5 7,21 h 10 l 0.90313,-8.549666 -5.759486,-2.316928 0.889052,-2.0470199 2.61902,-1.5171386 -1.353541,2.5818917 5.695719,2.4802158 -0.900172,5.518491 L 22,12 18,5 15.5,3 9.5527273,4.8836364"/></svg>`,
    paper: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
    scissors: `<svg viewBox="0 0 24 24"><path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1l-9.64-9.64zM6 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0 12c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z"/></svg>`,
    card: `<svg viewBox="0 0 24 24"><rect x="2" y="6" width="5" height="12" rx="1"/><rect x="17" y="6" width="5" height="12" rx="1"/><rect x="8" y="3" width="8" height="18" rx="1"/></svg>`,
    flower: `<svg viewBox="0 0 24 24"><path d="M18.7 12.4c-.28-.16-.57-.29-.86-.4.29-.11.58-.24.86-.4 1.92-1.11 2.99-3.12 2.14-5.16-.9-2.15-3.36-2.65-5.26-1.55-.28.16-.57.29-.86.4-.29-.11-.58-.24-.86-.4-1.92-1.11-4.28-.6-5.26 1.55-.85 2.04.22 4.05 2.14 5.16.28.16.57.29.86.4-.29.11-.58.24-.86.4-1.92 1.11-2.99 3.12-2.14 5.16.9 2.15 3.36 2.65 5.26 1.55.28-.16.57-.29.86-.4.29.11.58.24.86.4 1.92 1.11 4.28.6 5.26-1.55.85-2.04-.22-4.05-2.14-5.16zm-6.7 1.1c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`
};
const BROKEN_ICON = `<svg viewBox="0 0 24 24"><path d="M3 3L21 21M21 3L3 21" stroke="#e74c3c" stroke-width="4" stroke-linecap="round"/></svg>`;

// Define Superpower Cards
const SUPERPOWER_CARDS = [
    {
        id: 1,
        name: "Intelegenesis",
        art: "https://picsum.photos/seed/brain/150/150",
        effect: "If you win with paper - you win two times the points."
    },
    {
        id: 2,
        name: "Lesbianesis",
        art: "https://picsum.photos/seed/scissors/150/150",
        effect: "If you and your opponent both scissor - you win the round."
    },
    {
        id: 3,
        name: "Invincibilesis",
        art: "https://picsum.photos/seed/rock/150/150",
        effect: "If you played a rock - your opponent can't win this round."
    },
    {
        id: 4,
        name: "Telekinesis",
        art: "https://picsum.photos/seed/telekinesis/150/150",
        effect: "If opponent threw paper and you aren't winning - transform that paper into rock."
    },
    {
        id: 5,
        name: "Invisibilesis",
        art: "https://picsum.photos/seed/invisible/150/150",
        effect: "Opponent can't see your points, your cards, what you played or if you're doing a move or choosing a new card."
    },
    {
        id: 6,
        name: "Speedesis",
        art: "https://picsum.photos/seed/speed/150/150",
        effect: "For you there are two rounds in each round. (For your opponent it's the same number of rounds per round.)"
    },
    {
        id: 7,
        name: "Pacifesis",
        art: "https://picsum.photos/seed/peace/150/150",
        effect: "When 2 rounds in a row you play Paper and nobody gets a point (or a fraction) - win the entire match."
    },
    {
        id: 8,
        name: "Thiefesis",
        art: "https://picsum.photos/seed/thief/150/150",
        effect: "Next time your opponent gets a card - steal it, then this deletes itself."
    },
    {
        id: 9,
        name: "Regressesis",
        art: "https://picsum.photos/seed/regress/150/150",
        effect: "Reset the points but not the cards."
    },
    {
        id: 10,
        name: "Strengthesis",
        art: "https://picsum.photos/seed/strength/150/150",
        effect: "If you win points with a rock you get 2 extra points."
    },
    {
        id: 11,
        name: "Intangibilitesis",
        art: "https://picsum.photos/seed/intangible/150/150",
        effect: "If your opponent played a rock - they can't win this round."
    },
    {
        id: 12,
        name: "Precognitionesis",
        art: "https://picsum.photos/seed/precog/150/150",
        effect: "You can see your and the opponent's future card options."
    },
    {
        id: 13,
        name: "Pyrokinesis",
        art: "https://picsum.photos/seed/pyro/150/150",
        effect: "All your moves beside paper win against the opponent's paper."
    },
    {
        id: 14,
        name: "Magnetesis",
        art: "https://picsum.photos/seed/magnet/150/150",
        effect: "If opponent threw scissors and you aren't winning - transform that scissors into rock."
    },
    {
        id: 15,
        name: "Adaptesis",
        art: "https://picsum.photos/seed/adapt/150/150",
        effect: "After a round - get an extra point for each time the same round happened in this game before."
    },
    {
        id: 16,
        name: "Soulesis",
        art: "https://picsum.photos/seed/soul/150/150",
        effect: "Swap places with your opponent then destroy this card."
    },
    {
        id: 17,
        name: "Timesis",
        art: "https://picsum.photos/seed/time/150/150",
        effect: "Change one of your choices in the past."
    },
    {
        id: 18,
        name: "Agrokinesis",
        art: "https://picsum.photos/seed/flower/150/150",
        effect: "Add a new move called Flower to your moveset. It wins against Paper and Rock but loses to Scissors."
    },
    {
        id: 19,
        name: "Gastroenteresis",
        art: "https://picsum.photos/seed/stomach/150/150",
        effect: "Your opponent gets a timer of 90 seconds. When it ticks down to 0 they lose the match. When they play a paper it adds 10 seconds to their timer."
    },
    ...Array.from({ length: 2 }, (_, i) => ({
        id: i + 20,
        name: `Power ${i + 20}`,
        art: `https://picsum.photos/seed/${i + 20}/150/150`,
        effect: `This is a powerful placeholder effect for Power ${i + 20}. When you read this, imagine immense cosmic power.`
    }))
];