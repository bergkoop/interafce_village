
export const rollDice = (sides) => Math.floor(Math.random() * sides) + 1;

export const pickRandom = (list, amount) => {
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, amount);
};

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
