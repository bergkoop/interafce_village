// gold.js: keeps track of the player's gold
// It has its own file so other buildings in the village can use it later too

const goldElement = document.querySelector('#gold');

let gold = 0;

// Adds gold and updates the counter on the page
export const addGold = (amount) => {
    gold += amount;
    goldElement.textContent = gold;
    console.log(`+${amount} gold, total: ${gold}`);
};
