import { bump, floatText } from './effects.js';

const goldElement = document.querySelector('#gold');
const goldCounter = document.querySelector('.gold');

let gold = 0;

export const addGold = (amount) => {
    gold += amount;
    goldElement.textContent = gold;
    bump(goldCounter);
    floatText(goldCounter, `+${amount}`);
    console.log(`+${amount} gold, total: ${gold}`);
};
