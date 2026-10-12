// utils.js: small helper functions that other files can use

// Rolls a dice with the given number of sides, e.g. rollDice(20) gives 1 to 20
export const rollDice = (sides) => Math.floor(Math.random() * sides) + 1;

// Picks a number of random items from a list, without picking the same one twice
export const pickRandom = (list, amount) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, amount);
};

// Waits a number of milliseconds, use it with await: await wait(2000)
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
