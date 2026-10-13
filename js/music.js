// music.js: the tavern radio, plays medieval and celtic music from the Radio Browser API

import { getStations } from './api.js';

const VOLUME_BY_FIRE = 0.8;    // loud when you sit by the fire
const VOLUME_ELSEWHERE = 0.25; // quiet in the rest of the tavern
const STATION_TIMEOUT = 8000;  // give up on a station after 8 seconds

const audio = new Audio();

const musicBar = document.querySelector('#music-bar');
const stationName = document.querySelector('#station-name');
const nextButton = document.querySelector('#next-station');
const toggleButton = document.querySelector('#music-toggle');

let stations = [];
let stationIndex = -1;
let started = false;

// A Promise that rejects after a number of milliseconds.
// Used with Promise.race, so a station that never starts doesn't keep us waiting forever.
const giveUpAfter = (ms) => new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Station took too long')), ms);
});

// Tries the next station. If it doesn't work, it tries the one after that, and so on.
const playNextStation = async () => {
    for (let tries = 0; tries < stations.length; tries++) {
        stationIndex = (stationIndex + 1) % stations.length;
        const station = stations[stationIndex];
        stationName.textContent = `${station.name} (tuning...)`;

        try {
            audio.src = station.url;
            // audio.play() gives back a Promise: it resolves when the music really starts
            await Promise.race([audio.play(), giveUpAfter(STATION_TIMEOUT)]);
            stationName.textContent = station.name;
            console.log(`Now playing: ${station.name}`);
            return;
        } catch (error) {
            console.warn(`${station.name} doesn't work (${error.message}), trying the next one`);
        }
    }

    throw new Error('None of the stations work right now');
};

// Starts the music the first time you sit down by the fire
const startMusic = async () => {
    started = true;
    musicBar.hidden = false;
    stationName.textContent = 'tuning the radio...';

    try {
        if (stations.length === 0) {
            stations = await getStations();
            console.log(`Found ${stations.length} tavern radio stations`);
        }
        await playNextStation();
    } catch (error) {
        console.error('Music failed:', error.message);
        stationName.textContent = 'nothing, the musicians are on a break';
        started = false; // so it tries again next time you sit down
    }
};

// Gets called every time you walk somewhere (see initCamera in main.js)
export const updateMusic = (view) => {
    audio.volume = view === 'fireplace' ? VOLUME_BY_FIRE : VOLUME_ELSEWHERE;

    if (view === 'fireplace' && !started) {
        startMusic();
    }
};

// Starts the buttons of the music bar
export const initMusic = () => {
    nextButton.addEventListener('click', async () => {
        nextButton.disabled = true;
        try {
            await playNextStation();
        } catch (error) {
            stationName.textContent = 'nothing, the musicians are on a break';
        } finally {
            nextButton.disabled = false;
        }
    });

    toggleButton.addEventListener('click', () => {
        audio.muted = !audio.muted;
        toggleButton.textContent = audio.muted ? 'Unmute' : 'Mute';
    });
};
