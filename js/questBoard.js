// questBoard.js: wanted posters and quest logic go here

import { getMonsterList, getMonster, DND_URL } from './api.js';
import { pickRandom, rollDice } from './utils.js';
import { addGold } from './gold.js';

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

// Builds the HTML for one wanted poster
const createPoster = (monster) => {
    // Not every monster has a picture in the API
    const image = monster.image
        ? `<img src="${DND_URL}${monster.image}" alt="${monster.name}">`
        : `<div class="no-image">?</div>`;

    return `
        <article class="poster">
            <p class="poster-title">Wanted</p>
            ${image}
            <h3>${monster.name}</h3>
            <p>${monster.hit_points} HP | CR ${monster.challenge_rating}</p>
            <p class="reward">Reward: ${calculateReward(monster)} gold</p>
            <button class="accept-button" data-monster="${monster.index}">Accept quest</button>
            <p class="quest-status"></p>
        </article>
    `;
};

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
    const status = poster.querySelector('.quest-status');
    const monster = currentMonsters.find((m) => m.index === button.dataset.monster);

    button.disabled = true;
    button.textContent = 'On a quest...';
    status.textContent = `Your hero heads out to hunt the ${monster.name}...`;
    console.log(`Quest started: ${monster.name} (CR ${monster.challenge_rating})`);

    try {
        const result = await goOnQuest(monster);
        addGold(result.reward);
        status.textContent = `Victory! Rolled ${result.roll} (needed ${result.needed}). +${result.reward} gold`;
        poster.classList.add('won');
        console.log(`Quest won: rolled ${result.roll}, needed ${result.needed}`);
    } catch (failed) {
        status.textContent = `Your hero fled! Rolled ${failed.roll} (needed ${failed.needed}).`;
        poster.classList.add('lost');
        console.log(`Quest lost: rolled ${failed.roll}, needed ${failed.needed}`);
    }

    button.textContent = 'Quest done';
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
