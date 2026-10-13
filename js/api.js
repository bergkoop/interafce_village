// api.js: all fetch functions (D&D API and JokeAPI) go here
// These functions only fetch data. If something goes wrong they throw an error,
// and the file that calls them catches it with try/catch.

export const DND_URL = 'https://www.dnd5eapi.co';

// Only monsters with these challenge ratings, so no impossible dragons
const QUEST_LEVELS = '1,2,3,4,5';

// Gets a list of monsters (each one only has index, name and url)
export const getMonsterList = async () => {
    const response = await fetch(`${DND_URL}/api/2014/monsters?challenge_rating=${QUEST_LEVELS}`);

    if (!response.ok) {
        throw new Error(`Could not load the monster list (status ${response.status})`);
    }

    const data = await response.json();
    return data.results;
};

// Gets all details of one monster, e.g. getMonster('owlbear')
export const getMonster = async (index) => {
    const response = await fetch(`${DND_URL}/api/2014/monsters/${index}`);

    if (!response.ok) {
        throw new Error(`Could not find monster "${index}" (status ${response.status})`);
    }

    return await response.json();
};

// Gets a random two-part pun (setup + punchline) from JokeAPI
// safe-mode makes sure there are no rude jokes
export const getJoke = async () => {
    const response = await fetch('https://v2.jokeapi.dev/joke/Pun?safe-mode&type=twopart');
    const data = await response.json();

    // JokeAPI sends error: true when something went wrong
    if (!response.ok || data.error) {
        throw new Error('Could not get a joke from JokeAPI');
    }

    return data;
};

// ---------- Radio Browser API (music) ----------

const RADIO_URL = 'https://de1.api.radio-browser.info/json/stations/bytag';

// Stations with these tags don't fit a cozy tavern
const UNWANTED_TAGS = ['goth', 'metal', 'industrial', 'punk', 'ebm', 'religious'];

// Gets the most popular working radio stations with one tag, e.g. 'medieval'
const getStationsByTag = async (tag) => {
    const response = await fetch(`${RADIO_URL}/${tag}?hidebroken=true&order=votes&reverse=true&limit=20`);

    if (!response.ok) {
        throw new Error(`Could not load ${tag} stations (status ${response.status})`);
    }

    return await response.json();
};

// Gets medieval and celtic stations at the same time, and keeps only the ones that fit the tavern
export const getStations = async () => {
    const [medieval, celtic] = await Promise.all([
        getStationsByTag('medieval'),
        getStationsByTag('celtic'),
    ]);

    return [...medieval, ...celtic]
        // https only, otherwise the browser blocks the stream on a https website
        .filter((station) => station.url_resolved.startsWith('https'))
        .filter((station) => !UNWANTED_TAGS.some((tag) => station.tags.includes(tag)))
        .map((station) => ({ name: station.name.trim(), url: station.url_resolved }));
};
