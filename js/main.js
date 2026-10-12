// main.js: the starting point, this file loads everything else

import { rollDice } from './utils.js';
import { getMonsterList, getMonster } from './api.js';

console.log('The tavern is open!');

// Test for step 2: fetch one random monster and log it
// (this gets replaced by the real quest board in step 3)
const testMonsterFetch = async () => {
    try {
        const monsters = await getMonsterList();
        console.log(`Found ${monsters.length} monsters for the quest board`);

        // Pick a random monster from the list
        const randomMonster = monsters[rollDice(monsters.length) - 1];
        const monster = await getMonster(randomMonster.index);

        console.log(monster);
        console.log(`Wanted: ${monster.name} | ${monster.hit_points} HP | CR ${monster.challenge_rating} | ${monster.xp} XP`);
    } catch (error) {
        console.error('The messenger never arrived:', error.message);
    }
};

testMonsterFetch();
