// bard.js: the bard and his jokes

import { getJoke } from './api.js';
import { wait } from './utils.js';
import { pop } from './effects.js';

const PUNCHLINE_DELAY = 2000; // pause before the punchline, in milliseconds

const setupElement = document.querySelector('#bard-setup');
const punchlineElement = document.querySelector('#bard-punchline');
const bardButton = document.querySelector('#bard-button');
const bubble = document.querySelector('.speech-bubble');

// Fetches a joke and tells it: setup first, punchline a bit later
const tellJoke = async () => {
    bardButton.disabled = true;
    setupElement.textContent = 'The bard clears his throat...';
    punchlineElement.textContent = '';

    try {
        const joke = await getJoke();
        setupElement.textContent = joke.setup;
        pop(bubble);

        await wait(PUNCHLINE_DELAY);
        punchlineElement.textContent = joke.delivery;
        pop(punchlineElement);
        console.log(`The bard told joke #${joke.id}`);
    } catch (error) {
        console.error('The bard forgot his joke:', error.message);
        setupElement.textContent = 'The bard forgot the words. Try again later.';
    } finally {
        bardButton.disabled = false;
    }
};

// Starts the bard
export const initBard = () => {
    bardButton.addEventListener('click', tellJoke);
};
