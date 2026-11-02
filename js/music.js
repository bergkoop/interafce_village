
import { getStations } from './api.js';

const VOLUME_BY_FIRE = 0.8;    
const VOLUME_ELSEWHERE = 0.25; 
const STATION_TIMEOUT = 8000;  

const audio = new Audio();

const musicBar = document.querySelector('#music-bar');
const stationName = document.querySelector('#station-name');
const nextButton = document.querySelector('#next-station');
const toggleButton = document.querySelector('#music-toggle');

let stations = [];
let stationIndex = -1;
let started = false;

const giveUpAfter = (ms) => new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('Station took too long')), ms);
});

const playNextStation = async () => {
    for (let tries = 0; tries < stations.length; tries++) {
        stationIndex = (stationIndex + 1) % stations.length;
        const station = stations[stationIndex];
        stationName.textContent = `${station.name} (tuning...)`;

        try {
            audio.src = station.url;
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
        started = false;
    }
};

export const updateMusic = (view) => {
    audio.volume = view === 'fireplace' ? VOLUME_BY_FIRE : VOLUME_ELSEWHERE;

    if (view === 'fireplace' && !started) {
        startMusic();
    }
};

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
