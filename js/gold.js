// gold.js: keeps track of the player's gold
// It has its own file so other buildings in the village can use it later too

import { bump, floatText } from './effects.js';

const goldElement = document.querySelector('#gold');
const goldCounter = document.querySelector('.gold');

let gold = 0;

// Adds gold and updates the counter on the page
export const addGold = (amount) => {
    gold += amount;
    goldElement.textContent = gold;
    bump(goldCounter);
    floatText(goldCounter, `+${amount}`);
    console.log(`+${amount} gold, total: ${gold}`);
};
