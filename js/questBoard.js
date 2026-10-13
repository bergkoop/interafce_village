// questBoard.js: wanted posters and quest logic go here

import { getMonsterList, getMonster, DND_URL } from './api.js';
import { pickRandom, rollDice } from './utils.js';
import { addGold } from './gold.js';
import { flipCard, addTilt } from './effects.js';

const POSTER_AMOUNT = 3;
const QUEST_TIME = 3000;      // how long a quest takes, in milliseconds
const BASE_DIFFICULTY = 8;    // roll needed to win = 8 + challenge rating

const questsElement = document.querySelector('#quests');
const newQuestsButton = document.querySelector('#new-quests');

// The monster list only gets fetched once, after that we reuse it
let monsterList = [];

// The monsters that are on the board right now
let currentMonsters = [];

// Reward in gold depends on how strong the monster is
const calculateReward = (monster) => monster.challenge_rating * 100;

// The front of a poster: the monster and the reward
const posterFront = (monster) => {
    // Not every monster has a picture in the API
    const image = monster.image
        ? `<img src="${DND_URL}${monster.image}" alt="${monster.name}">`
        : `<div class="no-image">?</div>`;

    return `
        <p class="poster-title">Wanted</p>
        ${image}
        <h3>${monster.name}</h3>
        <p>${monster.hit_points} HP | CR ${monster.challenge_rating}</p>
        <p class="reward">Reward: ${calculateReward(monster)} gold</p>
    `;
};

// The back of a poster, while your hero is out hunting
const posterBack = (monster) => `
    <p class="poster-title">On a quest</p>
    <div class="dice">20</div>
    <p>Your hero is hunting the ${monster.name}...</p>
`;

// The front again after the quest, with a big stamp on it
const posterResult = (monster, stamp, text) => `
    ${posterFront(monster)}
    <p class="quest-status">${text}</p>
    <span class="stamp">${stamp}</span>
`;

// Builds the HTML for one wanted poster.
// .poster hangs crooked on the board, .poster-face is the part that flips.
const createPoster = (monster) => `
    <article class="poster">
        <div class="poster-face">
            ${posterFront(monster)}
            <button class="accept-button wood-button" data-monster="${monster.index}">Accept quest</button>
        </div>
    </article>
`;

// Fetches 3 random monsters and puts them on the board
const loadQuests = async () => {
    questsElement.innerHTML = '<p>The innkeeper is pinning up new posters...</p>';
    newQuestsButton.disabled = true;

    try {
        if (monsterList.length === 0) {
            monsterList = await getMonsterList();
        }

        const picked = pickRandom(monsterList, POSTER_AMOUNT);

        // Promise.all fetches all 3 monsters at the same time instead of one by one
        currentMonsters = await Promise.all(picked.map((monster) => getMonster(monster.index)));
        console.log('New quests:', currentMonsters.map((monster) => monster.name));

        questsElement.innerHTML = currentMonsters.map(createPoster).join('');
        questsElement.querySelectorAll('.poster').forEach((poster) => addTilt(poster));
    } catch (error) {
        console.error('Loading quests failed:', error.message);
        questsElement.innerHTML = '<p>The messenger never arrived. Try again later.</p>';
    } finally {
        // finally always runs, whether it worked or not
        newQuestsButton.disabled = false;
    }
};

// The quest itself: a Promise that takes a few seconds.
// resolve = the hero wins, reject = the hero flees
const goOnQuest = (monster) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const roll = rollDice(20);
            const needed = BASE_DIFFICULTY + monster.challenge_rating;

            if (roll >= needed) {
                resolve({ roll, needed, reward: calculateReward(monster) });
            } else {
                reject({ roll, needed });
            }
        }, QUEST_TIME);
    });
};

// Runs when you click "Accept quest" on a poster
const startQuest = async (button) => {
    const poster = button.closest('.poster');
    const face = poster.querySelector('.poster-face');
    const monster = currentMonsters.find((m) => m.index === button.dataset.monster);

    button.disabled = true;
    console.log(`Quest started: ${monster.name} (CR ${monster.challenge_rating})`);

    // Flip the poster over: the back shows that your hero is out hunting
    await flipCard(face, () => {
        face.innerHTML = posterBack(monster);
    });

    try {
        const result = await goOnQuest(monster);
        console.log(`Quest won: rolled ${result.roll}, needed ${result.needed}`);

        // Flip back to the front, now with a SLAIN stamp. The gold comes in halfway the flip.
        await flipCard(face, () => {
            poster.classList.add('won');
            face.innerHTML = posterResult(monster, 'Slain', `Rolled ${result.roll}, needed ${result.needed}. +${result.reward} gold!`);
            addGold(result.reward);
        });
    } catch (failed) {
        console.log(`Quest lost: rolled ${failed.roll}, needed ${failed.needed}`);

        await flipCard(face, () => {
            poster.classList.add('lost');
            face.innerHTML = posterResult(monster, 'Fled', `Rolled ${failed.roll}, needed ${failed.needed}. Your hero ran away!`);
        });
    }
};

// Starts the quest board
export const initQuestBoard = () => {
    newQuestsButton.addEventListener('click', loadQuests);

    // One click listener on the whole board instead of one per button.
    // This keeps working when new posters get added.
    questsElement.addEventListener('click', (event) => {
        if (event.target.classList.contains('accept-button')) {
            startQuest(event.target);
        }
    });

    loadQuests();
};
