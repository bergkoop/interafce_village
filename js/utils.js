// utils.js: small helper functions that other files can use

// Rolls a dice with the given number of sides, e.g. rollDice(20) gives 1 to 20
export const rollDice = (sides) => Math.floor(Math.random() * sides) + 1;
