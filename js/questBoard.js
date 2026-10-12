// questBoard.js: wanted posters and quest logic go here

import { getMonsterList, getMonster, DND_URL } from './api.js';
import { pickRandom } from './utils.js';

const POSTER_AMOUNT = 3;

const questsElement = document.querySelector('#quests');
const newQuestsButton = document.querySelector('#new-quests');

// The monster list only gets fetched once, after that we reuse it
let monsterList = [];

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
        const monsters = await Promise.all(picked.map((monster) => getMonster(monster.index)));
        console.log('New quests:', monsters.map((monster) => monster.name));

        questsElement.innerHTML = monsters.map(createPoster).join('');
    } catch (error) {
        console.error('Loading quests failed:', error.message);
        questsElement.innerHTML = '<p>The messenger never arrived. Try again later.</p>';
    } finally {
        // finally always runs, whether it worked or not
        newQuestsButton.disabled = false;
    }
};

// Starts the quest board
export const initQuestBoard = () => {
    newQuestsButton.addEventListener('click', loadQuests);
    loadQuests();
};
